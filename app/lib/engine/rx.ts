import type { Checkup } from "./types";

export function buildInquiry(c: Checkup): string {
  const asks: string[] = [
    "최근 3개년 장기수선충당금 적립 및 사용 내역",
    "현행 장기수선계획상 향후 5년 내 예정 공사와 소요 예상액",
  ];
  const fee = c.exams.find((e) => e.key === "fees");
  if (fee && fee.signal !== "good")
    asks.push("최근 3개년 난방비 상승 사유에 대한 설명 자료");
  const rep = c.exams.find((e) => e.key === "repairs");
  if (rep && rep.signal !== "good")
    asks.push("최근 5년 주요 시설 수선 실적 및 유지관리 이력 등록 현황");

  return [
    `수신  ${c.danji.name} 관리사무소`,
    `제목  장기수선충당금 적립 현황 등 정보 열람 요청`,
    ``,
    `공동주택관리법 제30조 및 같은 법 시행령에 따라 아래 사항의 열람을 요청드립니다.`,
    ``,
    ...asks.map((a, i) => `${i + 1}. ${a}`),
    ``,
    `회신 희망일  요청일로부터 14일 이내`,
  ].join("\n");
}
