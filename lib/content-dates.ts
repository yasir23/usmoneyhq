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
  /**
   * Site-wide pages: home, about, methodology, contact, hubs, developers, premium.
   * 2026-10-05: homepage H1/description reframed around pay, tax, mortgage and
   * retirement; categories tiered finance-first. A material change to what the
   * page says, so the date moves — the rule is content, not code.
   * 2026-10-06: /contact gained the correction workflow and per-enquiry guidance;
   * /developers was rewritten around the live API capture; /premium gained tier,
   * licence and billing detail; and all five /calculators/<category> hubs gained
   * the editorial sections in lib/categories.ts.
   * 2026-10-07: re-seeded from `git log -1 --format=%cs` — that editorial work
   * SHIPPED on 10-07 (commit 719f734), and scripts/check_content_dates.py had
   * been flagging the group as stale against git ever since.
   */
  site: "2026-10-07",
  /**
   * lib/tools.ts (calculator definitions, formulas, FAQ copy) and
   * lib/toolContent.ts (the deep content on the base tool pages).
   * 2026-10-07: the last nine tools without deep content — auto-loan, concrete,
   * credit-card-payoff, debt-snowball, home-affordability, overtime,
   * self-employment-tax, social-security and tip — gained a full entry. Coverage
   * is now 105 of 105 base tool pages; every quoted figure is recomputed by
   * scripts/verify_tool_content.py, which went from ~90 to 169 assertions
   * (169 passed, 0 failed).
   * 2026-10-09: re-seeded from git — the stale 2024 long-term capital gains
   * figures on the capital-gains page were corrected in lib/tools.ts (f3ca13e),
   * which is a real change to the tool copy, not a refactor.
   */
  tools: "2026-10-09",
  /** lib/states.ts + lib/stateRates.ts — state tax structure and rate schedules. */
  states: "2026-09-26",
  /** lib/amounts.ts — salary and price scenario bands. */
  amounts: "2026-09-17",
  /** lib/metros.ts — metro definitions. */
  metros: "2026-09-22",
  /**
   * Editorial guides and blog posts.
   * 2026-10-06: the RMD guide was deepened with the Uniform Lifetime Table, a
   * worked two-distribution year and its known exclusions.
   * 2026-10-09: two money guides deepened to the 700-word floor (64b707b).
   * 2026-10-12: /guides/take-home-pay-by-metro-2026 added — the published HTML
   * face of the take-home-pay dataset, so the data asset is citable and
   * linkable rather than a bare JSON file.
   */
  guides: "2026-10-12",
  /**
   * Legal and policy pages: privacy, terms.
   * 2026-10-06: the privacy policy gained an explicit Google Analytics 4
   * disclosure and a description of the first-party counter.
   * 2026-10-07: re-seeded from git — that disclosure shipped on 10-07 (719f734).
   */
  legal: "2026-10-07",
} as const;

export type ContentGroup = keyof typeof CONTENT_DATES;

/** Midnight UTC on the group's material-change date, for sitemap <lastmod>. */
export function contentDate(group: ContentGroup): Date {
  return new Date(`${CONTENT_DATES[group]}T00:00:00.000Z`);
}

/**
 * "2026-10-06" -> "6 October 2026", for on-page "Last updated" lines.
 *
 * Added because the legal pages hardcoded "August 2026" while the sitemap
 * published CONTENT_DATES.legal — two sources of truth for one date, and they
 * disagreed. A page that derives its date cannot fall out of step with it.
 */
export function contentDateLabel(group: ContentGroup): string {
  const [y, m, d] = CONTENT_DATES[group].split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}
