import { makeDomain, type DomainConfig } from "../pricedom/core";
export type { Org as OilArea, OrgData as OilAreaData } from "../pricedom/core";

/**
 * 주유소편 — 한국석유공사 오피넷 시군구별 평균 판매가격.
 *
 * 기관 = 시군구, 항목 = 유종(휘발유·경유·고급휘발유·실내등유).
 * 개별 주유소가 아니라 시군구 평균을 쓰는 이유: 개별 주유소를 주는 API 가운데
 * `lowTop10`(최저가 Top20)은 표본이 최저가로 편향되고, 반경 검색(`aroundAll`)은
 * 전수이지만 TM 좌표 격자가 필요해 일 300콜 한도로 전국을 덮지 못한다.
 * 시군구 평균(`avgSigunPrice`)은 17콜 x 유종으로 전국을 편향 없이 덮는다.
 * 유사군: 같은 시도 -> 전국.
 */
/** 설정을 내보내 테스트가 같은 유사군 규칙을 다른 파일명으로 검증할 수 있게 한다.
  * (실데이터 파일명을 테스트가 건드리면 픽스처가 남아 프로덕션에 섞일 위험이 있다) */
export const CONFIG: DomainConfig = {
  file: "oil.json.gz",
  minPeers: 10,   // 시도 안 시군구 수가 적다(세종 1, 제주 2) — 시도에서 못 채우면 전국으로 넘어간다
  peerKeys: [
    { key: (o, code) => `${code}|${o.sido}`, label: (o) => `${o.sido} 기준` },
    { key: (o, code) => code, label: () => `전국 기준 (표본 확대)` },
  ],
};
const dom = makeDomain(CONFIG);

export const ready = dom.ready;
export const search = dom.search;
export const get = dom.get;
export const exams = (d: Parameters<typeof dom.exams>[0]) => dom.exams(d);
export const notes = (d: Parameters<typeof dom.notes>[0]) => dom.notes(d);
