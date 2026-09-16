import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceCheckup from "../../../components/PriceCheckup";
import PriceSearch from "../../../components/PriceSearch";
import { academyReady, getAcademy, academyExams } from "../../../lib/academy";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!academyReady()) return { title: "JEGAP 제값 — 학원비 검진" };
  const d = getAcademy(decodeURIComponent(id));
  return { title: d ? `${d.h.name} 교습비 위치 — JEGAP 제값` : "JEGAP 제값 — 학원비 검진" };
}

export default async function AcademyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!academyReady()) notFound();
  const d = getAcademy(decodeURIComponent(id));
  if (!d) notFound();
  return (
    <PriceCheckup
      d={d} exams={academyExams(d)} active="aca"
      eyebrow="학원비 검진 결과"
      srcLine="교육청(NEIS) 공시 교습비 기준"
      unitNote="공시된 인당 교습비만으로 작성했습니다. 수업 시간·횟수·정원 등 구성은 반영되어 있지 않으며,"
      footNote="이 표는 학원에 대한 평가나 추천이 아닙니다. 신고 금액 초과 징수는 학원법 위반으로 교육청에 신고할 수 있습니다."
      search={<PriceSearch endpoint="/api/asearch" hrefBase="/a"
        placeholder="학원 이름 검색" label="학원 이름 검색" />}
    />
  );
}
