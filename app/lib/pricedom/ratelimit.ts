/** LLM 대필 라우트 공용 게이트 — 익명 과금 남용·CPU 증폭 방어 + 운영자 스위치.
 *
 * 한계(중요): 저장소가 인메모리라 **서버 인스턴스별**이다. 아래 IP 윈도우 카운터도,
 * 일일 호출 상한도 전역 예산 보장이 아니다. 인스턴스가 N개로 확장되면 실제 허용량은
 * 최대 N배가 되고, 재배포·콜드스타트로 프로세스가 바뀌면 카운터는 0부터 다시 센다.
 * 정확한 전역 상한이 필요하면 외부 스토어(또는 플랫폼 방화벽/예산 알림)가 필요하다.
 * ponytail: 외부 스토어는 남용 신호가 실제로 관찰되면 도입.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const buckets = new Map<string, { count: number; resetAt: number }>();

const tooMany = (retryAfter: number) =>
  new Response("요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.", {
    status: 429,
    headers: { "retry-after": String(Math.max(1, retryAfter)) },
  });

/** 만료된 버킷을 실제로 삭제한다 — "60초 뒤 사라진다"는 안내와 구현을 일치시키는 부분.
 * ponytail: O(활성 IP 수) 선형 스윕. 활성 IP가 수만 개가 되면 타이머·LRU로 바꾼다. */
function sweep(now: number) {
  for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
}

export function rateLimit(req: Request): Response | null {
  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    const now = Date.now();
    if (buckets.size > 64) sweep(now);
    const b = buckets.get(ip);
    if (!b || now >= b.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      if (buckets.size > 10_000) buckets.clear(); // 메모리 최후 상한
      return null;
    }
    if (++b.count > MAX_PER_WINDOW) return tooMany(Math.ceil((b.resetAt - now) / 1000));
    return null;
  } catch {
    // 카운터가 고장 나도 비싼 LLM 호출을 무제한 열어두지 않는다 — 보수적으로 차단한다.
    return tooMany(WINDOW_MS / 1000);
  }
}

/** 운영자 스위치 — 호출 직전에 한 번 묻는다. false면 라우트는 검증된 표준 템플릿으로 폴백한다.
 *   JEGAP_LLM_DISABLED=1|true : LLM 전면 비활성화
 *   JEGAP_LLM_DAILY_MAX=<정수> : 하루 LLM 호출 상한 (미설정·0 이하면 상한 없음)
 * 한계: 이 카운터 역시 **인스턴스 단위**다. 인스턴스가 여러 개면 실제 총 호출은
 * 상한 × 인스턴스 수까지 갈 수 있다. 비용 사고를 확실히 막으려면 제공자 측 예산 한도도 함께 건다. */
let budgetDay = "";
let budgetUsed = 0;

export function llmBudget(): boolean {
  try {
    if (/^(1|true)$/i.test(process.env.JEGAP_LLM_DISABLED ?? "")) return false;
    const max = Number(process.env.JEGAP_LLM_DAILY_MAX);
    if (!Number.isFinite(max) || max <= 0) return true;
    const today = new Date().toISOString().slice(0, 10);
    if (today !== budgetDay) { budgetDay = today; budgetUsed = 0; }
    if (budgetUsed >= max) return false;
    budgetUsed++;
    return true;
  } catch {
    return false; // 판단이 불가능하면 호출하지 않는다 (템플릿 폴백)
  }
}
