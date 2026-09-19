import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceCheckup from "../../../components/PriceCheckup";
import PriceSearch from "../../../components/PriceSearch";
import { ready, get, exams, notes } from "../../../lib/franchise";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!ready()) return { title: "JEGAP 제값" };
  const d = get(decodeURIComponent(id));
  return { title: d ? `${d.h.name} 창업비용 위치 — JEGAP 제값` : "JEGAP 제값" };
}

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ready()) notFound();
  const d = get(decodeURIComponent(id));
  if (!d) notFound();
  return (
    <PriceCheckup
      backHref="/fr" backLabel="창업비용 검진으로"
      d={d} exams={exams(d)} notes={notes(d)} active="fra"
      eyebrow="창업비용 위치"
      srcLine="공정거래위원회 가맹사업 정보공개 등록 금액 기준"
      unitNote="가맹본부가 공정거래위원회에 등록한 금액만으로 작성했습니다. 같은 업종 브랜드끼리 비교하며, 점포 면적에 따라 달라지는 인테리어 비용은 별도 공시라 이 표에 없습니다. 등록 금액이 범위로 공시된 항목은 순위를 내지 않고 공시가격만 보여드립니다."
      footNote="이 표는 브랜드에 대한 평가나 추천이 아닙니다."
      search={<PriceSearch endpoint="/api/frsearch" hrefBase="/fr" cta="창업비용 확인"
        placeholder="브랜드 이름 검색" label="브랜드 이름 검색" />}
    />
  );
}
