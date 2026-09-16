import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 우리 단지 검진",
  description:
    "관리비, 제값 내고 계십니까? 정부 공개 데이터로 우리 단지의 관리비 흐름과 미래 수리비 저금을 30초 만에 검진합니다.",
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
