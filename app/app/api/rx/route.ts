import { NextRequest } from "next/server";
import { getSource } from "../../../lib/data/kapt";
import { runCheckup } from "../../../lib/engine/checkup";
import { buildInquiry, buildAgenda, buildRefund } from "../../../lib/engine/rx";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { code, kind = "inquiry" } = (await req.json()) as { code: string; kind?: "inquiry" | "agenda" | "refund" };
  const src = getSource();
  const me = await src.get(code);
  if (!me) return new Response("not found", { status: 404 });
  const checkup = runCheckup(me, await src.all());
  const template = kind === "agenda" ? buildAgenda(checkup) : kind === "refund" ? buildRefund(checkup) : buildInquiry(checkup);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // 결정론 템플릿을 그대로 스트리밍 (동일 UX, LLM 미개입 사실은 화면에 고지)
    return new Response(template, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-rx-mode": "template" },
    });
  }

  // LLM 다듬기: 수치·법 조항은 템플릿 고정, 문장만 다듬는다 (LLM에 산수 금지)
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: key });
  const stream = client.messages.stream({
    model: "claude-sonnet-5",
    max_tokens: 1200,
    system:
      "당신은 공동주택 민원 문서를 다듬는 편집자다. 아래 질의서의 수신처·법 조항·숫자·요청 항목은 절대 바꾸지 말고, 문장만 자연스럽고 정중하게 다듬어라. 등급·판정·비난 표현 금지. 결과는 질의서 본문만.",
    messages: [{ role: "user", content: template }],
  });
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta")
            controller.enqueue(encoder.encode(ev.delta.text));
        }
      } catch {
        controller.enqueue(encoder.encode(template)); // LLM 실패 → 템플릿 폴백 (무소음)
      }
      controller.close();
    },
  });
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "x-rx-mode": "llm" },
  });
}
