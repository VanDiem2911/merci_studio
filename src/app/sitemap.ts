import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/categories";
import { CONCEPTS } from "@/data/concepts";
import { SITE } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/concept", "/bo-suu-tap", "/nhat-ky", "/bang-gia", "/gioi-thieu", "/lien-he", "/chon-concept", "/dat-lich"];
  return [
    ...fixed.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...CATEGORIES.map((c) => ({ url: `${SITE.url}/danh-muc/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...CONCEPTS.flatMap((c) => [
      { url: `${SITE.url}/concept/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 },
      { url: `${SITE.url}/bo-suu-tap/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.5 },
    ]),
  ];
}
