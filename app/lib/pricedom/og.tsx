import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

let fontCache: ArrayBuffer | null = null;
async function loadFont(): Promise<ArrayBuffer | null> {
  if (fontCache) return fontCache;
  try {
    const buf = await readFile(join(process.cwd(), "assets/fonts/Pretendard-Bold.otf"));
    fontCache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    return fontCache;
  } catch { return null; }
}

export const OG_SIZE = { width: 1200, height: 630 };

/** 가격 도메인 공용 OG — 기관/지역명 + 사실 한 줄. warn=true면 신호색 강조 */
export async function renderPriceOg(name: string, meta: string, factLine: string | null, hot: boolean) {
  const font = await loadFont();
  if (!font) {
    return new ImageResponse(
      (<div style={{ width: "100%", height: "100%", display: "flex",
        background: "#FAFAF8", borderBottom: "16px solid #BF2E17" }} />),
      OG_SIZE
    );
  }
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: "#FAFAF8", color: "#0F1115", padding: 72,
        fontFamily: "Pretendard", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>JEGAP</div>
          <div style={{ fontSize: 18, color: "#5A6472", letterSpacing: 8 }}>제 값</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.2 }}>{name}</div>
          <div style={{ fontSize: 26, color: "#5A6472", marginTop: 10 }}>{meta}</div>
          {factLine && (
            <div style={{ fontSize: 36, marginTop: 22, fontWeight: 700,
              color: hot ? "#BF2E17" : "#0F1115" }}>{factLine}</div>
          )}
        </div>
        <div style={{ fontSize: 24, color: "#5A6472", display: "flex" }}>
          내가 내는 값이 정당한가 — 공개 데이터 기준
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Pretendard", data: font, weight: 700 as const }] }
  );
}
