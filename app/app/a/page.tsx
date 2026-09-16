import type { Metadata } from "next";
import PriceHome from "../../components/PriceHome";
import PriceSearch from "../../components/PriceSearch";
import { academyReady } from "../../lib/academy";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 학원비 검진",
  description: "우리 동네 같은 과목 학원들 가운데, 이 학원의 교습비는 어디쯤일까요. 교육청 공시 교습비로 확인합니다.",
};

export default function AcademyHome() {
  return (
    <PriceHome
      active="aca"
      eyebrow="학원비편 · 공시 교습비"
      headline="학원비는 부르는 게 값이"
      hl="아니라, 신고된 값이 있습니다"
      sub={<>
        학원은 교습비를 교육청에 신고하고 <b>게시할 의무</b>가 있습니다(학원법 제15조).
        신고된 금액보다 더 받으면 위법입니다. 학원 이름을 넣으면 우리 동네 같은 과목 기준
        어디쯤인지 보여드립니다.
      </>}
      ready={academyReady()}
      search={<PriceSearch endpoint="/api/asearch" hrefBase="/a" wide
        placeholder="학원 이름 검색  예: ○○영어학원" label="학원 이름 검색" />}
      ctaNote="교육청(NEIS) 공시 교습비 기준 · 로그인 없음 · 30초"
      pendingNote={<>교육청 학원·교습소 공시 데이터(전국)를 연동하는 중입니다.
        데이터 출처: 나이스 교육정보 개방 포털.</>}
      principles={[
        { t: "신고된 교습비만 씁니다", d: "교육청 공시 자료. 추정하거나 지어내지 않습니다." },
        { t: "판정하지 않습니다", d: "같은 시군구 · 같은 과목 학원들 가운데 위치와 중간값 대비 배수만 보여드립니다." },
        { t: "학원을 추천하지 않습니다", d: "광고가 없습니다. 가격의 위치라는 사실만 전합니다." },
      ]}
    />
  );
}
