import { describe, it, expect } from "vitest";
import { writeFileSync, rmSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join as joinPath } from "node:path";
import { makeDomain } from "../lib/pricedom/core";
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

const pts = (vals: number[], startYm = 202301) =>
  vals.map((v, i) => {
    const y = Math.floor(startYm / 100) + Math.floor((startYm % 100 - 1 + i) / 12);
    const m = ((startYm % 100 - 1 + i) % 12) + 1;
    return { ym: `${y}${String(m).padStart(2, "0")}`, v };
  });

describe("totalRisePct / riseMultiple", () => {
  it("점 1개 → null", () => expect(totalRisePct(pts([100]))).toBeNull());
  it("시작 0 → null (0나눗셈 방어)", () => expect(totalRisePct(pts([0, 100]))).toBeNull());
  it("24점 미만은 무소음 — 신축 1원 분모 오탐 방지", () => expect(totalRisePct(pts([100, 120, 142]))).toBeNull());
  it("월별 24점: 연속 12개월 합끼리 비교", () => {
    const vals = [...Array(12).fill(100), ...Array(12).fill(120)];
    expect(totalRisePct(pts(vals))).toBe(20);
  });
  it("누락 월로 두 연속 창이 겹치면 → null (무소음)", () => {
    // 26개월 중 5·20번째 결측(24점 유지) — 확보 가능한 두 12개월 창이 겹친다
    const p2 = pts(Array.from({ length: 26 }, (_, i) => 100 + i))
      .filter((_, i) => i !== 5 && i !== 20);
    expect(totalRisePct(p2)).toBeNull();
  });
  it("18점(24 미만)도 무소음", () => {
    const p3 = pts(Array.from({ length: 18 }, (_, i) => 100 + i));
    expect(totalRisePct(p3)).toBeNull();
  });
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
    // 36개월: 첫 12개월 rise[0], 마지막 12개월 rise[1] — 연속 12개월 합 비교로 상승률 정확 제어
    fees: Array.from({ length: 36 }, (_, i) => {
      const y = 2023 + Math.floor((8 + i) / 12);
      const m = ((8 + i) % 12) + 1;
      const heating = i < 12 ? rise[0] : i >= 24 ? rise[1] : Math.round((rise[0] + rise[1]) / 2);
      return { ym: `${y}${String(m).padStart(2, "0")}`, total: 1240 + i * 10, heating };
    }),
    repairs: { count5y: repairs },
  });
  const me = mkData(mk({ code: "ME", name: "한빛마을 3단지" }), 92, [400, 568], 3); // +42%
  const all = [me, ...Array.from({ length: 40 }, (_, i) =>
    mkData(mk({}), 200 + i * 10, [400, 480], 11))]; // peer +20%, 적립 200~
  return { me, all };
}

// ───────── 유효 표본 N · 초과 단지 K (백분위 환산 금지) ─────────
describe("peerValidCount / peerHigherCount", () => {
  // 장충금만 보는 최소 픽스처 — fees는 24점 미만이라 무소음
  const one = (code: string, reserve: number): DanjiData => ({
    danji: mk({ code }), reserve: { perM2: reserve }, fees: [],
  });
  const run = (mine: number, peers: number[]) =>
    runCheckup(one("ME", mine), [one("ME", mine), ...peers.map((v, i) => one(`P${i}`, v))]);

  it("동률이 많아도 K는 엄밀한 초과 개수 (백분위 보수 아님)", () => {
    const c = run(100, [100, 100, 100, 100, 200]);
    expect(c.peerValidCount).toBe(5);
    expect(c.peerHigherCount).toBe(1);          // 100원 동률 4곳은 초과가 아니다
    expect(c.peerHigherCount).not.toBe(100 - c.reservePercentile); // 환산값과 다르다
  });
  it("0원 표본은 N에서 제외 (데이터 부재)", () => {
    const c = run(100, [0, 0, 150, 200]);
    expect(c.peerValidCount).toBe(2);
    expect(c.peerHigherCount).toBe(2);
    expect(c.peerCount).toBe(4);                 // 유사군 전체 수와 유효 표본 수는 다르다
  });
  it("자기 값이 최소면 K = N", () => {
    const c = run(50, [80, 90, 100]);
    expect(c.peerHigherCount).toBe(c.peerValidCount);
  });
  it("자기 값이 최대면 K = 0", () => {
    const c = run(500, [80, 90, 100]);
    expect(c.peerHigherCount).toBe(0);
  });
  it("유효 표본이 비면 무소음 — 검사도 소견 수치도 없다", () => {
    const c = run(100, [0, 0]);
    expect(c.peerValidCount).toBe(0);
    expect(c.peerHigherCount).toBe(0);
    expect(c.exams.find((e) => e.key === "reserve")).toBeUndefined();
    expect(c.reservePercentile).toBe(-1);
  });
  it("소견은 세어낸 N·K를 그대로 인용한다", () => {
    const c = run(50, [80, 90, 100]);
    expect(c.opinion).toContain("3곳 중 3곳");
    expect(c.opinion).not.toContain("100곳");
  });
});

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
    expect(rx).toContain("제27조제3항");
    expect(rx).toContain("난방비 상승 사유");     // fees가 good 아니므로 포함
    expect(rx).toContain("한빛마을 3단지");
  });
  it("peer 없으면 검사 자체가 비표시 (무소음)", () => {
    const lonely = runCheckup(me, [me]);
    expect(lonely.exams.length).toBe(0);
    expect(lonely.overall).toBe("good");
  });
});

