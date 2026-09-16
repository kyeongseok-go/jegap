import { makeDomain } from "../pricedom/core";
export type { Org as Academy, OrgData as AcademyData } from "../pricedom/core";

/**
 * 학원비편 — NEIS 학원·교습소 공시 교습비 (학원법 제15조 게시·초과징수 금지).
 * 유사군: 같은 시군구 × 같은 과목 → 30곳 미만이면 시도로 완화(라벨에 그대로 드러남).
 * 과목명은 자유 표기라, 흔한 표기만 표본이 성립하고 특이 표기는 자연히 무소음 처리된다.
 */
const dom = makeDomain({
  file: "academy.json.gz",
  minPeers: 30,
  peerKeys: [
    { key: (o, code) => `${code}|${o.sido}|${o.sigungu}`, label: (o) => `${o.sigungu} 기준` },
    { key: (o, code) => `${code}|${o.sido}`, label: (o) => `${o.sido} 전체 기준 (표본 확대)` },
  ],
});

export const academyReady = dom.ready;
export const searchAcademies = dom.search;
export const getAcademy = dom.get;
export const academyExams = dom.exams;
