import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

/**
 * 생활물가편(5호) — 행안부 지방물가(하모니) 월별 시도 조사 + 착한가격업소.
 * 검진 대상이 기관이 아니라 '우리 지역'인 도메인. 원칙 동일: 위치·배수·사실 서술만.
 */

interface LivingData {
  months: string[];
  items: Array<{ code: string; name: string; cat: string }>;
  series: Record<string, Array<number | null>>;   // "code|시도" → 월별
}
interface Shop { sido: string; sigungu: string; kind: string; name: string; addr: string; menus: Array<[string, number]>; }

const LIVING = join(process.cwd(), "data", "living.json.gz");
const SHOPS = join(process.cwd(), "data", "goodprice.json.gz");

/** 하모니 시도 표기 → (표시명, 착한가격업소 시도명 매칭 접두) */
export const SIDOS: Array<{ key: string; label: string; shopPrefix: string }> = [
  { key: "서울", label: "서울특별시", shopPrefix: "서울" },
  { key: "부산", label: "부산광역시", shopPrefix: "부산" },
  { key: "대구", label: "대구광역시", shopPrefix: "대구" },
  { key: "인천", label: "인천광역시", shopPrefix: "인천" },
  { key: "전남광주(광주)", label: "광주광역시", shopPrefix: "광주" },
  { key: "대전", label: "대전광역시", shopPrefix: "대전" },
  { key: "울산", label: "울산광역시", shopPrefix: "울산" },
  { key: "경기", label: "경기도", shopPrefix: "경기" },
  { key: "강원", label: "강원특별자치도", shopPrefix: "강원" },
  { key: "충북", label: "충청북도", shopPrefix: "충청북" },
  { key: "충남", label: "충청남도", shopPrefix: "충청남" },
  { key: "전북", label: "전북특별자치도", shopPrefix: "전북" },
  { key: "전남광주(전남)", label: "전라남도", shopPrefix: "전라남" },
  { key: "경북", label: "경상북도", shopPrefix: "경상북" },
  { key: "경남", label: "경상남도", shopPrefix: "경상남" },
  { key: "제주", label: "제주특별자치도", shopPrefix: "제주" },
];

let cache: { d: LivingData; shops: Shop[] } | null = null;
function load() {
  if (cache) return cache;
  const d: LivingData = JSON.parse(gunzipSync(readFileSync(LIVING)).toString("utf-8"));
  const shops: Shop[] = existsSync(SHOPS)
    ? JSON.parse(gunzipSync(readFileSync(SHOPS)).toString("utf-8")) : [];
  cache = { d, shops };
  return cache;
}

export function livingReady(): boolean { return existsSync(LIVING); }

/** 표에서 제외 — 중복 품목(삼겹살 환산 전은 환산 후와 중복) */
const EXCLUDE = new Set(["BD"]);

/** 공식 조사 단위 — 하모니 각주 원문 기준 (근거 없는 품목은 표기하지 않음) */
export const UNITS: Record<string, string> = {
  BA: "1인분", BB: "1인분", BC: "1인분", BF: "1인분", BG: "1인분", BH: "1인분",
  BI: "1줄", BE: "200g",
  CA: "1회", CB: "1일", CC: "1회", CD: "1회", CE: "1회",
  DA: "20kg", DB: "100g", DC: "100g", DD: "1마리", DE: "10개",
  DF: "1포기", DG: "1개", DH: "1kg", DI: "100g", DJ: "1kg",
};

/** 원자료 용어 → 표시명 (의미 부연 없이 다듬기만) */
const DISPLAY: Record<string, string> = {
  BE: "삼겹살(외식)",
  "AA": "전철 기본요금(카드)", "AB": "전철 기본요금(현금)",
  "AC": "시내버스(카드)", "AD": "시내버스(현금)",
};

/** 시계열 단절(조사 기준·단위 변경 의심) — 전월 대비 ±35% 초과 점프의 마지막 지점.
 * 단절 이전 값과의 변화율 비교는 허위 서술이 되므로 하지 않는다(무소음). */
function lastBreak(arr: Array<number | null>): number {
  let brk = 0, prev: number | null = null, prevIdx = -1;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (typeof v !== "number" || v <= 0) continue;
    if (prev !== null && i - prevIdx <= 3 && Math.abs(v / prev - 1) > 0.35) brk = i;
    prev = v; prevIdx = i;
  }
  return brk;
}
export function latestMonth(): string {
  const { d } = load();
  let best = 0;
  for (const v of Object.values(d.series)) {
    for (let i = v.length - 1; i > best; i--) if (typeof v[i] === "number" && v[i]! > 0) { best = Math.max(best, i); break; }
  }
  return d.months[best];
}

export interface LivingExam {
  code: string; name: string; cat: string; unit?: string;
  latest: number; latestYm: string;
  median: number;            // 같은 달 17개 시도 중간값
  multiple: number;
  rank: number; of: number;  // 높은 순 순위 (1 = 가장 비쌈)
  rise3y: number | null;     // 36개월 전 같은 달 대비 %
  spark: Array<number | null>;
}

/** 최신 유효값과 그 달 인덱스 */
function lastVal(arr: Array<number | null>): [number, number] | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = arr[i];
    if (typeof v === "number" && v > 0) return [v, i];
  }
  return null;
}

