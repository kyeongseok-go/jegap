import { renderPriceOg, OG_SIZE } from "../../../lib/pricedom/og";
import { funeralReady, getFuneral, funeralExams } from "../../../lib/funeral";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = funeralReady() ? getFuneral(decodeURIComponent(id)) : null;
  if (!d) return renderPriceOg("JEGAP", "e하늘 공시(2023.6)", null, false);
  const ex = funeralExams(d);
  const top = ex[0];
  const fact = top ? `${top.name} — 중간값의 ${top.multiple}배 · 상위 ${Math.max(1, Math.min(99, top.percentile))}%` : null;
  return renderPriceOg(d.h.name, `${d.h.sido} ${d.h.sigungu} · ${d.h.kind} · e하늘 공시(2023.6)`, fact, !!top && top.multiple >= 2);
}
