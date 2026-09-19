import type { Metadata } from "next";
import PriceHome from "../../components/PriceHome";
import PriceSearch from "../../components/PriceSearch";
import { ready } from "../../lib/oil";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 주유소 가격 검진",
  description: "같은 기름인데 값이 다릅니다. 한국석유공사 오피넷이 매일 조사하는 전국 주유소 판매가격에서 내 지역 위치를 확인하세요.",
};

export default function OilHome() {
  return (
    <PriceHome
      active="oil"
      eyebrow="주유소편 · 한국석유공사 오피넷"
      headline="같은 기름 다른 값,"
      hl="내 동네는 얼마인가"
      sub={<>
        오피넷은 <b>전국 주유소 판매가격을 매일</b> 모읍니다.
        내가 늘 가는 주유소가 어디쯤인지 봅니다.
      </>}
      ready={ready()}
      search={<PriceSearch endpoint="/api/oilsearch" hrefBase="/oil" wide cta="판매가격 보기"
        placeholder="지역 또는 주유소 이름 검색" label="주유소 검색" />}
      ctaNote="오피넷 조사 기준 · 매일 갱신 · 로그인 없음"
      pendingNote={<>한국석유공사 오피넷의 주유소 판매가격을 연동하는 중입니다.
        지역별 평균가격과 그 안에서의 위치를 보여드릴 예정입니다.</>}
      principles={[
        { t: "조사된 가격만 씁니다", d: "오피넷에 신고·조사된 판매가격 그대로입니다. 추정하거나 지어내지 않습니다." },
        { t: "판정하지 않습니다", d: "같은 지역 주유소 가운데 위치와 평균 대비 차이만 보여드립니다." },
        { t: "주유소를 추천하지 않습니다", d: "어느 주유소·정유사와도 관계가 없습니다. 가격의 위치라는 사실만 전합니다." },
      ]}
    />
  );
}
