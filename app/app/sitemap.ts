import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { SIDOS } from "../lib/living";
import { ready as franchiseReady } from "../lib/franchise";
import { ready as oilReady } from "../lib/oil";
import { ready as goodsReady } from "../lib/goods";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // 연동 전 도메인은 색인에 올리지 않는다 — "준비 중"만 있는 페이지를 검색에 노출하지 않기 위함
  const pending: Array<[string, () => boolean]> = [["/fr", franchiseReady], ["/oil", oilReady], ["/gr", goodsReady]];
  const fixed = ["", "/h", "/a", "/f", "/p", "/method", "/terms",
    ...pending.filter(([, r]) => r()).map(([href]) => href)];
  return [
    ...fixed.map((p) => ({
      url: `${SITE_URL}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.8,
    })),
    ...SIDOS.map((s) => ({
      url: `${SITE_URL}/p/${encodeURIComponent(s.key)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
