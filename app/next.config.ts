import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OG 이미지 라우트가 fs로 읽는 폰트를 서버리스 번들에 포함
  outputFileTracingIncludes: {
    "/d/[code]/opengraph-image": ["./assets/fonts/*"],
  },
};

export default nextConfig;
