import type { Metadata } from "next";
import PriceHome from "../../components/PriceHome";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 원비 검진",
  description: "유치원·어린이집 원비, 우리 동네 기준 어디쯤일까요. 공시 데이터로 확인합니다.",
};

export default function NurseryHome() {
  return (
    <PriceHome
      active="nur"
      eyebrow="원비편 — 유치원·어린이집 공시 원비"
      headline="아이 맡기는 값에도"
      hl="공시된 기준이 있습니다"
      sub={<>
        유치원과 어린이집은 원비·필요경비를 <b>공시할 의무</b>가 있습니다(유아교육법·영유아보육법).
        방과후 과정비, 특별활동비, 현장학습비 — 항목마다 우리 동네 기준 어디쯤인지 보여드립니다.
      </>}
      ready={false}
      search={null}
      ctaNote="유치원알리미·어린이집 공시 기준 · 로그인 없음 · 30초"
      pendingNote={<>유치원알리미·어린이집정보공개포털의 공시 데이터를 연동하는 중입니다.</>}
      principles={[
        { t: "공시된 금액만 씁니다", d: "유치원알리미·보육포털 공시 자료. 추정하거나 지어내지 않습니다." },
        { t: "판정하지 않습니다", d: "같은 지역 · 같은 설립유형 가운데 위치와 중간값 대비 배수만 보여드립니다." },
        { t: "원을 추천하지 않습니다", d: "광고가 없습니다. 가격의 위치라는 사실만 전합니다." },
      ]}
    />
  );
}
