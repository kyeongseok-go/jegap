import { makeDomain, type DomainConfig } from "../pricedom/core";
export type { Org as Brand, OrgData as BrandData } from "../pricedom/core";

/**
 * 창업비용편 — 공정거래위원회 가맹사업 정보공개 등록 금액.
 *
 * 기관 = 브랜드, 항목 = 가맹금·교육비·보증금·기타·합계.
 * **지역이 없는 유일한 도메인이다** — 가맹금은 전국 공통으로 등록된다.
 * 그래서 유사군은 지역이 아니라 **업종**이다: 같은 업종중분류(kind) → 업종대분류(sido에 담는다).
 * 금액은 브랜드가 정한 고정액이라 점포 규모와 무관하고, 같은 업종 안에서는 비교 조건이 같다.
 * (평수에 비례하는 인테리어비는 별도 API라 여기 포함하지 않는다.)
 */
/** 설정을 내보내 테스트가 같은 유사군 규칙을 다른 파일명으로 검증할 수 있게 한다.
  * (실데이터 파일명을 테스트가 건드리면 픽스처가 남아 프로덕션에 섞일 위험이 있다) */
export const CONFIG: DomainConfig = {
  file: "franchise.json.gz",
  minPeers: 30,
  peerKeys: [
    { key: (o, code) => `${code}|${o.kind}`, label: (o) => `${o.kind} 기준` },
    { key: (o, code) => `${code}|${o.sido}`, label: (o) => `${o.sido} 전체 기준 (표본 확대)` },
  ],
};
const dom = makeDomain(CONFIG);

export const ready = dom.ready;
export const search = dom.search;
export const get = dom.get;
export const exams = (d: Parameters<typeof dom.exams>[0]) => dom.exams(d);
export const notes = (d: Parameters<typeof dom.notes>[0]) => dom.notes(d);
