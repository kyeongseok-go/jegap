import { funeralReady, getFuneral, funeralExams } from "../../../lib/funeral";
import { buildFuneralChecklist } from "../../../lib/pricedom/rx_price";
import { polishResponse, readJsonBody, safeDecode } from "../../../lib/pricedom/polish";
import { rateLimit } from "../../../lib/pricedom/ratelimit";

export async function POST(req: Request) {
  const limited = rateLimit(req);
  if (limited) return limited;
  const body = await readJsonBody(req);
  const id = safeDecode(body?.id);
  if (!id) return new Response("잘못된 요청입니다.", { status: 400 });
  if (!funeralReady()) return new Response("데이터 준비 중입니다.", { status: 503 });
  const d = getFuneral(id);
  if (!d) return new Response("찾을 수 없습니다.", { status: 404 });
  return polishResponse(buildFuneralChecklist(d.h.name, funeralExams(d)), { signal: req.signal });
}
