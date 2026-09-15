/** 값이 분포에서 하위 몇 %인지 (0~100). peers 비면 null — 무소음 원칙: 만들지 않는다 */
export function percentileBelow(value: number, peers: number[]): number | null {
  if (peers.length === 0) return null;
  const below = peers.filter((p) => p < value).length;
  const equal = peers.filter((p) => p === value).length;
  // 동점은 중앙 처리 (표준 mid-rank)
  return Math.round(((below + equal / 2) / peers.length) * 100);
}

/** 시계열 총 상승률 (%). 점이 2개 미만이거나 시작값 0이면 null */
export function totalRisePct(series: number[]): number | null {
  if (series.length < 2) return null;
  const first = series[0], last = series[series.length - 1];
  if (first <= 0) return null;
  return Math.round(((last - first) / first) * 100);
}

/** 우리 상승률이 peer 평균 상승률의 몇 배인지. 분모 0/음수·null 입력 방어 */
export function riseMultiple(ours: number | null, peerAvg: number | null): number | null {
  if (ours === null || peerAvg === null || peerAvg <= 0) return null;
  return Math.round((ours / peerAvg) * 10) / 10;
}
