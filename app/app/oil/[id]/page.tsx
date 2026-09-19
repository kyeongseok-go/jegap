import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceCheckup from "../../../components/PriceCheckup";
import PriceSearch from "../../../components/PriceSearch";
import { ready, get, exams, notes } from "../../../lib/oil";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!ready()) return { title: "JEGAP 제값" };
  const d = get(decodeURIComponent(id));
  return { title: d ? `${d.h.name} 주유소 평균가격 위치 — JEGAP 제값` : "JEGAP 제값" };
}

export default async function OilAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ready()) notFound();
  const d = get(decodeURIComponent(id));
  if (!d) notFound();
  return (
    <PriceCheckup
      backHref="/oil" backLabel="주유소 검진으로"
      d={d} exams={exams(d)} notes={notes(d)} active="oil"
      eyebrow="주유소 평균가격 위치"
      srcLine="한국석유공사 오피넷 시군구별 평균 판매가격 기준"
      unitNote="오피넷이 조사한 시군구별 평균 판매가격입니다. 개별 주유소 가격이 아니라 그 지역 평균이며, 같은 시군구 안에서도 주유소마다 값이 다릅니다."
      footNote="이 표는 지역에 대한 평가가 아닙니다. 유종별로 같은 유종끼리만 비교합니다."
      search={<PriceSearch endpoint="/api/oilsearch" hrefBase="/oil" cta="평균가격 확인"
        placeholder="시군구 이름 검색  예: 종로구" label="지역 검색" />}
    />
  );
}
