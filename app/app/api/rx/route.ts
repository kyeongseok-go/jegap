import { getSource } from "../../../lib/data/kapt";
import { runCheckup } from "../../../lib/engine/checkup";
import { buildInquiry, buildAgenda, buildRefund } from "../../../lib/engine/rx";
import { polishResponse, readJsonBody } from "../../../lib/pricedom/polish";
import { rateLimit } from "../../../lib/pricedom/ratelimit";

const KINDS = new Set(["inquiry", "agenda", "refund"]);
const SYSTEM =
  "당신은 공동주택 민원 문서를 다듬는 편집자다. 수신처·법 조항·숫자·요청 항목은 절대 바꾸지 " +
  "말고, 문장만 자연스럽고 정중하게 다듬어라. 등급·판정·비난 표현 금지. " +
  "마크다운 문법(#, *, - 등) 금지. 결과는 문서 본문만.";

export async function POST(req: Request) {
  const limited = rateLimit(req);
  if (limited) return limited;
  const body = await readJsonBody(req);
  const code = body?.code;
  const kind = typeof body?.kind === "string" ? body.kind : "inquiry";
  if (typeof code !== "string" || code.length === 0 || code.length > 40 || !KINDS.has(kind))
    return new Response("잘못된 요청입니다.", { status: 400 });

  const src = getSource();
  const me = await src.get(code);
  if (!me) return new Response("찾을 수 없습니다.", { status: 404 });
  const all = await src.all();
  const checkup = runCheckup(me, all.filter((d) => d.danji.code !== code));
  const template =
    kind === "agenda" ? buildAgenda(checkup) :
    kind === "refund" ? buildRefund(checkup) : buildInquiry(checkup);
  return polishResponse(template, { system: SYSTEM, signal: req.signal });
}
