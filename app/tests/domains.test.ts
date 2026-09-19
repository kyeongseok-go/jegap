import { describe, it, expect, afterAll } from "vitest";
import { writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { makeDomain } from "../lib/pricedom/core";
import { CONFIG as FRANCHISE } from "../lib/franchise";
import { CONFIG as OIL } from "../lib/oil";
import { CONFIG as GOODS } from "../lib/goods";

/**
 * 6~8호 도메인(창업비용·주유소·생필품) 계약 검증 — 실데이터 없이.
 *
 * 합성 픽스처를 어댑터가 읽는 자리에 잠깐 썼다가 지운다. 픽스처가 data/ 에 남으면
 * 프로덕션 번들에 섞이고 ready() 가 참이 되어 "준비 중"이 풀려버린다.
 * 그래서 로드 직후 반드시 지우고(캐시는 메모리에 남는다), 파일에도 남지 않았는지 확인한다.
 */
type Row = { id: string; name: string; sido: string; sigungu: string; kind: string;
             items: Array<[string, string, number, number]> };

const written: string[] = [];
/** 어댑터의 실제 유사군 규칙(CONFIG)을 그대로 쓰되 파일명만 픽스처로 바꾼다.
 *  실데이터 파일명을 쓰지 않으므로 테스트가 죽어도 프로덕션 데이터가 오염되지 않는다. */
function plant(cfg: typeof FRANCHISE, rows: Row[]) {
  const file = `__fixture_${cfg.file}`;
  const p = join(process.cwd(), "data", file);
  writeFileSync(p, gzipSync(Buffer.from(JSON.stringify(rows), "utf-8")));
  written.push(p);
  const dom = makeDomain({ ...cfg, file });
  const d = dom.get("me")!;
  const out = { d, exams: dom.exams(d), notes: dom.notes(d) };
  rmSync(p, { force: true });
  written.pop();
  return out;
}
function unplant() { for (const p of written.splice(0)) rmSync(p, { force: true }); }
afterAll(unplant);

const rep = (n: number, f: (i: number) => Row) => Array.from({ length: n }, (_, i) => f(i));

// ── 창업비용: 지역이 없고 업종이 유사군이다 ─────────────────────────────
describe("창업비용편(공정위) — 업종이 유사군", () => {
  const rows: Row[] = [
    ...rep(40, (i) => ({ id: `han${i}`, name: `한식${i}`, sido: "외식", sigungu: "", kind: "한식",
      items: [["jng", "가맹금", 5_000_000, 1]] })),
    // 업종이 다른 브랜드 — 자릿수가 다르다. 한식 표본에 섞이면 중간값이 무너진다.
    ...rep(40, (i) => ({ id: `chk${i}`, name: `치킨${i}`, sido: "외식", sigungu: "", kind: "치킨",
      items: [["jng", "가맹금", 20_000_000, 1]] })),
    // 범위로 공시된 가맹금(rankable=0) — **같은 code 를 쓴다.**
    // 코드가 다르면 표본이 애초에 섞일 수 없어 오염 검증이 성립하지 않는다(돌연변이 테스트로 발견).
    ...rep(40, (i) => ({ id: `rng${i}`, name: `범위${i}`, sido: "외식", sigungu: "", kind: "한식",
      items: [["jng", "가맹금", 40_000_000, 0]] })),
    { id: "me", name: "검진대상", sido: "외식", sigungu: "", kind: "한식",
      items: [["jng", "가맹금", 9_000_000, 1], ["edu", "교육비", 3_000_000, 0], ["rare", "희귀항목", 700_000, 1]] },
  ];
  const { exams, notes } = plant(FRANCHISE, rows);

  it("업종이 다른 브랜드는 표본에 섞이지 않는다", () => {
    const e = exams.find((x: { code: string }) => x.code === "jng")!;
    expect(e.median).toBe(5_000_000);        // 치킨 2천만원이 섞였다면 중간값이 올라간다
    expect(e.peerCount).toBe(40);
    expect(e.peerLabel).toContain("한식");
  });
  it("범위로 공시된 항목은 순위 대신 공시가격 참고로 남는다", () => {
    expect(exams.some((x: { code: string }) => x.code === "edu")).toBe(false);
    expect(notes.find((n: { code: string }) => n.code === "edu")?.reason).toBe("unit");
  });
  it("범위 공시분 40곳이 가맹금 표본을 오염시키지 않는다", () => {
    const e = exams.find((x: { code: string }) => x.code === "jng")!;
    expect(e.peerCount).toBe(40);            // 80이면 범위 공시분이 섞인 것
    expect(e.median).toBe(5_000_000);        // 4천만원이 섞였다면 중간값이 치솟는다
  });
  it("표본이 모자란 항목은 사라지지 않고 표본 부족으로 표시된다", () => {
    expect(exams.some((x: { code: string }) => x.code === "rare")).toBe(false);
    expect(notes.find((n: { code: string }) => n.code === "rare")?.reason).toBe("sample");
  });
});

// ── 주유소: 유종이 섞이면 안 된다 ────────────────────────────────────
describe("주유소편(오피넷) — 유종별 비교", () => {
  const rows: Row[] = [
    ...rep(12, (i) => ({ id: `s${i}`, name: `서울${i}구`, sido: "서울", sigungu: `${i}구`, kind: "주유소 평균",
      items: [["B027", "휘발유", 1900, 1], ["D047", "경유", 1750, 1]] })),
    // 경유가 휘발유 표본에 섞이면 중간값이 내려간다 — 다른 시도 표본으로 압박
    ...rep(12, (i) => ({ id: `b${i}`, name: `부산${i}구`, sido: "부산", sigungu: `${i}구`, kind: "주유소 평균",
      items: [["B027", "휘발유", 1830, 1], ["D047", "경유", 1700, 1]] })),
    { id: "me", name: "서울종로구", sido: "서울", sigungu: "종로구", kind: "주유소 평균",
      items: [["B027", "휘발유", 2100, 1], ["C004", "실내등유", 1400, 1]] },
  ];
  const { exams, notes } = plant(OIL, rows);

  it("유종이 다르면 같은 표본에 들어가지 않는다", () => {
    const e = exams.find((x: { code: string }) => x.code === "B027")!;
    expect(e.median).toBe(1900);             // 경유 1750이 섞였다면 중간값이 내려간다
    expect(e.peerCount).toBe(12);
    expect(e.peerLabel).toContain("서울");
  });
  it("같은 시도 안에서만 비교하고 그 기준을 라벨에 드러낸다", () => {
    const e = exams.find((x: { code: string }) => x.code === "B027")!;
    expect(e.multiple).toBeCloseTo(1.1, 1);  // 2100 / 1900
    expect(e.peerLabel).not.toContain("전국");
  });
  it("표본이 없는 유종은 순위를 내지 않는다", () => {
    expect(exams.some((x: { code: string }) => x.code === "C004")).toBe(false);
    expect(notes.find((n: { code: string }) => n.code === "C004")?.reason).toBe("sample");
  });
});

// ── 생필품: 완화 사다리가 라벨에 드러나야 한다 ────────────────────────
describe("생필품편(참가격) — 완화 사다리", () => {
  const rows: Row[] = [
    // 강남구 안에는 5곳뿐 → 시군구로는 표본 미달, 서울 전체로 넓혀야 한다
    ...rep(5, (i) => ({ id: `g${i}`, name: `강남점${i}`, sido: "서울", sigungu: "강남구", kind: "대형마트",
      items: [["P1", "우유 1L", 3000, 1]] })),
    ...rep(40, (i) => ({ id: `o${i}`, name: `서울점${i}`, sido: "서울", sigungu: `기타${i}구`, kind: "대형마트",
      items: [["P1", "우유 1L", 2800, 1]] })),
    { id: "me", name: "검진점포", sido: "서울", sigungu: "강남구", kind: "대형마트",
      items: [["P1", "우유 1L", 3500, 1]] },
  ];
  const { exams } = plant(GOODS, rows);

  it("시군구 표본이 모자라면 시도로 넓히고 그 사실을 라벨에 적는다", () => {
    const e = exams.find((x: { code: string }) => x.code === "P1")!;
    expect(e.peerLabel).toContain("표본 확대");
    expect(e.peerCount).toBeGreaterThanOrEqual(30);
  });
  it("넓힌 표본에는 강남구 5곳도 함께 들어간다", () => {
    const e = exams.find((x: { code: string }) => x.code === "P1")!;
    expect(e.peerCount).toBe(45);            // 강남 5 + 기타 40 (자기 자신 제외)
  });
});

// ── 픽스처가 남지 않았는지 ───────────────────────────────────────────
// 실제로 사고가 났다: 테스트 초기 버전이 실파일명(data/franchise.json.gz)으로 픽스처를 쓰고
// 로드 실패로 죽어 정리가 안 됐다. 합성 데이터가 남으면 ready() 가 참이 되어 "준비 중"이 풀리고
// 탭이 노출되며, 빌드에 섞여 프로덕션에 나갈 뻔했다. 그래서 목록 자체를 고정한다.
describe("픽스처 격리", () => {
  it("테스트가 만든 픽스처가 data/ 에 남지 않는다", () => {
    for (const f of [FRANCHISE.file, OIL.file, GOODS.file])
      expect(existsSync(join(process.cwd(), "data", `__fixture_${f}`))).toBe(false);
  });

  it("data/ 에는 허용된 실데이터 파일만 있다", () => {
    // 새 도메인의 실데이터를 넣을 때 이 목록에 함께 추가한다. 목록에 없는 파일이 생기면 실패한다.
    const ALLOWED = new Set([
      "kapt.json.gz", "hira.json.gz", "academy.json.gz", "funeral.json.gz",
      "living.json.gz", "goodprice.json.gz", "highlights.json",
      FRANCHISE.file, OIL.file, GOODS.file,
    ]);
    const stray = readdirSync(join(process.cwd(), "data")).filter((f) => !ALLOWED.has(f));
    expect(stray).toEqual([]);
  });
});