export function livingExams(sidoKey: string): LivingExam[] {
  const { d } = load();
  const out: LivingExam[] = [];
  for (const it of d.items) {
    if (EXCLUDE.has(it.code)) continue;
    const mine = d.series[`${it.code}|${sidoKey}`];
    if (!mine) continue;
    const lv = lastVal(mine);
    if (!lv) continue;
    const [latest, idx] = lv;
    // 같은 달의 시도별 값들
    const peers = SIDOS.map((s) => d.series[`${it.code}|${s.key}`]?.[idx])
      .filter((v): v is number => typeof v === "number" && v > 0);
    if (peers.length < 10) continue;                    // 표본 부족 — 무소음
    const sorted = [...peers].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    if (median <= 0) continue;
    const rank = peers.filter((v) => v > latest).length + 1;
    const brk = lastBreak(mine);
    const pastIdx = idx - 36;
    const past = pastIdx >= brk ? mine[pastIdx] : null;
    out.push({
      code: it.code, name: DISPLAY[it.code] ?? it.name, cat: it.cat, unit: UNITS[it.code],
      latest, latestYm: d.months[idx],
      median, multiple: Math.round((latest / median) * 100) / 100,
      rank, of: peers.length,
      rise3y: typeof past === "number" && past > 0 ? Math.round(((latest - past) / past) * 100) : null,
      spark: mine.slice(-36),
    });
  }
  return out.sort((a, b) => b.multiple - a.multiple);
}

/** 원재료쌍 — 밥상 물가의 궤적 대조 (전국 중간값 기준, 지수화) */
export const PAIRS = [
  { cooked: "BE", raw: "DC", label: "식당 삼겹살 vs 돼지고기(소매)" },
  { cooked: "BG", raw: "DD", label: "삼계탕 vs 닭고기(소매)" },
] as const;

export interface PairTrend { label: string; cookedName: string; rawName: string;
  cookedRise: number; rawRise: number; months: number; }

export function pairTrends(): PairTrend[] {
  const { d } = load();
  const nameOf = (c: string) => DISPLAY[c] ?? d.items.find((i) => i.code === c)?.name ?? c;
  const natMedianSeries = (code: string): Array<number | null> =>
    d.months.map((_, i) => {
      const vals = SIDOS.map((s) => d.series[`${code}|${s.key}`]?.[i])
        .filter((v): v is number => typeof v === "number" && v > 0);
      if (vals.length < 10) return null;
      return [...vals].sort((a, b) => a - b)[Math.floor(vals.length / 2)];
    });
  // 최근 36개월 고정 창 — 같은 달끼리 비교해 계절 왜곡 방지
  const risePct = (arr: Array<number | null>): [number, number] | null => {
    let last = -1;
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i] !== null) { last = i; break; }
    if (last < 0) return null;
    let first = Math.max(last - 36, lastBreak(arr));
    while (first < last && arr[first] === null) first++;
    if (arr[first] === null || last - first < 12) return null;   // 1년 미만이면 미표시
    const a = arr[first]!, b = arr[last]!;
    return [Math.round(((b - a) / a) * 100), last - first];
  };
  const out: PairTrend[] = [];
  for (const p of PAIRS) {
    const c = risePct(natMedianSeries(p.cooked));
    const r = risePct(natMedianSeries(p.raw));
    if (!c || !r) continue;
    out.push({ label: p.label, cookedName: nameOf(p.cooked), rawName: nameOf(p.raw),
      cookedRise: c[0], rawRise: r[0], months: Math.min(c[1], r[1]) });
  }
  return out;
}

/** 착한가격업소 — 정부 지정 목록 (추천이 아니라 제도 안내) */
export function goodShops(shopPrefix: string) {
  const { shops } = load();
  const mine = shops.filter((s) => s.sido.startsWith(shopPrefix));
  const byKind = new Map<string, number>();
  for (const s of mine) byKind.set(s.kind, (byKind.get(s.kind) ?? 0) + 1);
  return {
    count: mine.length,
    kinds: [...byKind.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    sample: mine.filter((s) => s.menus.length > 0).slice(0, 8),
  };
}

/** 지역 종합 소견 — 결정론. 상위권 품목 수·최다 상승 품목만 서술. */
export function livingOpinion(sidoLabel: string, exams: LivingExam[]): string {
  if (exams.length === 0) return "";
  const top3 = exams.filter((e) => e.rank <= 3);
  const bottom = exams.filter((e) => e.rank >= e.of - 2);
  const withRise = exams.filter((e) => e.rise3y !== null);
  const maxRise = withRise.length
    ? withRise.reduce((a, b) => (b.rise3y! > a.rise3y! ? b : a)) : null;
  const parts: string[] = [];
  parts.push(`${sidoLabel}은(는) 비교 가능한 ${exams.length}개 품목 가운데 ${top3.length}개가 시도 중 상위 3위 안에 있습니다.`);
  if (bottom.length > 0) parts.push(`${bottom.length}개 품목은 하위 3위 안으로 낮은 편입니다.`);
  if (maxRise && maxRise.rise3y! > 0)
    parts.push(`최근 3년 동월 대비 가장 많이 오른 품목은 ${maxRise.name}(+${maxRise.rise3y}%)입니다.`);
  return parts.join(" ");
}
