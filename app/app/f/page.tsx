import type { Metadata } from "next";
import PriceHome from "../../components/PriceHome";
import PriceSearch from "../../components/PriceSearch";
import { funeralReady } from "../../lib/funeral";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 장례비 검진",
  description: "장례 비용, 항목별로 확인하세요. e하늘에 2023년 6월 공시된 장례식장 가격을 항목별로 보여드립니다.",
};

export default function FuneralHome() {
  return (
    <PriceHome
      active="fun"
      eyebrow="장례비편 · 2023년 6월 공시 가격"
      headline="장례 비용,"
      hl="항목별로 확인하세요"
      sub={<>
        장례식장은 <b>임대료·수수료 등 가격표 게시 의무</b>가 있고(장사법), 보건복지부 e하늘에
        시설별 가격이 공개되어 있습니다. 여기서 보여드리는 것은 <b>2023년 6월 공시 자료</b>입니다.
        현재 가격이 아닌 과거 공시 참고자료이니, 상담 때 물어볼 항목을 정하는 데 쓰세요.
      </>}
      ready={funeralReady()}
      search={<PriceSearch endpoint="/api/fsearch" hrefBase="/f" wide cta="공개 가격 보기"
        placeholder="장례식장 이름 검색  예: ○○병원장례식장" label="장례식장 이름 검색" />}
      ctaNote="e하늘 2023년 6월 공시 기준 · 현재 가격 아님 · 로그인 없음"
      actionNote={<>장례식장은 항목별 가격을 게시할 의무가 있습니다. 검진표 아래에서
        <b> 항목별 가격 목록 요청문</b>을 만들어 드립니다. 상담 전에 미리 받아 두면 비교할 시간이 생깁니다.</>}
      pendingNote={<>보건복지부 e하늘 장사정보의 시설별 가격 데이터를 연동하는 중입니다.
        빈소 사용료·안치료·염습비 등 항목별 위치를 보여드릴 예정입니다.</>}
      principles={[
        { t: "공개된 가격만 씁니다", d: "e하늘 장사정보 2023년 6월 공시 자료. 추정하거나 지어내지 않습니다." },
        { t: "판정하지 않습니다", d: "같은 시도 장례식장들 가운데 위치와 중간값 대비 배수만 보여드립니다." },
        { t: "시설을 추천하지 않습니다", d: "상조·장례 업체와 아무 관계가 없습니다. 가격의 위치라는 사실만 전합니다." },
      ]}
    />
  );
}
