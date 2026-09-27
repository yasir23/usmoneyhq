import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/sitemap-urls";

/**
 * Dynamic sitemap.
 *
 * The page list itself now lives in lib/sitemap-urls.ts so that other pages
 * (notably /premium, which states the published page count to subscribers) can
 * derive the same number from the same source instead of remembering one. See
 * that file for the reasoning behind every included and excluded cohort.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap() as MetadataRoute.Sitemap;
}
