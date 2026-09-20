import { makeDomain, type DomainConfig } from "../pricedom/core";
export type { Org as Store, OrgData as StoreData } from "../pricedom/core";

/**
 * 생필품편 — 한국소비자원 참가격 점포별 조사가격.
 *
 * 기관 = 점포, 항목 = 상품(같은 상품코드면 규격이 같다).
 * 유사군: 같은 시군구 -> 시도 -> 전국. 조사 시점 가격이며 현재 가격과 다를 수 있다.
 */
/** 설정을 내보내 테스트가 같은 유사군 규칙을 다른 파일명으로 검증할 수 있게 한다.
  * (실데이터 파일명을 테스트가 건드리면 픽스처가 남아 프로덕션에 섞일 위험이 있다) */
export const CONFIG: DomainConfig = {
  file: "goods.json.gz",
  minPeers: 30,
  peerKeys: [
    { key: (o, code) => `${code}|${o.sido}|${o.sigungu}`, label: (o) => `${o.sigungu} 기준` },
    { key: (o, code) => `${code}|${o.sido}`, label: (o) => `${o.sido} 전체 기준 (표본 확대)` },
    { key: (o, code) => code, label: () => `전국 기준 (표본 확대)` },
  ],
};
const dom = makeDomain(CONFIG);

export const ready = dom.ready;
export const search = dom.search;
export const get = dom.get;
export const exams = (d: Parameters<typeof dom.exams>[0]) => dom.exams(d);
export const notes = (d: Parameters<typeof dom.notes>[0]) => dom.notes(d);
