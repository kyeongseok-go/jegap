import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import type { Hospital, HospitalData, PriceExam } from "./types";
import { percentileBelow } from "../engine/stats";

/**
 * 심평원 비급여 공개가격 어댑터.
 * 전처리: scripts/ingest_hira.py → data/hira.json.gz (활용신청 승인 후 실행 — 절차는 스크립트 참조).
 * 원칙: 아파트편과 동일 — 판정 없음, 위치(백분위)와 중간값 대비 배수만. 무광고·환자유인 없음.
 */

interface HiraRecord {
  id: string; name: string; sido: string; sigungu: string; kind: string;
  items: Array<[string, string, number]>;  // [code, name, price]
}

const DATA_PATH = join(process.cwd(), "data", "hira.json.gz");

let cache: {
  all: HospitalData[];
  byId: Map<string, HospitalData>;
  // (code|sido|kind) → 가격 배열 (유사군 통계용)
  peers: Map<string, number[]>;
} | null = null;

function load() {
  if (cache) return cache;
  const raw: HiraRecord[] = JSON.parse(gunzipSync(readFileSync(DATA_PATH)).toString("utf-8"));
  const all: HospitalData[] = raw.map((r) => ({
    h: { id: r.id, name: r.name, sido: r.sido, sigungu: r.sigungu, kind: r.kind },
    items: r.items.map(([code, name, price]) => ({ code, name, price })),
  }));
  const byId = new Map(all.map((d) => [d.h.id, d]));
  const peers = new Map<string, number[]>();
  for (const d of all)
    for (const it of d.items) {
      const k = `${it.code}|${d.h.sido}|${d.h.kind}`;
      const arr = peers.get(k) ?? [];
      arr.push(it.price);
      peers.set(k, arr);
    }
  cache = { all, byId, peers };
  return cache;
}

export function hiraReady(): boolean { return existsSync(DATA_PATH); }

export function searchHospitals(q: string): Hospital[] {
  const t = q.trim();
  if (!t) return [];
  return load().all
    .filter((d) => d.h.name.includes(t))
    .slice(0, 8)
    .map((d) => d.h);
}

export function getHospital(id: string): HospitalData | null {
  return load().byId.get(id) ?? null;
}

const MIN_PEERS = 30; // 아파트편과 동일 원칙 — 표본이 얇으면 표시하지 않는다(무소음)

export function priceExams(d: HospitalData): PriceExam[] {
  const { peers } = load();
  const out: PriceExam[] = [];
  for (const it of d.items) {
    const arr = peers.get(`${it.code}|${d.h.sido}|${d.h.kind}`);
    if (!arr || arr.length < MIN_PEERS) continue;
    const pctBelow = percentileBelow(it.price, arr);
    if (pctBelow === null) continue;
    const sorted = [...arr].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    if (median <= 0) continue;
    out.push({
      code: it.code, name: it.name, price: it.price,
      peerCount: arr.length,
      percentile: 100 - pctBelow,             // 상위 N% (비싼 쪽)
      median,
      multiple: Math.round((it.price / median) * 10) / 10,
    });
  }
  // 배수 큰 순 — 사실 정렬 (판정 아님)
  return out.sort((a, b) => b.multiple - a.multiple);
}
