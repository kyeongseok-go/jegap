import type { Danji, DanjiData } from "../engine/types";
import type { DataSource } from "./source";

/** 예시 데이터 — 실단지 아님(가상 명칭). 실명 단지는 D1 데이터 검증 후에만 (법적 안전). */
const NAMES = [
  "한빛마을", "달빛마을", "강변", "푸른숲", "은행나무", "미리내", "샘터", "노을",
  "해든", "가온", "다솜", "이든", "산들", "여울", "솔뫼", "바람개비", "윤슬", "라온",
];

/** 결정론 의사난수 — 새로고침마다 흔들리지 않게 (Date/Math.random 사용 금지 원칙과 동일 정신) */
function seeded(n: number): number {
  const x = Math.sin(n * 999) * 10000;
  return x - Math.floor(x);
}

function synth(i: number): DanjiData {
  const r = (k: number) => seeded(i * 13 + k);
  const builtYear = 1992 + Math.floor(r(1) * 20);           // 1992~2011
  const households = 200 + Math.floor(r(2) * 1600);
  const heating = r(3) < 0.6 ? "지역난방" : "개별난방";
  const danji: Danji = {
    domain: "apartment",
    code: `S${String(i).padStart(4, "0")}`,
    name: `${NAMES[i % NAMES.length]} ${1 + (i % 7)}단지`,
    sido: "서울특별시",
    sigungu: ["은평구", "노원구", "강서구", "구로구", "성북구"][i % 5],
    builtYear, households, heating,
    isSample: true,
  };
  // 장충금: 120~380원 분포, 난방 상승률: 12~35%
  const reserve = 120 + Math.floor(r(4) * 260);
  const h0 = 380 + Math.floor(r(5) * 80);
  const rise = 0.12 + r(6) * 0.23;
  const t0 = 1100 + Math.floor(r(7) * 300);
  const months = ["202309", "202403", "202409", "202503", "202509", "202603", "202607"];
  const fees = months.map((ym, k) => {
    const t = k / (months.length - 1);
    return {
      ym,
      total: Math.round(t0 * (1 + (rise * 0.8) * t)),
      heating: Math.round(h0 * (1 + rise * t)),
    };
  });
  return { danji, fees, reserve: { perM2: reserve }, repairs: { count5y: 6 + Math.floor(r(8) * 12) } };
}

/** 워스트 시연 단지 — 03-refined 확정 카피의 수치와 정확히 일치 */
const WORST: DanjiData = {
  danji: {
    domain: "apartment", code: "S-WORST", name: "한빛마을 3단지",
    sido: "서울특별시", sigungu: "은평구", builtYear: 1998,
    households: 812, heating: "지역난방", isSample: true,
  },
  fees: [
    { ym: "202309", total: 1240, heating: 400 },
    { ym: "202403", total: 1310, heating: 428 },
    { ym: "202409", total: 1370, heating: 458 },
    { ym: "202503", total: 1445, heating: 490 },
    { ym: "202509", total: 1500, heating: 516 },
    { ym: "202603", total: 1560, heating: 544 },
    { ym: "202607", total: 1610, heating: 568 },  // +42%
  ],
  reserve: { perM2: 92 },
  repairs: { count5y: 3 },
};

const ALL: DanjiData[] = [WORST, ...Array.from({ length: 90 }, (_, i) => synth(i + 1))];

export const fixtureSource: DataSource = {
  isSample: true,
  async search(q) {
    const t = q.trim();
    if (!t) return [];
    return ALL.filter((d) => d.danji.name.includes(t))
      .slice(0, 8)
      .map((d) => ({ code: d.danji.code, name: d.danji.name, sigungu: d.danji.sigungu }));
  },
  async get(code) { return ALL.find((d) => d.danji.code === code) ?? null; },
  async all() { return ALL; },
  async worst() { return WORST; },
};
