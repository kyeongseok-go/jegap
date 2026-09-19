import { makeDomain } from "../pricedom/core";
import type { Org, OrgData, PriceExam } from "../pricedom/core";

/**
 * 병원비편 — 심평원 비급여 공개가격 (병원급 이상 3,944기관).
 * 유사군: 같은 시도 × 같은 종별 (항목별 30곳 미만이면 미표시).
 */
const dom = makeDomain({
  file: "hira.json.gz",
  minPeers: 30,
  peerKeys: [
    { key: (o, code) => `${code}|${o.sido}|${o.kind}`, label: (o) => `${o.sido} · ${o.kind}` },
  ],
});

export type Hospital = Org;
export type HospitalData = OrgData;
export type { PriceExam };
export const hiraReady = dom.ready;
export const searchHospitals = dom.search;
export const getHospital = dom.get;
export const priceExams = (d: Parameters<typeof dom.exams>[0]) => dom.exams(d);
export const priceNotes = (d: Parameters<typeof dom.notes>[0]) => dom.notes(d);
