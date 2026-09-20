import { renderPriceOg, OG_SIZE } from "../../../lib/pricedom/og";
import { ready, get, exams } from "../../../lib/oil";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = ready() ? get(decodeURIComponent(id)) : null;
  if (!d) return renderPriceOg("JEGAP", "오피넷 시군구 평균", null, false);
  const top = exams(d)[0];
  const fact = top ? `${top.name} — 중간값의 ${top.multiple}배 · 상위 ${Math.max(1, Math.min(99, top.percentile))}%` : null;
  const meta = [[d.h.sido, d.h.sigungu].filter(Boolean).join(" "), d.h.kind, "오피넷 시군구 평균"].filter(Boolean).join(" · ");
  return renderPriceOg(d.h.name, meta, fact, !!top && top.multiple >= 2);
}
