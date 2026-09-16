/** 대필 스트리밍 공용 계층 — 4개 라우트(rx/arx/hrx/frx)가 공유.
 * 계약:
 * - 수치·법 조항 불변은 system 프롬프트가 강제하고, 산출 수치는 애초에 템플릿이 만든다.
 * - 첫 델타를 받기 전에 실패하면(연결·오류 이벤트 포함) 템플릿을 그대로 반환한다(x-rx-mode: template).
 * - 첫 델타 이후 실패하면 부분 출력에 중단 안내만 덧붙인다 — 부분+전체 템플릿 혼합 금지.
 * - 클라이언트 중단(req.signal)과 스트림 cancel을 업스트림으로 전파한다.
 */

const BASE_SYSTEM =
  "너는 안내문 문장을 다듬는 편집자다. 수치·법 조항·항목명은 절대 바꾸지 마라. " +
  "추가 주장·판정·감정 표현을 넣지 마라. 마크다운 문법(#, *, - 등)을 쓰지 말고 " +
  "일반 문서처럼 써라. 정중하고 간결한 한국어로만 다듬어라.";

export async function polishResponse(
  template: string,
  opts?: { system?: string; signal?: AbortSignal }
): Promise<Response> {
  const key = process.env.ANTHROPIC_API_KEY;
  const plain = () => new Response(template, {
    headers: { "content-type": "text/plain; charset=utf-8", "x-rx-mode": "template" },
  });
  if (!key) return plain();

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  let buf = "";
  const dec = new TextDecoder();

  /** SSE에서 다음 이벤트 하나: 텍스트 델타 / 오류 / 종료 */
  async function nextDelta(): Promise<{ text?: string; error?: boolean; done?: boolean }> {
    for (;;) {
      const nl = buf.indexOf("\n");
      if (nl >= 0) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (!line.startsWith("data: ")) continue;
        try {
          const j = JSON.parse(line.slice(6));
          if (j.type === "error") return { error: true };
          if (j.type === "content_block_delta" && j.delta?.text) return { text: j.delta.text };
          if (j.type === "message_stop") return { done: true };
        } catch { /* keep-alive 등 무시 */ }
        continue;
      }
      const { done, value } = await reader.read();
      if (done) return { done: true };
      buf += dec.decode(value, { stream: true });
    }
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: opts?.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1200,
        stream: true,
        system: opts?.system ?? BASE_SYSTEM,
        messages: [{ role: "user", content: template }],
      }),
    });
    if (!res.ok || !res.body) return plain();
    reader = res.body.getReader();

    // 첫 유효 델타까지는 폴백 가능 구간
    const first = await nextDelta();
    if (first.error || first.done || !first.text) { reader.cancel().catch(() => {}); return plain(); }

    const enc = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(enc.encode(first.text!));
        try {
          for (;;) {
            const ev = await nextDelta();
            if (ev.text) { controller.enqueue(enc.encode(ev.text)); continue; }
            if (ev.error)
              controller.enqueue(enc.encode("\n\n[네트워크 문제로 생성이 중단되었습니다. 버튼을 다시 눌러 주세요.]"));
            break;
          }
        } catch {
          controller.enqueue(enc.encode("\n\n[네트워크 문제로 생성이 중단되었습니다. 버튼을 다시 눌러 주세요.]"));
        }
        controller.close();
      },
      cancel() { reader.cancel().catch(() => {}); },
    });
    return new Response(stream, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-rx-mode": "llm" },
    });
  } catch {
    return plain();
  }
}

/** 라우트 공용 입력 파서 — 실패 시 null (라우트는 400 반환) */
export async function readJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const j = await req.json();
    return j && typeof j === "object" ? (j as Record<string, unknown>) : null;
  } catch { return null; }
}

export function safeDecode(v: unknown): string | null {
  if (typeof v !== "string" || v.length === 0 || v.length > 300) return null;
  try { return decodeURIComponent(v); } catch { return null; }
}
