import type { Checkup } from "./types";

/** 금지어: 헌법 2조. 테스트가 이 목록으로 출력을 검사한다 */
export const FORBIDDEN = ["등급", "판정", "부실", "비리 단지", "나쁜 단지"];

export function buildOpinion(c: Omit<Checkup, "opinion">): string {
  const parts: string[] = [];
  const fee = c.exams.find((e) => e.key === "fees");
  const res = c.exams.find((e) => e.key === "reserve");
  const rep = c.exams.find((e) => e.key === "repairs");

  if (fee && fee.signal !== "good" && fee.facts.risePct !== undefined)
    parts.push(`난방비가 최근 공시 기간에 ${fee.facts.risePct}% 올라, 비슷한 단지들보다 ${fee.facts.multiple}배 빠르게 오르고 있습니다.`);
  if (res && res.signal !== "good")
    parts.push(`매달 걷는 수선비(장기수선충당금, ㎡당 월 부과액)가 비교 가능한 ${c.peerValidCount}곳 중 ${c.peerHigherCount}곳보다 낮습니다. 이것은 매달 걷는 금액이고, 적립 잔액과 계획 공사비는 공시에 없습니다.`);
  if (rep && rep.signal !== "good")
    parts.push(`수선 이력 등록이 같은 연차 단지 평균보다 적습니다. 고치지 않았거나 기록하지 않았다는 뜻이므로, 둘 다 확인이 필요합니다.`);

  if (parts.length === 0) {
    if (c.exams.length === 0)
      parts.push(`비교할 수 있는 유사 단지 표본이 부족해 이번에는 검사 결과를 표시하지 않습니다. 불확실한 값은 만들지 않습니다.`);
    else
      parts.push(`수행한 ${c.exams.length}가지 검사 모두 비슷한 단지들의 일반적인 범위 안에 있습니다.`);
  }

  const age = new Date().getFullYear() - c.danji.builtYear;
  if (age >= 25 && res && res.signal !== "good")
    parts.push(`${c.danji.builtYear}년 준공 단지는 ${age >= 28 ? "이미 대규모 수선 주기 안에 있습니다" : "대규모 수선 주기에 들어서는 시기입니다"}. 실제로 재원이 모자랄지는 적립 잔액과 수선 계획을 함께 봐야 하니, 관리사무소에 장기수선계획서와 적립 잔액을 물어보세요.`);

  return parts.join(" ");
}
