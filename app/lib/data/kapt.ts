import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import type { DanjiData } from "../engine/types";
import type { DataSource } from "./source";
import { fixtureSource } from "./fixture";

/**
 * 실데이터 어댑터 — K-apt 파일데이터 벌크 (ADR-01 확정 경로).
 * 전처리: scripts/ingest.py → data/kapt.json.gz (주간 갱신 시 재실행 후 재배포).
 * 출처: 국토교통부 K-apt 자료실 (기본정보·면적정보·관리비정보, 2026-09-14 기준).
 * 외부 런타임 의존 0 — 가용성 헌법(6조)에 따라 DB 대신 번들 파일.
 */

/** 전처리 산출 레코드 (ingest.py와 필드 계약) */
interface KaptRecord {
  c: string; name: string; sido: string; sigungu: string;
  builtYear: number; households: number; heating: string;
  sale?: string;   // 분양형태 (분양/임대)
  kind?: string;   // 단지분류
  fees: Array<[string, number, number]>;  // [ym, total ㎡당, heating ㎡당]
  rv: number;   // 장충금 월부과 ㎡당
  rt: number;   // 장충금 총적립액(원)
  rp: number;   // 장충금 적립률(%)
}

const DATA_PATH = join(process.cwd(), "data", "kapt.json.gz");

let cache: { all: DanjiData[]; byCode: Map<string, DanjiData>; worst: DanjiData } | null = null;

function toDanjiData(r: KaptRecord): DanjiData {
  return {
    danji: {
      domain: "apartment",
      code: r.c, name: r.name, sido: r.sido, sigungu: r.sigungu,
      builtYear: r.builtYear, households: r.households, heating: r.heating,
    },
    fees: r.fees.map(([ym, total, heating]) => ({ ym, total, heating })),
    reserve: { perM2: r.rv, totalWon: r.rt, ratePct: r.rp },
  };
}

function load() {
  if (cache) return cache;
  const raw: KaptRecord[] = JSON.parse(gunzipSync(readFileSync(DATA_PATH)).toString("utf-8"));
  const all = raw.map(toDanjiData);
  const byCode = new Map(all.map((d) => [d.danji.code, d]));
  // 홈 사례 선정 — 판정이 아니라 사실 기준: 장충금 부과 ㎡당 최저권.
  // 서사가 성립하는 표본으로 한정: 분양 대단지(2,500세대+), 준공 20년+(수선 주기 접근),
  // 난방 시계열 존재(관리비 흐름 검사 가능), 36개월+ 공시. 결정론(동률은 코드 순).
  // 세대수 하한을 2,500으로 둔 이유: ① 영향받는 세대가 많아 공익성이 크고
  // ② 이름이 알려진 단지라 처음 보는 사람이 척도를 바로 감각한다. 기준은 화면에 밝힌다.
  const nowYear = 2026;
  const saleOf = new Map(raw.map((r) => [r.c, r.sale ?? ""]));
  const candidates = all
    .filter((d) =>
      d.danji.households >= 2500 &&
      d.danji.builtYear <= nowYear - 20 &&
      d.fees.length >= 36 &&
      d.reserve.perM2 > 0 &&
      saleOf.get(d.danji.code) === "분양" &&
      d.fees.filter((f) => f.heating > 0).length >= 24)
    .sort((a, b) => a.reserve.perM2 - b.reserve.perM2 || a.danji.code.localeCompare(b.danji.code));
  const worst = candidates[0] ?? all[0];
  cache = { all, byCode, worst };
  return cache;
}

export function makeKaptSource(): DataSource | null {
  if (!existsSync(DATA_PATH)) return null;
  return {
    isSample: false,
    async search(q) {
      const t = q.trim();
      if (!t) return [];
      const { all } = load();
      return all
        .filter((d) => d.danji.name.includes(t))
        .slice(0, 8)
        .map((d) => ({ code: d.danji.code, name: d.danji.name, sigungu: d.danji.sigungu }));
    },
    async get(code) { return load().byCode.get(code) ?? null; },
    async all() { return load().all; },
    async worst() { return load().worst; },
  };
}

/** 소스 선택: 인제스트 산출물이 있으면 실데이터, 없으면 fixture (isSample 고지 포함) */
export function getSource(): DataSource {
  return makeKaptSource() ?? fixtureSource;
}
