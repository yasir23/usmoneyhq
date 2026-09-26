/**
 * Material content-change dates, one per content group.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * app/sitemap.ts previously used `const now = new Date()` and stamped that value on
 * every entry. Measured on the live sitemap 2026-09-19: 1,938 <lastmod> values, of
 * which exactly 1 was distinct (`2026-09-18T07:07:35.830Z`). Every deploy therefore
 * told crawlers that the entire site had just changed, which is indistinguishable
 * from telling them nothing changed — and it wastes recrawl budget on pages whose
 * content is identical to last week.
 *
 * These dates are MAINTAINED BY HAND. Move a date only when the content under that
 * key genuinely changes — a tax rate, bracket, formula, deduction, or the explanatory
 * text itself. Do NOT move it because code was deployed, a build ran, or a template
 * was refactored. The value of this file is that it is boring and honest.
 *
 * RE-SEEDED 2026-09-26 from `git log -1 --format=%cs -- <file>`, the procedure this
 * file documents for itself. Three values had drifted from reality in both
 * directions and all three were corrected:
 *   guides   was 2026-09-18, actual 2026-09-11  (overstated freshness by 7 days)
 *   legal    was 2026-09-08, actual 2026-08-28  (overstated freshness by 11 days)
 *   metros   was 2026-09-18, actual 2026-09-22  (understated: content was 4 days
 *                                                NEWER than the sitemap claimed)
 * `scripts/check_content_dates.py` now compares this file against git so the drift
 * is detectable instead of silent.
 *
 * NOTE ON UNIFORMITY: 2026-09-26 legitimately covers both `site` and `tools`,
 * because one content push that day changed the tax engine, the tool registry and
 * the two editorial pages together. Several groups sharing a date is a real
 * statement about the work, not a synthetic one — do not spread dates apart to
 * look varied. Only the correct date for the content goes here.
 */

export const CONTENT_DATES = {
  /** Site-wide pages: home, about, methodology, contact, hubs. */
  site: "2026-09-26",
  /** lib/tools.ts — calculator definitions, formulas, and per-tool FAQ copy. */
  tools: "2026-09-26",
  /** lib/states.ts + lib/stateRates.ts — state tax structure and rate schedules. */
  states: "2026-09-26",
  /** lib/amounts.ts — salary and price scenario bands. */
  amounts: "2026-09-17",
  /** lib/metros.ts — metro definitions. */
  metros: "2026-09-22",
  /** Editorial guides and blog posts. */
  guides: "2026-09-11",
  /** Legal and policy pages: privacy, terms. */
  legal: "2026-08-28",
} as const;

export type ContentGroup = keyof typeof CONTENT_DATES;

/** Midnight UTC on the group's material-change date, for sitemap <lastmod>. */
export function contentDate(group: ContentGroup): Date {
  return new Date(`${CONTENT_DATES[group]}T00:00:00.000Z`);
}
