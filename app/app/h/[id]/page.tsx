import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceCheckup from "../../../components/PriceCheckup";
import PriceSearch from "../../../components/PriceSearch";
import { hiraReady, getHospital, priceExams } from "../../../lib/medical/hira";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!hiraReady()) return { title: "JEGAP 제값 — 병원비 검진" };
  const d = getHospital(decodeURIComponent(id));
  return { title: d ? `${d.h.name} 비급여 가격 위치 — JEGAP 제값` : "JEGAP 제값 — 병원비 검진" };
}

export default async function HospitalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hiraReady()) notFound();
  const d = getHospital(decodeURIComponent(id));
  if (!d) notFound();
  return (
    <PriceCheckup
      d={d} exams={priceExams(d)} active="med"
      eyebrow="병원비 검진 결과"
      srcLine="건강보험심사평가원 비급여 공개 가격 기준"
      unitNote="공개된 가격만으로 작성했습니다. 진료의 질·범위·구성은 반영되어 있지 않으며,"
      footNote="이 표는 병원에 대한 평가나 추천이 아닙니다. 유사 기관 기준: 같은 시도 · 같은 종별."
      search={<PriceSearch endpoint="/api/hsearch" hrefBase="/h"
        placeholder="병원 이름 검색" label="병원 이름 검색" />}
    />
  );
}
