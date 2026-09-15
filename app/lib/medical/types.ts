/** 병원비편(2호 도메인) — 확장 계약에 따른 medical 어댑터 타입 */

export interface Hospital {
  id: string;        // 심평원 암호화 요양기호
  name: string;
  sido: string;
  sigungu: string;
  kind: string;      // 종별: 의원 | 병원 | 종합병원 | 상급종합병원 | 치과 | 한방 …
}

/** 이 병원이 공개한 비급여 항목 가격 (심평원 공개 기준) */
export interface PriceItem {
  code: string;      // 비급여 항목 코드
  name: string;      // 항목명
  price: number;     // 대표 가격(원) — 공개 자료의 금액
}

export interface HospitalData {
  h: Hospital;
  items: PriceItem[];
}

/** 항목별 유사군 위치 — 아파트편의 백분위와 같은 원리 */
export interface PriceExam {
  code: string;
  name: string;
  price: number;
  peerCount: number;      // 같은 시도 · 같은 종별에서 이 항목을 공개한 기관 수
  percentile: number;     // 상위 N% 비싼 쪽 (높을수록 비쌈)
  median: number;         // 유사군 중간값
  multiple: number;       // 중간값 대비 배수 (소수 1자리)
}
