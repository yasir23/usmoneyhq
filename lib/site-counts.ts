import { TOOLS } from "./tools";
import { publishedPageCount } from "./sitemap-urls";

/**
 * site-counts.ts — numbers the site states about ITSELF.
 *
 * Every figure here is DERIVED from the thing it describes, never typed in.
 *
 * Why this exists: `/premium` advertised "Ad-free across all 733 pages" and
 * "All 54 embeddable calculator widgets". Both were wrong and both were
 * surviving stale values — a sweep for the "1,938 indexable pages" error in
 * llms.txt never looked for 733, and 54 was never a cap at all. A number typed
 * into marketing copy cannot fail loudly when the product changes underneath it.
 *
 * public/llms.txt already carries the rule: "The counts above are asserted
 * against the sitemap, not remembered. ... If you prune the sitemap, update this
 * line in the same commit." These helpers make that automatic for every page.
 */

/** Tools that can actually calculate — i.e. expose at least one input field. */
export const CALCULATOR_TOOLS = TOOLS.filter(
  (t) => Array.isArray(t.fields) && t.fields.length > 0
);

/** Total calculators, including any tool that takes no input. */
export function calculatorCount(): number {
  return TOOLS.length;
}

/**
 * Embeddable widgets.
 *
 * `app/api/widget/[tool]/route.ts` has NO allowlist — it resolves any tool slug
 * through getTool(). So the embeddable set is every tool that has fields to
 * render. Verified 2026-09-27: all 105 tools have at least one field, so this
 * equals calculatorCount() today, but it is computed from the widget's actual
 * precondition rather than assumed to track the tool count forever.
 */
export function embeddableWidgetCount(): number {
  return CALCULATOR_TOOLS.length;
}

/** Pages published in the sitemap — the site's own authoritative inventory. */
export function publishedPages(): number {
  return publishedPageCount();
}

/**
 * Machine-readable access for /premium and any future pricing surface.
 * Call this rather than importing the individual helpers, so a new count only
 * has to be added in one place.
 */
export function siteCounts() {
  return {
    calculators: calculatorCount(),
    widgets: embeddableWidgetCount(),
    pages: publishedPages(),
  };
}
