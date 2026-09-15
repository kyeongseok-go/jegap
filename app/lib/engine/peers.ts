import type { Danji } from "./types";

/** 세대수 4구간 */
export function householdBand(h: number): 0 | 1 | 2 | 3 {
  if (h < 300) return 0;
  if (h < 700) return 1;
  if (h < 1500) return 2;
  return 3;
}

const MIN_PEERS = 30;

/** 완화 사다리 (40-DESIGN §3): 0 기본 → 1 난방 제외 → 2 세대구간 제외 → 3 연식 ±10 */
export function findPeers(me: Danji, all: Danji[]): { peers: Danji[]; relaxed: 0 | 1 | 2 | 3 } {
  const others = all.filter((d) => d.code !== me.code && d.domain === me.domain);
  const steps: Array<(d: Danji) => boolean> = [
    (d) => d.sido === me.sido && Math.abs(d.builtYear - me.builtYear) <= 5 &&
           householdBand(d.households) === householdBand(me.households) && d.heating === me.heating,
    (d) => d.sido === me.sido && Math.abs(d.builtYear - me.builtYear) <= 5 &&
           householdBand(d.households) === householdBand(me.households),
    (d) => d.sido === me.sido && Math.abs(d.builtYear - me.builtYear) <= 5,
    (d) => d.sido === me.sido && Math.abs(d.builtYear - me.builtYear) <= 10,
  ];
  for (let i = 0; i < steps.length; i++) {
    const peers = others.filter(steps[i]);
    if (peers.length >= MIN_PEERS || i === steps.length - 1)
      return { peers, relaxed: i as 0 | 1 | 2 | 3 };
  }
  return { peers: [], relaxed: 3 };
}

/** 산식 공개 페이지용 사람 문장 — 한 문장으로 설명 가능해야 함 */
export function peerRuleText(relaxed: number): string {
  const base = ["같은 시도", "준공연도 ±5년", "세대수 구간 일치", "난방방식 일치"];
  if (relaxed === 0) return base.join(" · ");
  if (relaxed === 1) return base.slice(0, 3).join(" · ") + " (난방방식 조건 완화)";
  if (relaxed === 2) return base.slice(0, 2).join(" · ") + " (세대수·난방 조건 완화)";
  return "같은 시도 · 준공연도 ±10년 (조건 완화)";
}
