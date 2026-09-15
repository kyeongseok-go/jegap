import type { DataSource } from "./source";
import { fixtureSource } from "./fixture";

/**
 * 실데이터 어댑터 (공공데이터포털 K-apt).
 * D1 게이트(ADR-01): 초기 적재는 파일데이터 벌크 → scripts/ingest.ts.
 * 이 어댑터는 적재된 로컬 스토어(추후 Supabase)를 읽는다.
 *
 * ⚠️ 활성화 조건: .env.local 에 DATA_GO_KR_KEY 존재 + 인제스트 완료.
 * 필드 매핑은 아침 실호출 검증에서 확정한다 — 추측 금지 (PC1).
 */
export function makeKaptSource(): DataSource | null {
  if (!process.env.DATA_GO_KR_KEY) return null;
  // TODO(D1, 아침): AptListService2 / AptBasisInfoService / 관리비(장충금) 서비스 실호출 검증 후 구현
  return null;
}

/** 소스 선택: 실데이터 준비 전엔 fixture (isSample 고지 포함) */
export function getSource(): DataSource {
  return makeKaptSource() ?? fixtureSource;
}
