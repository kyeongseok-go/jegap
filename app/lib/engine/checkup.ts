import type { Checkup, DanjiData, ExamResult } from "./types";
import { percentileBelow, totalRisePct, riseMultiple } from "./stats";
import { findPeers } from "./peers";
import { reserveSignal, feeRiseSignal, repairSignal, overallSignal } from "./signals";
import { buildOpinion } from "./opinion";

export function runCheckup(me: DanjiData, all: DanjiData[]): Checkup {
  const { peers, relaxed } = findPeers(me.danji, all.map((d) => d.danji));
  const peerData = all.filter((d) => peers.some((p) => p.code === d.danji.code));

  // 장충금 백분위 — 부과액 0원(미부과·미보고 가능)은 데이터 부재로 보고 검사·표본 모두 제외(무소음)
  const peerReserves = peerData.map((d) => d.reserve.perM2).filter((v) => v > 0);
  const pct = me.reserve.perM2 > 0 ? percentileBelow(me.reserve.perM2, peerReserves) : null;
  // 화면·소견이 인용하는 개수는 백분위 환산이 아니라 직접 센 값이다 (동률·0원 표본 왜곡 방지)
  const peerValidCount = peerReserves.length;
  const peerHigherCount = peerReserves.filter((v) => v > me.reserve.perM2).length;
  const resSig = reserveSignal(pct);

  // 관리비(난방) 상승 배수
  const myRise = totalRisePct(me.fees.map((f) => ({ ym: f.ym, v: f.heating })));
  const peerRises = peerData
    .map((d) => totalRisePct(d.fees.map((f) => ({ ym: f.ym, v: f.heating }))))
    .filter((r): r is number => r !== null);
  const peerAvgRise = peerRises.length ? peerRises.reduce((a, b) => a + b, 0) / peerRises.length : null;
  const mult = riseMultiple(myRise, peerAvgRise);
  const feeSig = feeRiseSignal(mult, myRise);

  // 수선 이력 (데이터 없으면 무소음)
  const repPeers = peerData.filter((d) => d.repairs);
  const repAvg = me.repairs && repPeers.length
    ? repPeers.reduce((a, d) => a + (d.repairs?.count5y ?? 0), 0) / repPeers.length : null;
  const repSig = me.repairs ? repairSignal(me.repairs.count5y, repAvg) : null;

  const exams: ExamResult[] = [];
  if (feeSig !== null && myRise !== null && mult !== null && peerAvgRise !== null)
    exams.push({ key: "fees", signal: feeSig, facts: { risePct: myRise, multiple: mult, peerAvgRise: Math.round(peerAvgRise * 10) / 10 } });
  if (resSig !== null && pct !== null)
    exams.push({ key: "reserve", signal: resSig, facts: { percentile: pct, perM2: me.reserve.perM2 } });
  if (repSig !== null && repAvg !== null && me.repairs)
    exams.push({ key: "repairs", signal: repSig, facts: { count5y: me.repairs.count5y, peerAvg: Math.round(repAvg) } });

  const base = {
    danji: me.danji,
    peerCount: peerData.length,
    peerValidCount,
    peerHigherCount,
    peerReserves,
    peerRelaxed: relaxed,
    reservePercentile: pct ?? -1,
    overall: overallSignal(exams.map((e) => e.signal)),
    exams,
  };
  return { ...base, opinion: buildOpinion(base) };
}
