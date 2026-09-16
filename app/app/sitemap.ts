import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { SIDOS } from "../lib/living";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = ["", "/h", "/a", "/f", "/p", "/method", "/terms"];
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
