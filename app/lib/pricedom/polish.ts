/** 대필 공용 계층 — 4개 라우트(rx/arx/hrx/frx)가 공유.
 * 계약:
 * - 수치·법 조항·항목명은 템플릿이 결정론적으로 만든다. 모델은 문장만 다듬는다.
 * - 모델 출력은 **전부 받은 뒤 검증**하고(preservesFacts), 숫자나 법 조항이 하나라도
 *   달라지면 그 응답을 버리고 템플릿을 그대로 내보낸다. 검증 전에는 한 글자도 내보내지
 *   않는다 — 틀린 수치를 먼저 스트리밍한 뒤 교체하는 설계를 쓰지 않기 위해서다.
 *   (대가: 토큰 단위 점진 표시가 사라지고 완성 후 한 번에 도착한다. 문서가 1200토큰
 *    이하로 짧아 감수한다. 클라이언트는 그대로 ReadableStream으로 읽는다.)
 * - LLM이 꺼져 있거나(JEGAP_LLM_DISABLED) 일일 상한을 넘으면 오류가 아니라 템플릿 폴백.
 * - 업스트림에는 타임아웃이 있고, 같은 템플릿의 연속 요청은 짧은 TTL 캐시로 합친다.
 */
import { llmBudget } from "./ratelimit";

const BASE_SYSTEM =
  "너는 안내문 문장을 다듬는 편집자다. 수치·법 조항·항목명은 절대 바꾸지 마라. " +
  "숫자를 새로 만들지도, 지우지도, 한글로 풀어쓰지도 마라. 번호 목록의 번호도 그대로 둬라. " +
  "추가 주장·판정·감정 표현을 넣지 마라. 마크다운 문법(#, *, - 등)을 쓰지 말고 " +
  "일반 문서처럼 써라. 정중하고 간결한 한국어로만 다듬어라.";

const UPSTREAM_TIMEOUT_MS = 20_000;
const CACHE_TTL_MS = 60_000;
const MAX_BODY_BYTES = 4_096;
const SEP = String.fromCharCode(31); // 캐시 키 구분자

/** 출력 검증: 템플릿의 숫자 집합이 그대로 남아 있고(추가·삭제·변형 없음),
 * 템플릿에 있던 법 조항 표기(제N조/제N항/제N호)가 전부 출력에 있는지.
 * 하나라도 어긋나면 false → 호출자는 그 응답을 버리고 템플릿을 낸다. */
/**
 * 마크다운 마커 제거 — 시스템 프롬프트로 "마크다운 금지"를 지시해도 모델이 붙일 때가 있다
 * (관리비 안건 문서가 실제로 `# 안건명` 으로 시작했다). 사용자는 이 글을 그대로 복사해
 * 관리사무소·병원에 제출하므로 `#` 가 남으면 안 된다.
 * **줄머리 마커와 강조 기호만** 걷어낸다. 숫자·법 조항·문장은 건드리지 않는다.
 */
export function stripMarkdown(s: string): string {
  return s
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s{0,3}#{1,6}\s+/, "")          // # 제목
        .replace(/^\s{0,3}>\s?/, "")               // > 인용
        .replace(/^(\s*)[*+]\s+/, "$1- ")          // * 불릿 → 가운뎃줄표(한국 문서 관행)
        .replace(/^\s{0,3}(?:[-*_]\s?){3,}\s*$/, "")  // --- 구분선
    )
    .join("\n")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")          // **강조**
    .replace(/(?<![*\w])\*([^*\n]+)\*(?![*\w])/g, "$1")  // *기울임*
    .replace(/`([^`\n]+)`/g, "$1")                 // `코드`
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function preservesFacts(template: string, out: string): boolean {
  const nums = (s: string) =>
    (s.match(/\d[\d,]*/g) ?? []).map((t) => t.replace(/,/g, "")).sort();
  const a = nums(template);
  const b = nums(out);
  if (a.length !== b.length || a.some((v, i) => v !== b[i])) return false;
  return (template.match(/제\s?\d+\s?[조항호]/g) ?? []).every((m) => out.includes(m));
}

/** 같은 입력 반복 억제 + in-flight 합치기. 값이 Promise라 동시 요청이 한 번만 호출한다.
 * 실패(null)도 TTL 동안 기억한다 — 실패 루프가 예산을 갉아먹지 않도록. */
const cache = new Map<string, { at: number; text: Promise<string | null> }>();

async function callUpstream(template: string, system: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctl.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1200,
        system,
        messages: [{ role: "user", content: template }],
      }),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { content?: { type?: string; text?: string }[] };
    const text = (j.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("")
      .trim();
    // 마크다운을 먼저 걷어낸 뒤 사실 검증한다 — 마커 제거가 숫자·조항을 바꾸지 않음을 함께 보증한다.
    const clean = stripMarkdown(text);
    return clean && preservesFacts(template, clean) ? clean : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function polishResponse(
  template: string,
  opts?: { system?: string; signal?: AbortSignal }
): Promise<Response> {
  const plain = () =>
    new Response(template, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-rx-mode": "template" },
    });
  if (!process.env.ANTHROPIC_API_KEY) return plain();
  if (opts?.signal?.aborted) return plain();

  const system = opts?.system ?? BASE_SYSTEM;
  const now = Date.now();
  for (const [k, v] of cache) if (now - v.at > CACHE_TTL_MS) cache.delete(k);

  const ck = system.length + SEP + template;
  let hit = cache.get(ck);
  if (!hit) {
    // 캐시 히트는 새 호출이 아니므로 예산을 먹지 않는다.
    if (!llmBudget()) return plain();
    hit = { at: now, text: callUpstream(template, system) };
    cache.set(ck, hit);
    if (cache.size > 200) cache.clear();
  }
  // 진행 중 호출은 클라이언트 중단으로 끊지 않는다 — 다른 요청과 공유하기 때문.
  const text = await hit.text.catch(() => null);
  return text
    ? new Response(text, {
        headers: { "content-type": "text/plain; charset=utf-8", "x-rx-mode": "llm" },
      })
    : plain();
}

/** 라우트 공용 입력 파서 — 실패 시 null (라우트는 400 반환).
 * 본문 크기 상한을 여기서 한 번만 건다(4개 라우트 공통 관문).
 * ponytail: content-length가 없으면 일단 읽고 길이로 자른다. 플랫폼 자체 본문 상한이
 * 위에 하나 더 있어 이 경로로 들어오는 최대치는 이미 제한돼 있다. */
export async function readJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  const len = Number(req.headers.get("content-length"));
  if (Number.isFinite(len) && len > MAX_BODY_BYTES) return null;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return null;
    const j = JSON.parse(raw);
    return j && typeof j === "object" ? (j as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function safeDecode(v: unknown): string | null {
  if (typeof v !== "string" || v.length === 0 || v.length > 300) return null;
  try { return decodeURIComponent(v); } catch { return null; }
}
