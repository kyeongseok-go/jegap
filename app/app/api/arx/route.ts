import { academyReady, getAcademy, academyExams } from "../../../lib/academy";
import { buildAcademyInquiry } from "../../../lib/engine/rx_academy";

/** 학원 교습비 확인 요청문 — 관리비편 /api/rx와 동일 계약(템플릿 우선, 키 있으면 다듬기) */
export async function POST(req: Request) {
  const { id } = (await req.json()) as { id: string };
  if (!academyReady()) return new Response("데이터 준비 중입니다.", { status: 503 });
  const d = getAcademy(decodeURIComponent(id));
  if (!d) return new Response("찾을 수 없습니다.", { status: 404 });

  const template = buildAcademyInquiry(d.h.name, academyExams(d));
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key)
    return new Response(template, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-rx-mode": "template" },
    });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1200,
        stream: true,
        system:
          "너는 공문 문장을 다듬는 편집자다. 수치·법 조항·항목은 절대 바꾸지 마라. " +
          "추가 주장·판정·감정 표현을 넣지 마라. 마크다운 문법(#, *, - 등)을 쓰지 말고 일반 문서처럼 써라. 정중하고 간결한 한국어 공문체로만 다듬어라.",
        messages: [{ role: "user", content: template }],
      }),
    });
    if (!res.ok || !res.body) throw new Error("upstream");
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const j = JSON.parse(line.slice(6));
              if (j.type === "content_block_delta" && j.delta?.text)
                controller.enqueue(new TextEncoder().encode(j.delta.text));
            } catch { /* keep-alive 등 무시 */ }
          }
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-rx-mode": "llm" },
    });
  } catch {
    return new Response(template, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-rx-mode": "template" },
    });
  }
}
