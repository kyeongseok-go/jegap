import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceCheckup from "../../../components/PriceCheckup";
import PriceSearch from "../../../components/PriceSearch";
import { hiraReady, getHospital, priceExams } from "../../../lib/medical/hira";
import RxSimple from "../../../components/RxSimple";

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
      backHref="/h" backLabel="병원비 검진으로"
      d={d} exams={priceExams(d)} active="med"
      eyebrow="병원비 검진 결과"
      srcLine="건강보험심사평가원 비급여 공개 가격 기준"
      unitNote="공개된 가격만으로 작성했습니다. 진료의 질·범위·구성은 반영되어 있지 않으며,"
      footNote="이 표는 병원에 대한 평가나 추천이 아닙니다. 유사 기관 기준: 같은 시도 · 같은 종별."
      search={<PriceSearch endpoint="/api/hsearch" hrefBase="/h" cta="가격 확인"
        placeholder="병원 이름 검색" label="병원 이름 검색" />}
      rx={<RxSimple
        id={d.h.id} endpoint="/api/hrx"
        title="진료 전에 물어볼 수 있습니다"
        lead="병원은 비급여 진료비용을 고지할 의무가 있습니다(의료법 제45조). 예약할 때 그대로 읽어도 되는 확인 메모를 만들어 드립니다."
        btnLabel="AI 확인 메모 만들기"
      />}
    />
  );
}
