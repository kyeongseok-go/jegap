// 방문한 페이지는 하루 캐시 (ISR) — 데이터는 주간 갱신이라 안전
export const revalidate = 86400;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceCheckup from "../../../components/PriceCheckup";
import PriceSearch from "../../../components/PriceSearch";
import { academyReady, getAcademy, academyExams } from "../../../lib/academy";
import RxSimple from "../../../components/RxSimple";

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
  const exams = academyExams(d);
  return (
    <PriceCheckup
      d={d} exams={exams} active="aca"
      eyebrow="학원비 검진 결과"
      srcLine="교육청(NEIS) 공시 교습비 기준"
      unitNote="공시된 인당 교습비만으로 작성했습니다. 수업 시간·횟수·정원 등 구성은 반영되어 있지 않으며,"
      footNote="이 표는 학원에 대한 평가나 추천이 아닙니다. 신고 금액 초과 징수는 학원법 위반으로 교육청에 신고할 수 있습니다."
      search={<PriceSearch endpoint="/api/asearch" hrefBase="/a"
        placeholder="학원 이름 검색" label="학원 이름 검색" />}
      rx={<RxSimple
        id={d.h.id} endpoint="/api/arx"
        title="물어볼 수 있습니다"
        lead="근거 조항까지 갖춘 확인 요청문을 만들어 드립니다. 그대로 복사해 학원에 보내세요."
        btnLabel="AI 확인 요청문 만들기"
        hint={<>학원은 교습비를 게시해야 하고, 교육청에 <b>신고한 금액보다 더 받을 수 없습니다</b>
          (학원법 제15조). 초과 징수는 관할 교육지원청에 신고할 수 있습니다.</>}
      />}
    />
  );
}
