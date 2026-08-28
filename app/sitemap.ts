import type { MetadataRoute } from "next";
import { SITE_URL, TOOLS } from "@/lib/tools";

/** Dynamic sitemap — auto-includes every tool in the registry. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  for (const t of TOOLS) {
    pages.push({
      url: `${SITE_URL}/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }
  return pages;
}
