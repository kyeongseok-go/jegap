/** 값이 분포에서 하위 몇 %인지 (0~100). peers 비면 null — 무소음 원칙: 만들지 않는다 */
export function percentileBelow(value: number, peers: number[]): number | null {
  if (peers.length === 0) return null;
  const below = peers.filter((p) => p < value).length;
  const equal = peers.filter((p) => p === value).length;
  // 동점은 중앙 처리 (표준 mid-rank)
  return Math.round(((below + equal / 2) / peers.length) * 100);
}

/** 시계열 총 상승률 (%).
 * 월별 실데이터(24점 이상): ym 기준으로 "가장 이른 연속 12개월 합"과 "가장 늦은 연속 12개월 합"을
 * 비교한다. 어느 한쪽이라도 달력상 연속 12개월을 확보하지 못하거나 두 창이 겹치면 null(무소음) —
 * 누락 월을 무시하고 관측치 개수로만 자르면 기간이 다른 값을 비교하게 되기 때문이다.
 * 24점 미만(신축·짧은 공시)은 비교 자체를 하지 않는다(무소음). */
export function totalRisePct(points: Array<{ ym: string; v: number }>): number | null {
  if (points.length < 2) return null;
  const sorted = [...points].sort((a, b) => a.ym.localeCompare(b.ym));
  if (sorted.length >= 24) {
    const idx = (ym: string) => parseInt(ym.slice(0, 4)) * 12 + parseInt(ym.slice(4)) - 1;
    const byIdx = new Map(sorted.map((p) => [idx(p.ym), p.v]));
    const window = (startIdx: number): number | null => {
      let sum = 0;
      for (let k = 0; k < 12; k++) {
        const v = byIdx.get(startIdx + k);
        if (v === undefined) return null;
        sum += v;
      }
      return sum;
    };
    const lo = idx(sorted[0].ym), hi = idx(sorted[sorted.length - 1].ym);
    let first: number | null = null, firstStart = lo;
    for (let st = lo; st + 11 <= hi; st++) {
      const w = window(st);
      if (w !== null) { first = w; firstStart = st; break; }
    }
    let last: number | null = null, lastStart = hi;
    for (let st = hi - 11; st >= lo; st--) {
      const w = window(st);
      if (w !== null) { last = w; lastStart = st; break; }
    }
    if (first === null || last === null) return null;
    if (lastStart < firstStart + 12) return null;      // 창 겹침 — 비교 무의미
    if (first <= 0) return null;
    return Math.round(((last - first) / first) * 100);
  }
  // 24점 미만(신축·짧은 공시)은 첫/끝 단일점 비교가 무의미 — 표시하지 않는다.
  return null;
}

/** 우리 상승률이 peer 평균 상승률의 몇 배인지. 분모 0/음수·null 입력 방어 */
export function riseMultiple(ours: number | null, peerAvg: number | null): number | null {
  if (ours === null || peerAvg === null || peerAvg <= 0) return null;
  return Math.round((ours / peerAvg) * 10) / 10;
}

/** 중앙값 — 짝수 표본은 가운데 두 값의 평균 (상위측 편향 방지) */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
