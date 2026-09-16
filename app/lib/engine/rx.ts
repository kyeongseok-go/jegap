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
    `공동주택관리법 제27조제3항(회계서류 열람) 및 제30조(장기수선충당금)에 따라 아래 사항의 열람을 요청드립니다.`,
    ``,
    ...asks.map((a, i) => `${i + 1}. ${a}`),
    ``,
    `회신 희망일  요청일로부터 14일 이내`,
  ].join("\n");
}

/** 입주자대표회의 안건 초안 — 동일 원칙: 법 조항 고정, 수치 삽입, 판정 없음 */
export function buildAgenda(c: Checkup): string {
  const res = c.exams.find((e) => e.key === "reserve");
  const lines = [
    `안건명  장기수선충당금 적립 수준 점검 및 적정성 검토의 건`,
    ``,
    `제안 취지`,
    `공동주택관리법 제29조·제30조에 따른 장기수선계획과 충당금 적립 수준을 정기적으로 점검하고자 함.`,
  ];
  if (res)
    lines.push(
      ``,
      `참고 수치 (국토교통부 K-apt 공시 기준)`,
      `- 현재 적립: ㎡당 월 ${res.facts.perM2}원`,
      `- 유사 단지 ${c.peerCount}곳 대비 위치: 하위 ${c.reservePercentile}%`,
    );
  lines.push(
    ``,
    `심의 요청 사항`,
    `1. 현행 장기수선계획 대비 적립률 보고`,
    `2. 향후 5년 예정 공사 및 소요액 대비 적립 계획 검토`,
    `3. 필요 시 적립 요율 조정안 검토`,
  );
  return lines.join("\n");
}

/** 세입자 장충금 반환 — 납부확인서 요청문.
 * 근거: 공동주택관리법 시행령 제31조 제8항(반환)·제9항(납부확인서 발급). */
export function buildRefund(c: Checkup): string {
  return [
    `수신  ${c.danji.name} 관리사무소`,
    `제목  장기수선충당금 납부확인서 발급 요청`,
    ``,
    `공동주택관리법 시행령 제31조 제9항에 따라, 아래 세대의 임차 기간 중`,
    `관리비에 포함되어 납부된 장기수선충당금 납부확인서 발급을 요청드립니다.`,
    ``,
    `1. 대상 세대  ${c.danji.name} ____동 ____호`,
    `2. 임차 기간  ____년 __월 ~ ____년 __월`,
    `3. 용도  임대인에 대한 장기수선충당금 반환 청구 (시행령 제31조 제8항)`,
    ``,
    `발급 희망일  요청일로부터 7일 이내`,
  ].join("\n");
}
