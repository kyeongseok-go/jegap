import type { PriceExam } from "./core";

/** 가격 도메인 종합 소견 — 결정론 생성(헌법 4조: 규칙이 이기면 모델을 쓰지 않는다).
 * 판정 표현 없이 개수·최대 배수·위치만 서술한다. */
export function priceOpinion(exams: PriceExam[], orgLabel: string, peerWord = "유사 기관"): string {
  if (exams.length === 0) return "";
  const high = exams.filter((e) => e.multiple >= 2);
  const mid = exams.filter((e) => e.multiple >= 1.5 && e.multiple < 2);
  const low = exams.filter((e) => e.multiple <= 0.8);
  const top = exams[0];
  const parts: string[] = [];
  parts.push(`비교 가능한 ${exams.length}개 항목 가운데`);
  if (high.length > 0)
    parts.push(`${high.length}개가 ${peerWord} 중간값의 2배 이상입니다. 차이가 가장 큰 항목은 ${top.name}(${top.multiple}배, 상위 ${Math.max(1, Math.min(99, top.percentile))}%)입니다.`);
  else if (mid.length > 0)
    parts.push(`${mid.length}개가 ${peerWord} 중간값의 1.5배 이상입니다. 차이가 가장 큰 항목은 ${top.name}(${top.multiple}배)입니다.`);
  else
    parts.push(`중간값의 2배를 넘는 항목은 없습니다.`);
  if (low.length > 0)
    parts.push(`반대로 ${low.length}개 항목은 중간값의 8할 이하로 낮은 편입니다.`);
  parts.push(`기준: ${orgLabel}.`);
  return parts.join(" ");
}
