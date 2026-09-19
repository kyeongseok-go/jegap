import type { Metadata } from "next";
import PriceHome from "../../components/PriceHome";
import PriceSearch from "../../components/PriceSearch";
import { ready } from "../../lib/goods";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 생필품 가격 검진",
  description: "같은 물건인데 가게마다 값이 다릅니다. 한국소비자원 참가격이 점포별로 조사한 생필품 가격을 확인하세요.",
};

export default function GoodsHome() {
  return (
    <PriceHome
      active="gro"
      eyebrow="생필품편 · 한국소비자원 참가격"
      headline="장바구니 같은 물건,"
      hl="가게마다 얼마나 다른가"
      sub={<>
        한국소비자원이 <b>점포별로</b> 조사한 생필품 가격입니다.
        시도 평균이 아니라 실제 가게 단위로 봅니다.
      </>}
      ready={ready()}
      search={<PriceSearch endpoint="/api/grsearch" hrefBase="/gr" wide cta="조사 가격 보기"
        placeholder="상품 또는 점포 이름 검색" label="생필품 검색" />}
      ctaNote="한국소비자원 참가격 조사 기준 · 로그인 없음"
      pendingNote={<>한국소비자원 참가격의 생필품 가격 정보를 연동하는 중입니다.
        같은 상품이 점포마다 얼마인지, 그 안에서 어디쯤인지 보여드릴 예정입니다.</>}
      principles={[
        { t: "조사된 가격만 씁니다", d: "한국소비자원이 조사한 값 그대로입니다. 추정하거나 지어내지 않습니다." },
        { t: "판정하지 않습니다", d: "같은 상품을 파는 점포 가운데 위치와 중간값 대비 차이만 보여드립니다." },
        { t: "점포를 추천하지 않습니다", d: "어느 유통업체와도 관계가 없습니다. 조사 시점의 가격이며 현재 가격과 다를 수 있습니다." },
      ]}
    />
  );
}
