import type { NextConfig } from "next";

/** CSP는 우선 Report-Only로만 건다. 지금 페이지는 Google Fonts 스타일시트와
 * Next의 인라인 부트스트랩 스크립트를 쓰기 때문에 바로 강제하면 폰트·하이드레이션이 깨진다.
 * 배포 후 위반 보고를 보고 완화·강화한 다음 Content-Security-Policy로 승격한다.
 * 2026-09-20 로컬 전 경로(11개) CDP 실측: 위반 0건. 승격 준비 완료 —
 * 헤더 이름을 Content-Security-Policy 로 바꾸기만 하면 된다(사용자 확인 후).
 * frame-ancestors는 Report-Only에서 강제되지 않으므로 X-Frame-Options로 실제 차단을 건다. */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next 인라인 부트스트랩/개발 전용 eval
  // jsdelivr: Pretendard 가변 폰트(layout.tsx). Report-Only 에서 위반 20건으로 실측 확인 —
  // 이걸 빼고 승격하면 전 페이지 폰트가 깨진다.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // 서버리스 번들에 데이터·폰트 포함 (누락 시 조용히 fixture 폴백 — 반드시 유지)
  outputFileTracingIncludes: {
    "/**": ["./data/*.gz"],
    "/d/[code]/opengraph-image": ["./assets/fonts/*"],
  },
  // public/design/ 은 정적 산출물이다. Vercel 은 디렉터리 인덱스를 주지만 `next start` 는 주지 않아
  // 로컬에서 /design/ 이 404 가 된다(E2E 에서 실제로 걸렸다). 두 환경 모두에서 동작하게 rewrite 한다.
  async rewrites() {
    return [
      { source: "/design", destination: "/design/index.html" },
      { source: "/design/", destination: "/design/index.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: CSP_REPORT_ONLY },
        ],
      },
    ];
  },
};

export default nextConfig;
