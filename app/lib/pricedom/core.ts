import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { percentileBelow } from "../engine/stats";

/**
 * 가격 도메인 공통 엔진 — "기관 × 공시 항목 가격"의 위치 검진.
 * 병원비(심평원)·학원비(NEIS)·장례비(e하늘)·원비(유치원알리미)가 이 계약 위에 선다.
 * 원칙은 관리비편과 동일: 판정 없음(위치·배수만), 표본 부족 시 미표시(무소음), 완화 시 명시.
 */

export interface Org {
  id: string; name: string; sido: string; sigungu: string; kind: string;
}
export interface OrgData { h: Org; items: Array<{ code: string; name: string; price: number }>; }
export interface PriceExam {
  code: string; name: string; price: number;
  peerCount: number; percentile: number; median: number; multiple: number;
  peerLabel: string;   // "서울 · 종합병원" / "강남구 · 입시보습" — 완화 결과 그대로 표기
}

interface Record_ {
  id: string; name: string; sido: string; sigungu: string; kind: string;
  items: Array<[string, string, number]>;
}

export interface DomainConfig {
  file: string;                       // data/ 아래 json.gz
  minPeers: number;
  /** 유사군 사다리 — 앞에서부터 시도, 표본이 minPeers 이상인 첫 규칙 사용 */
  peerKeys: Array<{ key: (o: Org, code: string) => string; label: (o: Org) => string }>;
}

export function makeDomain(cfg: DomainConfig) {
  const path = join(process.cwd(), "data", cfg.file);
  let cache: {
    all: OrgData[]; byId: Map<string, OrgData>;
    peers: Array<Map<string, number[]>>;      // peerKeys 순서별 인덱스
  } | null = null;

  function load() {
    if (cache) return cache;
    const raw: Record_[] = JSON.parse(gunzipSync(readFileSync(path)).toString("utf-8"));
    const all: OrgData[] = raw.map((r) => ({
      h: { id: r.id, name: r.name, sido: r.sido, sigungu: r.sigungu, kind: r.kind },
      items: r.items.map(([code, name, price]) => ({ code, name, price })),
    }));
    const byId = new Map(all.map((d) => [d.h.id, d]));
    const peers = cfg.peerKeys.map(() => new Map<string, number[]>());
    for (const d of all)
      for (const it of d.items)
        cfg.peerKeys.forEach((pk, i) => {
          const k = pk.key(d.h, it.code);
          const arr = peers[i].get(k) ?? [];
          arr.push(it.price);
          peers[i].set(k, arr);
        });
    cache = { all, byId, peers };
    return cache;
  }

  return {
    ready: () => existsSync(path),
    search(q: string): Org[] {
      const t = q.trim();
      if (!t) return [];
      return load().all.filter((d) => d.h.name.includes(t)).slice(0, 8).map((d) => d.h);
    },
    get: (id: string) => load().byId.get(id) ?? null,
    exams(d: OrgData): PriceExam[] {
      const { peers } = load();
      const out: PriceExam[] = [];
      for (const it of d.items) {
        // 완화 사다리: 표본이 충분한 가장 좁은 규칙
        let arr: number[] | undefined, label = "";
        for (let i = 0; i < cfg.peerKeys.length; i++) {
          const a = peers[i].get(cfg.peerKeys[i].key(d.h, it.code));
          if (a && a.length >= cfg.minPeers) { arr = a; label = cfg.peerKeys[i].label(d.h); break; }
        }
        if (!arr) continue;                                  // 무소음
        const pctBelow = percentileBelow(it.price, arr);
        if (pctBelow === null) continue;
        const sorted = [...arr].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        // 저액 항목(중간값 1,000원 미만)은 기관별 단위 해석이 갈려 배수가 무의미 — 미표시.
        // 중간값의 50배 초과·1/50 미만은 공시 입력 오류 가능성 — 미표시(무소음).
        if (median < 1000) continue;
        const m = it.price / median;
        if (m > 50 || m < 1 / 50) continue;
        out.push({
          code: it.code, name: it.name, price: it.price,
          peerCount: arr.length, percentile: 100 - pctBelow, median,
          multiple: Math.round((it.price / median) * 10) / 10,
          peerLabel: label,
        });
      }
      return out.sort((a, b) => b.multiple - a.multiple);
    },
  };
}
