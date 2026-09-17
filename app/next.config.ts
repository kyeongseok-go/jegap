import type { NextConfig } from "next";

/** CSP는 우선 Report-Only로만 건다. 지금 페이지는 Google Fonts 스타일시트와
 * Next의 인라인 부트스트랩 스크립트를 쓰기 때문에 바로 강제하면 폰트·하이드레이션이 깨진다.
 * 배포 후 위반 보고를 보고 완화·강화한 다음 Content-Security-Policy로 승격한다.
 * frame-ancestors는 Report-Only에서 강제되지 않으므로 X-Frame-Options로 실제 차단을 건다. */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next 인라인 부트스트랩/개발 전용 eval
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        ],
      },
    ];
  },
};

export default nextConfig;
