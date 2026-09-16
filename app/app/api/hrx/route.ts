import { hiraReady, getHospital, priceExams } from "../../../lib/medical/hira";
import { buildHospitalMemo } from "../../../lib/pricedom/rx_price";
import { polishResponse, readJsonBody, safeDecode } from "../../../lib/pricedom/polish";

export async function POST(req: Request) {
  const body = await readJsonBody(req);
  const id = safeDecode(body?.id);
  if (!id) return new Response("잘못된 요청입니다.", { status: 400 });
  if (!hiraReady()) return new Response("데이터 준비 중입니다.", { status: 503 });
  const d = getHospital(id);
  if (!d) return new Response("찾을 수 없습니다.", { status: 404 });
  return polishResponse(buildHospitalMemo(d.h.name, priceExams(d)), { signal: req.signal });
}
