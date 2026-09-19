import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceCheckup from "../../../components/PriceCheckup";
import PriceSearch from "../../../components/PriceSearch";
import { funeralReady, getFuneral, funeralExams, funeralNotes } from "../../../lib/funeral";
import RxSimple from "../../../components/RxSimple";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!funeralReady()) return { title: "JEGAP 제값 — 장례비 검진" };
  const d = getFuneral(decodeURIComponent(id));
  return { title: d ? `${d.h.name} 가격 위치 — JEGAP 제값` : "JEGAP 제값 — 장례비 검진" };
}

export default async function FuneralPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!funeralReady()) notFound();
  const d = getFuneral(decodeURIComponent(id));
  if (!d) notFound();
  return (
    <PriceCheckup
      backHref="/f" backLabel="장례비 검진으로"
      d={d} exams={funeralExams(d)} notes={funeralNotes(d)} active="fun"
      eyebrow="장례비 검진 결과"
      srcLine="e하늘 장사정보 공시 가격 기준 · 2023년 6월 공시분"
      unitNote="2023년 6월 공시 가격만으로 작성했습니다. 현재 가격은 다를 수 있으니 방문 전 e하늘(15774129.go.kr)에서 최신 공시를 확인하세요. 안치료처럼 1일·시간당 단위가 섞이는 항목은 단위별로 나눠 비교하고, 수량이 2 이상으로 적힌 항목은 순위를 내지 않습니다. 재질·규격 차이(인견·본견 등)는 공시에 자유 표기로만 적혀 있어 같은 단위 안에서 중앙값으로 대표했습니다."
      footNote="이 표는 시설에 대한 평가나 추천이 아닙니다."
      search={<PriceSearch endpoint="/api/fsearch" hrefBase="/f" cta="가격 확인"
        placeholder="장례식장 이름 검색" label="장례식장 이름 검색" />}
      rx={<RxSimple
        id={d.h.id} endpoint="/api/frx"
        title="계약 전에 확인할 수 있습니다"
        lead="장례식장은 가격표 게시·등록 의무가 있습니다(장사법 제29조). 경황없는 순간에 그대로 확인하면 되는 목록을 만들어 드립니다."
        btnLabel="AI 확인 목록 만들기"
      />}
    />
  );
}
