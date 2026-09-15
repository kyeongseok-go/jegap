import type { DanjiData } from "../engine/types";

/** 데이터 소스 어댑터 — kapt(실데이터)와 fixture(예시)가 같은 계약을 구현 */
export interface DataSource {
  /** 단지명 부분 일치 검색 */
  search(q: string): Promise<Array<{ code: string; name: string; sigungu: string }>>;
  get(code: string): Promise<DanjiData | null>;
  all(): Promise<DanjiData[]>;
  /** 이번 주 워스트 — 장충금 백분위 최하위 */
  worst(): Promise<DanjiData>;
  /** 이 소스가 예시 데이터인지 (화면 고지용) */
  isSample: boolean;
}
