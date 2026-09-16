import { renderPriceOg, OG_SIZE } from "../../../lib/pricedom/og";
import { hiraReady, getHospital, priceExams } from "../../../lib/medical/hira";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = hiraReady() ? getHospital(decodeURIComponent(id)) : null;
  if (!d) return renderPriceOg("JEGAP", "심평원 공개 가격", null, false);
  const ex = priceExams(d);
  const top = ex[0];
  const fact = top ? `${top.name} — 중간값의 ${top.multiple}배 · 상위 ${Math.max(1, Math.min(99, top.percentile))}%` : null;
  return renderPriceOg(d.h.name, `${d.h.sido} ${d.h.sigungu} · ${d.h.kind} · 심평원 공개 가격`, fact, !!top && top.multiple >= 2);
}
