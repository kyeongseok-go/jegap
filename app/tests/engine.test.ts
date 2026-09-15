import { describe, it, expect } from "vitest";
import { percentileBelow, totalRisePct, riseMultiple } from "../lib/engine/stats";
import { householdBand, findPeers, peerRuleText } from "../lib/engine/peers";
import { reserveSignal, feeRiseSignal, repairSignal, overallSignal } from "../lib/engine/signals";
import { buildOpinion, FORBIDDEN } from "../lib/engine/opinion";
import { buildInquiry } from "../lib/engine/rx";
import { runCheckup } from "../lib/engine/checkup";
import type { Danji, DanjiData } from "../lib/engine/types";

// ───────── stats ─────────
describe("percentileBelow", () => {
  it("빈 peers → null (무소음 원칙: 값을 만들지 않는다)", () => {
    expect(percentileBelow(100, [])).toBeNull();
  });
  it("최솟값이면 하위 근처", () => {
    const p = percentileBelow(1, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    expect(p).toBe(0);
  });
  it("중앙값이면 ~50", () => {
    const peers = Array.from({ length: 100 }, (_, i) => i + 1);
    const p = percentileBelow(50, peers)!;
    expect(p).toBeGreaterThanOrEqual(45);
    expect(p).toBeLessThanOrEqual(55);
  });
  it("동점은 mid-rank 처리", () => {
    expect(percentileBelow(5, [5, 5, 5, 5])).toBe(50);
  });
});

describe("totalRisePct / riseMultiple", () => {
  it("점 1개 → null", () => expect(totalRisePct([100])).toBeNull());
  it("시작 0 → null (0나눗셈 방어)", () => expect(totalRisePct([0, 100])).toBeNull());
  it("100→142는 +42%", () => expect(totalRisePct([100, 120, 142])).toBe(42));
  it("peer 평균 0 이하 → null", () => expect(riseMultiple(42, 0)).toBeNull());
  it("42% vs 20% → 2.1배", () => expect(riseMultiple(42, 20)).toBe(2.1));
});

// ───────── peers ─────────
const mk = (over: Partial<Danji>): Danji => ({
  domain: "apartment", code: Math.random().toString(36).slice(2),
  name: "테스트", sido: "서울특별시", sigungu: "구", builtYear: 1998,
  households: 812, heating: "지역난방", ...over,
});

describe("householdBand", () => {
  it("경계값", () => {
    expect(householdBand(299)).toBe(0);
    expect(householdBand(300)).toBe(1);
    expect(householdBand(699)).toBe(1);
    expect(householdBand(700)).toBe(2);
    expect(householdBand(1500)).toBe(3);
  });
});

describe("findPeers 완화 사다리", () => {
  const me = mk({ code: "ME" });
  it("기본 조건으로 30 이상이면 relaxed=0", () => {
    const all = [me, ...Array.from({ length: 40 }, () => mk({}))];
    const { peers, relaxed } = findPeers(me, all);
    expect(relaxed).toBe(0);
    expect(peers.length).toBe(40);
  });
  it("기본 조건 부족 시 난방부터 완화 (relaxed=1)", () => {
    const all = [me,
      ...Array.from({ length: 10 }, () => mk({})),                       // 기본 일치 10
      ...Array.from({ length: 25 }, () => mk({ heating: "개별난방" })),   // 난방만 다른 25
    ];
    const { peers, relaxed } = findPeers(me, all);
    expect(relaxed).toBe(1);
    expect(peers.length).toBe(35);
  });
  it("자기 자신과 타 도메인 제외", () => {
    const all = [me, mk({ code: "ME" }), mk({ domain: "medical" as const })];
    const { peers } = findPeers(me, all);
    expect(peers.every((p) => p.code !== "ME" && p.domain === "apartment")).toBe(true);
  });
  it("산식은 한 문장으로 설명 가능 (법적 방어)", () => {
    expect(peerRuleText(0)).toContain("난방방식");
    expect(peerRuleText(3)).toContain("±10년");
  });
});

// ───────── signals ─────────
describe("신호 경계값", () => {
  it("장충금: 9%→warn, 10%→watch, 29%→watch, 30%→good, null→null", () => {
    expect(reserveSignal(9)).toBe("warn");
    expect(reserveSignal(10)).toBe("watch");
    expect(reserveSignal(29)).toBe("watch");
    expect(reserveSignal(30)).toBe("good");
    expect(reserveSignal(null)).toBeNull();
  });
  it("상승 배수: 1.9→good, 2.0→watch, 3.0→warn", () => {
    expect(feeRiseSignal(1.9)).toBe("good");
    expect(feeRiseSignal(2)).toBe("watch");
    expect(feeRiseSignal(3)).toBe("warn");
  });
  it("수선 이력 부재는 최대 watch — 기록 부재 ≠ 비리 (사실 화법)", () => {
    expect(repairSignal(0, 11)).toBe("watch");
    expect(repairSignal(0, 11)).not.toBe("warn");
    expect(repairSignal(10, 11)).toBe("good");
  });
  it("종합은 최악 신호", () => {
    expect(overallSignal(["good", "watch", null])).toBe("watch");
    expect(overallSignal(["watch", "warn"])).toBe("warn");
    expect(overallSignal([null])).toBe("good");
  });
});

// ───────── 통합 + 헌법 ─────────
function fixture(): { me: DanjiData; all: DanjiData[] } {
  const mkData = (d: Danji, reserve: number, rise: [number, number], repairs: number): DanjiData => ({
    danji: d, reserve: { perM2: reserve },
    fees: [
      { ym: "202309", total: 1240, heating: rise[0] },
      { ym: "202609", total: 1610, heating: rise[1] },
    ],
    repairs: { count5y: repairs },
  });
  const me = mkData(mk({ code: "ME", name: "한빛마을 3단지" }), 92, [400, 568], 3); // +42%
  const all = [me, ...Array.from({ length: 40 }, (_, i) =>
    mkData(mk({}), 200 + i * 10, [400, 480], 11))]; // peer +20%, 적립 200~
  return { me, all };
}

describe("runCheckup 통합", () => {
  const { me, all } = fixture();
  const c = runCheckup(me, all);
  it("워스트 픽스처: 장충금 warn, 종합 warn", () => {
    expect(c.exams.find((e) => e.key === "reserve")!.signal).toBe("warn");
    expect(c.overall).toBe("warn");
  });
  it("백분위는 하위 한 자릿수", () => {
    expect(c.reservePercentile).toBeLessThan(10);
  });
  it("상승 배수 2.1", () => {
    expect(c.exams.find((e) => e.key === "fees")!.facts.multiple).toBe(2.1);
  });
  it("헌법 2조: 소견에 금지어 없음", () => {
    for (const w of FORBIDDEN) expect(c.opinion).not.toContain(w);
  });
  it("소견은 수치를 인용한다 (엔진 계산값 그대로)", () => {
    expect(c.opinion).toContain("42%");
    expect(c.opinion).toContain("2.1배");
  });
  it("질의서: 법 조항 + 조건부 항목", () => {
    const rx = buildInquiry(c);
    expect(rx).toContain("공동주택관리법 제30조");
    expect(rx).toContain("난방비 상승 사유");     // fees가 good 아니므로 포함
    expect(rx).toContain("한빛마을 3단지");
  });
  it("peer 없으면 검사 자체가 비표시 (무소음)", () => {
    const lonely = runCheckup(me, [me]);
    expect(lonely.exams.length).toBe(0);
    expect(lonely.overall).toBe("good");
  });
});
