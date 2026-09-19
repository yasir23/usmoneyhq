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
 * Seed source: `git log -1 --format=%cI -- <file>` on 2026-09-19.
 */

export const CONTENT_DATES = {
  /** Site-wide pages: home, about, methodology, contact, hubs. */
  site: "2026-09-18",
  /** lib/tools.ts — calculator definitions, formulas, and per-tool FAQ copy. */
  tools: "2026-09-18",
  /** lib/states.ts — state tax structure, property and sales tax averages. */
  states: "2026-09-18",
  /** lib/amounts.ts — salary and price scenario bands. */
  amounts: "2026-09-17",
  /** lib/metros.ts — metro definitions. */
  metros: "2026-09-18",
  /** Editorial guides and blog posts. */
  guides: "2026-09-18",
  /** Legal and policy pages: privacy, terms. */
  legal: "2026-09-08",
} as const;

export type ContentGroup = keyof typeof CONTENT_DATES;

/** Midnight UTC on the group's material-change date, for sitemap <lastmod>. */
export function contentDate(group: ContentGroup): Date {
  return new Date(`${CONTENT_DATES[group]}T00:00:00.000Z`);
}
