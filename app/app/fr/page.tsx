import type { Metadata } from "next";
import PriceHome from "../../components/PriceHome";
import PriceSearch from "../../components/PriceSearch";
import { ready } from "../../lib/franchise";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 창업비용 검진",
  description: "가맹점 하나 여는 데 얼마가 드는지 확인하세요. 가맹본부가 공정거래위원회에 등록한 가입비·교육비·보증금·인테리어 비용을 브랜드별로 보여드립니다.",
};

export default function FranchiseHome() {
  return (
    <PriceHome
      active="fra"
      eyebrow="창업비용편 · 공정거래위원회 가맹사업 정보공개"
      headline="가맹점 하나 여는 데,"
      hl="얼마가 드는지 봅니다"
      sub={<>
        가맹본부가 공정거래위원회에 등록한 <b>가입비·교육비·보증금·인테리어 비용</b>입니다.
        같은 업종 브랜드끼리 나란히 놓고 봅니다.
      </>}
      ready={ready()}
      search={<PriceSearch endpoint="/api/frsearch" hrefBase="/fr" wide cta="창업비용 보기"
        placeholder="브랜드 이름 검색  예: ○○치킨" label="브랜드 이름 검색" />}
      ctaNote="공정위 가맹사업 정보공개 기준 · 연 1회 갱신 · 로그인 없음"
      pendingNote={<>공정거래위원회 가맹사업거래 정보공개 데이터를 연동하는 중입니다.
        브랜드별 가입비·교육비·보증금·평당 인테리어 비용을 같은 업종 안에서 비교해 보여드릴 예정입니다.</>}
      principles={[
        { t: "등록된 금액만 씁니다", d: "가맹본부가 공정거래위원회에 등록한 값 그대로입니다. 추정하거나 지어내지 않습니다." },
        { t: "범위는 범위로 적습니다", d: "등록 금액 상당수가 단일 값이 아니라 범위로 공시됩니다. 범위를 임의로 하나의 숫자로 바꾸지 않습니다." },
        { t: "브랜드를 추천하지 않습니다", d: "어느 가맹본부와도 관계가 없습니다. 등록된 비용의 위치라는 사실만 전합니다." },
      ]}
    />
  );
}
