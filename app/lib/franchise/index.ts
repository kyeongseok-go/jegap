import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * 공정위 창업비용편 — 가맹사업 정보공개서 등록 금액
 *
 * T1(뼈대) 단계 — 데이터 계약(항목 구조·비교 단위)은 T3에서 확정한다.
 * 지금은 준비 여부만 판정한다. 데이터가 없으면 홈은 "준비 중"으로 렌더되고
 * 탭에도 노출되지 않는다. 없는 값을 만들어 채우지 않는다.
 */
const PATH = join(process.cwd(), "data", "franchise.json.gz");

export const ready = () => existsSync(PATH);

/** 검색 — T3에서 데이터 계약이 정해지면 구현한다. 그전까지 빈 결과. */
export function search(_q: string): Array<{ id: string; name: string }> {
  return [];
}
