import { TOOLS } from "./tools";
import { CATEGORIES, categorize } from "./categories";

/**
 * Which tools may be offered to search engines.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 * AdSense rejected usmoneyhq.com a second time on 2026-10-15 for "Low value
 * content", after the variant-page fix in lib/indexing.ts had already taken the
 * sitemap from 1,939 URLs to 140.
 *
 * So the remaining exposure is not duplication — it is *scope*. The site's own
 * positioning is "Pay, Tax, Mortgage & Retirement Calculators", and the homepage
 * says "US Money HQ — Pay, Tax, Mortgage & Retirement". Against that promise the
 * sitemap was also publishing:
 *
 *   7  health & fitness      tdee, bmi, body-fat, water-intake, sleep,
 *                            calorie-deficit, heart-rate
 *   2  education             gpa, grade
 *   1  pregnancy             due-date
 *   11 raw material quantity topsoil, sod, mulch, gravel, concrete, paint, tile,
 *                            wallpaper, drywall, carpet, fence
 *   4  generic utilities     percentage, percentage-change, date, time-duration
 *   ──
 *   25 of 105 tools (24%) whose subject is not money
 *
 * AdSense's stated test is that a site must "establish a consistent presence on
 * the web". A money-calculator site that also ranks for "how much topsoil do I
 * need" is not inconsistent in a small way — it is the classic shape of a
 * programmatic aggregator, which is what the reviewer is screening for. The
 * off-topic pages are individually fine; together they describe a different,
 * weaker site than the one being asked to carry finance advertising.
 *
 * ── DELIBERATELY NOT INCLUDED ───────────────────────────────────────────────
 * Cost and consumption tools stay in scope because they are money: gas-cost,
 * electricity-cost, construction-cost, home-remodel-cost, moving-cost,
 * square-footage (used to price work), price-per-square-foot, mileage-
 * reimbursement, miles-per-gallon. Excluding those would be a topicality
 * judgement made by pattern-matching rather than by whether the answer is about
 * dollars.
 *
 * ── WHAT BEING OUT OF SCOPE DOES ────────────────────────────────────────────
 *   - sitemap omits the tool, and omits a category hub with no in-scope tools
 *   - ToolPageShell emits `noindex, follow`
 *   - the tool is dropped from hub grids and from other tools' `related` lists
 *
 * The URLs stay live and fully functional for anyone who has them or deep-links
 * them, exactly as the variant pages do. Reversal is editing this one list.
 */

/** Slugs whose subject is not money. Every entry must exist in TOOLS. */
export const OUT_OF_SCOPE_SLUGS: readonly string[] = [
  // health, fitness and body — a different publisher's beat entirely
  "tdee-calculator",
  "water-intake-calculator",
  "sleep-calculator",
  "body-fat-calculator",
  "bmi-calculator",
  "calorie-deficit-calculator",
  "heart-rate-calculator",
  // education
  "gpa-calculator",
  "grade-calculator",
  // pregnancy
  "due-date-calculator",
  // raw material quantity — how much to buy, with the dollars bolted on
  "topsoil-calculator",
  "sod-calculator",
  "mulch-calculator",
  "gravel-calculator",
  "concrete-calculator",
  "paint-calculator",
  "tile-calculator",
  "wallpaper-calculator",
  "drywall-calculator",
  "carpet-calculator",
  "fence-calculator",
  // generic arithmetic and date utilities
  "percentage-calculator",
  "percentage-change-calculator",
  "date-calculator",
  "time-duration-calculator",
];

const OUT_OF_SCOPE = new Set(OUT_OF_SCOPE_SLUGS);

// Guard: a typo'd slug here would silently do nothing, and the page it was meant
// to exclude would keep being published. Fail the build instead of under-reporting.
const KNOWN = new Set(TOOLS.map((t) => t.slug));
const unknown = OUT_OF_SCOPE_SLUGS.filter((s) => !KNOWN.has(s));
if (unknown.length) {
  throw new Error(
    `topical.ts: OUT_OF_SCOPE_SLUGS references slugs that are not tools: ${unknown.join(", ")}. ` +
      `Either the slug is misspelled or the tool was removed — fix the list, because a ` +
      `no-op entry here is a page that stays indexable by accident.`
  );
}

/** True when the tool's subject is outside the site's money remit. */
export function isOutOfScope(slug: string): boolean {
  return OUT_OF_SCOPE.has(slug);
}

/** The tools that may be offered to search engines. Derived, never hand-listed. */
export const IN_SCOPE_TOOLS = TOOLS.filter((t) => !isOutOfScope(t.slug));

/** How many tools are excluded, for reporting in a build log. */
export const OUT_OF_SCOPE_COUNT = TOOLS.length - IN_SCOPE_TOOLS.length;

/**
 * True when a category hub has no in-scope tools, so the hub is only a doorway to
 * pages we are not offering. Derived from the tool list rather than hand-listed:
 * a hub becomes empty because its tools moved, and a hand-list would miss that.
 */
export function isCategoryOutOfScope(categorySlug: string): boolean {
  return !TOOLS.some((t) => !isOutOfScope(t.slug) && categorize(t.slug).slug === categorySlug);
}

/** The hubs still worth offering to search engines. */
export const IN_SCOPE_CATEGORIES = CATEGORIES.filter((c) => !isCategoryOutOfScope(c.slug));

/**
 * Guides whose subject is not money.
 *
 * The tool list was not enough: /guides/health-fitness-guide was indexable AND in
 * the sitemap, titled "Health & Fitness Guide 2026 — TDEE, BMI & Hydration". A money
 * site publishing a hydration guide is the same inconsistency the tool exclusions
 * address, and fixing only the tools would have left the guide promoting five of
 * them. home-improvement-guide is deliberately NOT here — it is about budgeting for
 * a renovation, which is money, even though the raw-material calculators it links to
 * are out of scope.
 */
export const OUT_OF_SCOPE_GUIDE_SLUGS: readonly string[] = ["health-fitness-guide"];

const OUT_OF_SCOPE_GUIDES = new Set(OUT_OF_SCOPE_GUIDE_SLUGS);

/** True when a guide's subject is outside the site's money remit. */
export function isGuideOutOfScope(slug: string): boolean {
  return OUT_OF_SCOPE_GUIDES.has(slug);
}
