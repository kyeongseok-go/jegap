// 방문한 페이지는 하루 캐시 (ISR) — 데이터는 주간 갱신이라 안전
export const revalidate = 86400;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceCheckup from "../../../components/PriceCheckup";
import PriceSearch from "../../../components/PriceSearch";
import { funeralReady, getFuneral, funeralExams } from "../../../lib/funeral";

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
      d={d} exams={funeralExams(d)} active="fun"
      eyebrow="장례비 검진 결과"
      srcLine="e하늘 장사정보 공시 가격 기준 · 2023년 6월 공시분"
      unitNote="2023년 6월 공시 가격만으로 작성했습니다. 현재 가격은 다를 수 있으니 방문 전 e하늘(15774129.go.kr)에서 최신 공시를 확인하세요. 같은 품명의 세부 상품(특실·일반실 등)은 중앙값으로 대표했습니다."
      footNote="이 표는 시설에 대한 평가나 추천이 아닙니다."
      search={<PriceSearch endpoint="/api/fsearch" hrefBase="/f"
        placeholder="장례식장 이름 검색" label="장례식장 이름 검색" />}
    />
  );
}