// ── 가격 도메인 비교 가능성 게이트 (STEP 1) ───────────────────────────────
// 공시 조건이 다른 값(rankable=0)이 배수·순위에 섞이지 않고, 표본이 모자란 항목은
// 사라지는 대신 "공시가격 참고"로 남는지. 장례 '안치료 1일 vs 시간당' 오염이 원본 사고.
describe("makeDomain 비교 가능성 게이트", () => {
  const FILE = "__dom_test.json.gz";
  const path = joinPath(process.cwd(), "data", FILE);
  const rows = [
    // 정상 표본 40곳 — 같은 조건(rankable=1), 10만원
    ...Array.from({ length: 40 }, (_, i) => ({
      id: `n${i}`, name: `정상${i}`, sido: "서울", sigungu: "강남구", kind: "x",
      items: [["A", "항목A", 100000, 1]] as Array<[string, string, number, number]>,
    })),
    // 조건이 다른 값 40곳 — 시간당 요금처럼 자릿수가 다르다. 표본에 섞이면 중앙값이 무너진다.
    ...Array.from({ length: 40 }, (_, i) => ({
      id: `u${i}`, name: `조건상이${i}`, sido: "서울", sigungu: "강남구", kind: "x",
      items: [["A", "항목A", 3000, 0]] as Array<[string, string, number, number]>,
    })),
    // 표본이 5곳뿐인 항목
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `s${i}`, name: `희소${i}`, sido: "서울", sigungu: "강남구", kind: "x",
      items: [["C", "항목C", 50000, 1]] as Array<[string, string, number, number]>,
    })),
    {
      id: "me", name: "검진대상", sido: "서울", sigungu: "강남구", kind: "x",
      items: [["A", "항목A", 120000, 1], ["B", "항목B", 7000, 0], ["C", "항목C", 50000, 1]] as Array<
        [string, string, number, number]>,
    },
  ];
  writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(rows), "utf-8")));
  const dom = makeDomain({
    file: FILE, minPeers: 30,
    peerKeys: [{ key: (o, code) => `${code}|${o.sido}`, label: (o) => `${o.sido} 기준` }],
  });
  const me = dom.get("me")!;
  const { exams, notes } = dom.split(me);
  rmSync(path);

  it("조건이 다른 값은 표본을 오염시키지 않는다", () => {
    const a = exams.find((e) => e.code === "A")!;
    expect(a).toBeTruthy();
    expect(a.median).toBe(100000);       // 3,000원 40곳이 섞였다면 중앙값이 무너진다
    expect(a.peerCount).toBe(40);
    expect(a.multiple).toBe(1.2);
  });
  it("조건이 다른 항목은 순위 대신 공시가격 참고로 남는다", () => {
    expect(exams.some((e) => e.code === "B")).toBe(false);
    expect(notes.find((n) => n.code === "B")?.reason).toBe("unit");
  });
  it("표본이 모자란 항목은 사라지지 않고 표본 부족으로 표시된다", () => {
    expect(exams.some((e) => e.code === "C")).toBe(false);
    expect(notes.find((n) => n.code === "C")?.reason).toBe("sample");
  });
});
