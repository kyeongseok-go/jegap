import { ImageResponse } from "next/og";
import { getSource } from "../../../lib/data/kapt";
import { runCheckup } from "../../../lib/engine/checkup";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

let fontCache: ArrayBuffer | null = null;
async function loadFont(): Promise<ArrayBuffer | null> {
  if (fontCache) return fontCache;
  try {
    const r = await fetch(
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.otf"
    );
    if (!r.ok) return null;
    fontCache = await r.arrayBuffer();
    return fontCache;
  } catch { return null; }
}

export default async function OG({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const src = getSource();
  const me = await src.get(code);
  const font = await loadFont();
  const name = me?.danji.name ?? "JEGAP";
  const c = me ? runCheckup(me, await src.all()) : null;
  const pct = c && c.reservePercentile >= 0 ? c.reservePercentile : null;
  const warn = c?.overall === "warn";

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: "#FAFAF8", color: "#0F1115", padding: 72,
        fontFamily: font ? "Pretendard" : "sans-serif", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>JEGAP</div>
            <div style={{ fontSize: 18, color: "#5A6472", letterSpacing: 8 }}>제 값</div>
          </div>
          {warn && (
            <div style={{ display: "flex", border: "3px solid #BF2E17", color: "#BF2E17",
              padding: "10px 26px", fontSize: 30, fontWeight: 700 }}>주의</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.2 }}>{name}</div>
          {pct !== null && (
            <div style={{ fontSize: 40, marginTop: 18, display: "flex" }}>
              미래 수리비 저금, 비슷한 단지&nbsp;
              <span style={{ color: "#BF2E17", fontWeight: 700 }}>하위 {pct}%</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 24, color: "#5A6472", display: "flex" }}>
          관리비, 제값 내고 계십니까 — 국토교통부 K-apt 공시 기준
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Pretendard", data: font, weight: 700 as const }] : [],
    }
  );
}
