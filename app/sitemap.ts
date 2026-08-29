import type { MetadataRoute } from "next";
import { SITE_URL, TOOLS } from "@/lib/tools";
import { STATES, STATE_AWARE_TOOLS, getComparisonPairs } from "@/lib/states";

/** Dynamic sitemap — every tool + every state variant for state-aware tools. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/methodology`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/widgets`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
  for (const t of TOOLS) {
    pages.push({
      url: `${SITE_URL}/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }
  // state variants: state-aware tools x 50 states
  for (const slug of STATE_AWARE_TOOLS) {
    for (const s of STATES) {
      pages.push({
        url: `${SITE_URL}/${slug}/${s.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }
  // state-vs-state comparisons: state-aware tools x 45 top-state pairs
  const pairs = getComparisonPairs();
  for (const slug of STATE_AWARE_TOOLS) {
    for (const [a, b] of pairs) {
      pages.push({
        url: `${SITE_URL}/${slug}/${a.slug}-vs-${b.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return pages;
}
