import type { Metadata } from "next";
import PriceHome from "../../components/PriceHome";
import PriceSearch from "../../components/PriceSearch";
import { funeralReady } from "../../lib/funeral";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 장례비 검진",
  description: "정신없을 때 내는 값이야말로, 제값인지 물어야 합니다. e하늘에 공개된 장례식장 가격으로 확인합니다.",
};

export default function FuneralHome() {
  return (
    <PriceHome
      active="fun"
      eyebrow="장례비편 — 장사시설 공개 가격"
      headline="정신없을 때 내는 값이야말로"
      hl="제값인지 물어야 합니다"
      sub={<>
        장례는 사흘 안에 모든 가격을 결정해야 합니다. 비교할 시간도, 마음의 여유도 없습니다.
        장례식장은 <b>임대료·수수료 등 가격표 게시 의무</b>가 있고(장사법), 보건복지부 e하늘에
        시설별 가격이 공개되어 있습니다. 미리 알고 가는 것이 유일한 방어입니다.
      </>}
      ready={funeralReady()}
      search={<PriceSearch endpoint="/api/fsearch" hrefBase="/f" wide
        placeholder="장례식장 이름 검색  예: ○○병원장례식장" label="장례식장 이름 검색" />}
      ctaNote="e하늘 공시 가격(2023.6) 기준 · 로그인 없음 · 30초"
      pendingNote={<>보건복지부 e하늘 장사정보의 시설별 가격 데이터를 연동하는 중입니다.
        빈소 사용료·안치료·염습비 등 항목별 위치를 보여드릴 예정입니다.</>}
      principles={[
        { t: "공개된 가격만 씁니다", d: "e하늘 장사정보 공개 자료. 추정하거나 지어내지 않습니다." },
        { t: "판정하지 않습니다", d: "같은 시도 장례식장들 가운데 위치와 중간값 대비 배수만 보여드립니다." },
        { t: "시설을 추천하지 않습니다", d: "상조·장례 업체와 아무 관계가 없습니다. 가격의 위치라는 사실만 전합니다." },
      ]}
    />
  );
}
