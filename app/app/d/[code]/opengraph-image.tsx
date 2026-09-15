import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSource } from "../../../lib/data/kapt";
import { runCheckup } from "../../../lib/engine/checkup";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

let fontCache: ArrayBuffer | null = null;
async function loadFont(): Promise<ArrayBuffer | null> {
  if (fontCache) return fontCache;
  // 1순위: 번들된 로컬 파일 (배포 후 외부 CDN 무관 — 가용성 원칙)
  try {
    const buf = await readFile(join(process.cwd(), "assets/fonts/Pretendard-Bold.otf"));
    fontCache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    return fontCache;
  } catch { /* 로컬 실패 시 CDN 폴백 */ }
  try {
    const r = await fetch(
      "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.otf"
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
  if (!font) {
    // satori는 폰트 없이 텍스트를 렌더할 수 없음 — 글자 없는 브랜드 판으로 500 방지
    return new ImageResponse(
      (<div style={{ width: "100%", height: "100%", display: "flex",
        background: "#FAFAF8", borderBottom: "16px solid #BF2E17" }} />),
      size
    );
  }
  const name = me?.danji.name ?? "JEGAP";
  const c = me ? runCheckup(me, await src.all()) : null;
  const pct = c && c.reservePercentile >= 0 ? Math.max(1, c.reservePercentile) : null;
  const warn = c?.overall === "warn";
  const resSig = c?.exams.find((e) => e.key === "reserve")?.signal;
  const flag = resSig === "warn" || resSig === "watch";

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: "#FAFAF8", color: "#0F1115", padding: 72,
        fontFamily: "Pretendard", justifyContent: "space-between",
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
              {flag
                ? <span style={{ color: "#BF2E17", fontWeight: 700 }}>하위 {pct}%</span>
                : <span style={{ fontWeight: 700 }}>일반적인 범위</span>}
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
      fonts: [{ name: "Pretendard", data: font, weight: 700 as const }],
    }
  );
}
