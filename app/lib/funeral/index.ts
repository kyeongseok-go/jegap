import { makeDomain } from "../pricedom/core";

/**
 * 장례비편 — e하늘 등록 장사시설 공시 가격 (한국장례문화진흥원 개방, 공공누리 1유형).
 * 기준 시점: 2023년 6월 공시 — 화면에 반드시 명시하고 최신 확인 경로(e하늘)를 안내한다.
 * 유사군: 같은 시도 → 30곳 미만이면 전국 완화.
 */
const dom = makeDomain({
  file: "funeral.json.gz",
  minPeers: 30,
  peerKeys: [
    { key: (o, code) => `${code}|${o.sido}`, label: (o) => `${o.sido} 기준` },
    { key: (o, code) => code, label: () => `전국 기준 (표본 확대)` },
  ],
});

export const funeralReady = dom.ready;
export const searchFunerals = dom.search;
export const getFuneral = dom.get;
export const funeralExams = (d: Parameters<typeof dom.exams>[0]) => dom.exams(d);
export const funeralNotes = (d: Parameters<typeof dom.notes>[0]) => dom.notes(d);
