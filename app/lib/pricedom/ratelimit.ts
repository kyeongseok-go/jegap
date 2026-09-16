/** LLM 대필 라우트 공용 레이트리밋 — 익명 과금 남용·CPU 증폭 방어.
 * 서버리스 인스턴스별 인메모리라 완전하지는 않지만, 단일 IP 루프 공격을 실효적으로 차단한다.
 * ponytail: 외부 스토어(전역 정확 리밋)는 남용 신호가 실제로 관찰되면 도입. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: Request): Response | null {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now >= b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (buckets.size > 10_000) buckets.clear();     // 메모리 상한
    return null;
  }
  if (++b.count > MAX_PER_WINDOW)
    return new Response("요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.", {
      status: 429, headers: { "retry-after": String(Math.ceil((b.resetAt - now) / 1000)) },
    });
  return null;
}
