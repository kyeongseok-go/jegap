/** 확장 계약: 검진은 도메인 추상화 위에 있다. 아파트는 1호 도메인일 뿐. */
export type Domain = "apartment" | "medical" | "academy";

/** 신호는 판정이 아니라 데이터의 위치다. "등급" 개념 금지 (헌법 2조) */
export type Signal = "good" | "watch" | "warn";

export interface Danji {
  domain: Domain;          // 확장 계약
  code: string;            // kaptCode
  name: string;
  sido: string;
  sigungu: string;
  builtYear: number;       // 준공연도
  households: number;
  heating: string;         // 지역난방 | 개별난방 | 중앙난방
  isSample?: boolean;      // 예시 데이터 여부 — 화면에 반드시 명시
}

/** 월별 시계열 한 점 (㎡당 원) */
export interface FeePoint { ym: string; total: number; heating: number; }

/** 장충금 (㎡당 월 적립액, 원) */
export interface Reserve { perM2: number; }

/** 수선 이력 등록 건수 (최근 5년) */
export interface RepairHistory { count5y: number; }

export interface DanjiData {
  danji: Danji;
  fees: FeePoint[];        // 오래된 것 → 최신 순
  reserve: Reserve;
  repairs: RepairHistory;
}

export interface ExamResult {
  key: "fees" | "reserve" | "repairs";
  signal: Signal;
  /** 사실 서술 수치들 — 화면과 소견이 이 값만 인용 (LLM에 산수 금지) */
  facts: Record<string, number>;
}

export interface Checkup {
  danji: Danji;
  peerCount: number;
  peerRelaxed: number;     // 유사군 완화 단계 (0=기본)
  reservePercentile: number; // 하위 N% (0~100, 낮을수록 적게 쌓음)
  overall: Signal;
  exams: ExamResult[];
  opinion: string;         // 결정론 생성 소견 (LLM은 선택적 다듬기만)
}
