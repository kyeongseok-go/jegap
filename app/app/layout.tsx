import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "../lib/site";

const TITLE = "JEGAP 제값 — 우리 단지 검진";
const DESC =
  "우리 아파트 관리비, 나만 많이 내는 걸까? 관리비·병원비·학원비·장례비·생활물가를 정부 공개 데이터로 30초 만에 검진합니다. 로그인 없음.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESC,
  openGraph: {
    type: "website", siteName: "JEGAP 제값", locale: "ko_KR",
    url: SITE_URL, title: TITLE, description: DESC,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#F4F1E7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@500;700;800&display=swap" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
        />
      </head>
      <body id="top">
        <a className="skip" href="#main">본문으로 건너뛰기</a>
        {children}
      </body>
    </html>
  );
}
