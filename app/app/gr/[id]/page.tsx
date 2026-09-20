import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceCheckup from "../../../components/PriceCheckup";
import PriceSearch from "../../../components/PriceSearch";
import { ready, get, exams, notes } from "../../../lib/goods";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!ready()) return { title: "JEGAP 제값" };
  const d = get(decodeURIComponent(id));
  return { title: d ? `${d.h.name} 생필품 가격 위치 — JEGAP 제값` : "JEGAP 제값" };
}

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ready()) notFound();
  const d = get(decodeURIComponent(id));
  if (!d) notFound();
  return (
    <PriceCheckup
      backHref="/gr" backLabel="생필품 검진으로"
      d={d} exams={exams(d)} notes={notes(d)} active="gro"
      peerWord="같은 업태 점포"
      eyebrow="생필품 가격 위치"
      srcLine="한국소비자원 참가격 조사 가격 기준"
      unitNote="한국소비자원이 조사한 시점의 가격입니다. 현재 가격과 다를 수 있으니 방문 전 확인하세요. 같은 상품코드끼리만 비교하며, 할인·1+1 여부는 이 표에 반영되어 있지 않습니다."
      footNote="이 표는 점포에 대한 평가나 추천이 아닙니다."
      search={<PriceSearch endpoint="/api/grsearch" hrefBase="/gr" cta="조사 가격 확인"
        placeholder="점포 이름 검색" label="점포 이름 검색" />}
    />
  );
}
