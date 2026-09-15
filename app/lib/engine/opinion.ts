import type { Checkup } from "./types";

/** 금지어: 헌법 2조. 테스트가 이 목록으로 출력을 검사한다 */
export const FORBIDDEN = ["등급", "판정", "부실", "비리 단지", "나쁜 단지"];

export function buildOpinion(c: Omit<Checkup, "opinion">): string {
  const parts: string[] = [];
  const fee = c.exams.find((e) => e.key === "fees");
  const res = c.exams.find((e) => e.key === "reserve");
  const rep = c.exams.find((e) => e.key === "repairs");

  if (fee && fee.signal !== "good" && fee.facts.risePct !== undefined)
    parts.push(`난방비가 3년간 ${fee.facts.risePct}% 올라, 비슷한 단지들보다 ${fee.facts.multiple}배 빠르게 오르고 있습니다.`);
  if (res && res.signal !== "good")
    parts.push(`미래 수리비 저금(장기수선충당금)이 비슷한 단지 ${c.peerCount}곳 가운데 하위 ${c.reservePercentile}% 수준입니다.`);
  if (rep && rep.signal !== "good")
    parts.push(`수선 이력 등록이 같은 연차 단지 평균보다 적습니다. 고치지 않았거나 기록하지 않았다는 뜻이므로, 둘 다 확인이 필요합니다.`);

  if (parts.length === 0)
    parts.push(`세 가지 검사 모두 비슷한 단지들의 일반적인 범위 안에 있습니다.`);

  const age = new Date().getFullYear() - c.danji.builtYear;
  if (age >= 25 && res && res.signal !== "good")
    parts.push(age >= 28
      ? `${c.danji.builtYear}년 준공 단지는 이미 대규모 수선 주기 안에 있습니다. 지금 적게 쌓는 만큼, 큰 공사가 시작될 때 한꺼번에 내야 할 가능성이 커집니다.`
      : `${c.danji.builtYear}년 준공 단지는 대규모 수선 주기에 들어서는 시기입니다. 지금 적게 쌓는 만큼, 나중에 한꺼번에 내야 할 가능성이 커집니다.`);

  return parts.join(" ");
}
