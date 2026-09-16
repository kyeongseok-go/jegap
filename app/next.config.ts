import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 서버리스 번들에 데이터·폰트 포함 (누락 시 조용히 fixture 폴백 — 반드시 유지)
  outputFileTracingIncludes: {
    "/**": ["./data/*.gz"],
    "/d/[code]/opengraph-image": ["./assets/fonts/*"],
  },
};

export default nextConfig;
