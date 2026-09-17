import type { Metadata } from "next";
import PriceHome from "../../components/PriceHome";
import PriceSearch from "../../components/PriceSearch";
import { academyReady } from "../../lib/academy";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 학원비 검진",
  description: "학원비, 등록 전에 확인하세요. 교육청에 공시된 교습비와 같은 시군구 · 같은 과목의 중간값을 보여드립니다.",
};

export default function AcademyHome() {
  return (
    <PriceHome
      active="aca"
      eyebrow="학원비편 · 공시 교습비"
      headline="학원비,"
      hl="등록 전에 확인하세요"
      sub={<>
        같은 과목이어도 학원마다 교습비가 다릅니다.
        학원 이름을 넣으면 <b>교육청에 공시된 교습비</b>가 같은 시군구 · 같은 과목 중 어디쯤인지 보여드려요.
      </>}
      ready={academyReady()}
      search={<PriceSearch endpoint="/api/asearch" hrefBase="/a" wide cta="공개 교습비 보기"
        placeholder="학원 이름 검색  예: ○○영어학원" label="학원 이름 검색" />}
      ctaNote="교육청(NEIS) 공시 교습비 기준 · 로그인 없음 · 30초"
      actionNote={<>학원은 신고한 교습비를 게시해야 하고, 그보다 더 받으면 위법입니다(학원법 제15조).
        검진표 아래에서 <b>교습비 확인 요청문</b>을 만들어 드립니다. 그대로 복사해 학원에 보내시면 됩니다.</>}
      pendingNote={<>교육청 학원·교습소 공시 데이터(전국)를 연동하는 중입니다.
        데이터 출처: 나이스 교육정보 개방 포털.</>}
      principles={[
        { t: "신고된 교습비만 씁니다", d: "교육청 공시 자료. 추정하거나 지어내지 않습니다." },
        { t: "판정하지 않습니다", d: "같은 시군구 · 같은 과목 학원들 가운데 위치와 중간값 대비 배수만 보여드립니다." },
        { t: "수업 조건은 공시에 없습니다", d: "시간 · 횟수 · 구성이 자료에 남아 있지 않습니다. 조건이 다른 과정끼리는 가격만으로 비교할 수 없으니 등록 전에 함께 확인하세요." },
        { t: "학원을 추천하지 않습니다", d: "광고가 없습니다. 가격의 위치라는 사실만 전합니다." },
      ]}
    />
  );
}
