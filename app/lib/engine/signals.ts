import type { Signal } from "./types";

/** 장충금: 유사군 하위 백분위 기준. null(peer 없음) → 신호 없음(무소음) */
export function reserveSignal(percentile: number | null): Signal | null {
  if (percentile === null) return null;
  if (percentile < 10) return "warn";
  if (percentile < 30) return "watch";
  return "good";
}

/** 관리비 상승: peer 대비 배수 + 절대 상승률 하한 병용 —
 * 전반적 저상승 국면에서 배수만으로 경고가 뜨는 오독을 막는다. */
export function feeRiseSignal(multiple: number | null, risePct: number | null = null): Signal | null {
  if (multiple === null) return null;
  const rise = risePct ?? Infinity;
  if (multiple >= 3 && rise >= 15) return "warn";
  if (multiple >= 2 && rise >= 10) return "watch";
  return "good";
}

/** 수선 이력: 기록 부재는 비리 증거가 아니다 — 최대 watch (사실 화법) */
export function repairSignal(count: number, peerAvg: number | null): Signal | null {
  if (peerAvg === null || peerAvg <= 0) return null;
  if (count < peerAvg / 3) return "watch";
  return "good";
}

/** 종합: 최악 신호를 따른다 (warn > watch > good) */
export function overallSignal(signals: Array<Signal | null>): Signal {
  const s = signals.filter((x): x is Signal => x !== null);
  if (s.includes("warn")) return "warn";
  if (s.includes("watch")) return "watch";
  return "good";
}
