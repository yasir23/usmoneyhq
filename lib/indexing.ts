/**
 * Which of the generated pages may be indexed.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 * AdSense rejected usmoneyhq.com on 2026-09-26 with "Low value content" and:
 *
 *   "a site must provide substantial unique value, establish a consistent
 *    presence on the web, and show a level of user interest that supports a
 *    commercial advertising partnership."
 *
 * That verdict is correct, and the cause is structural rather than editorial.
 * The sitemap carried 916 URLs, of which ~770 (84%) are permutations of seven
 * base calculators: one for each state, one for each dollar amount, and
 * state-vs-state comparisons.
 *
 * ── MEASURED 2026-09-26, from the live site ─────────────────────────────────
 * Fetched sibling pairs and compared visible text and numeric content:
 *
 *   /mortgage-calculator/100000 vs /150000
 *     99.6% identical text, IDENTICAL byte length (15,195 both)
 *     21 numbers each, 19 shared; only 2 differ per side
 *
 *   /salary-after-tax-calculator/50000 vs /60000
 *     96.8% identical, identical byte length (16,470 both)
 *     25 numbers each, 20 shared
 *
 *   /mortgage-calculator/california-vs-texas vs /florida-vs-new-york
 *     92.9% identical, identical byte length (17,351 both)
 *
 *   /mortgage-calculator/florida vs /ohio
 *     83.7% identical; 21 vs 22 numbers, 19 shared — the page differs from its
 *     sibling by roughly three figures in 4,200 characters of boilerplate
 *
 * A page whose entire differentiation from its sibling is one swapped word or
 * number is a doorway page. It does not "provide substantial unique value",
 * which is the exact standard AdSense applied.
 *
 * ── WHAT THIS FLAG DOES ────────────────────────────────────────────────────
 * When false:
 *   - sitemap.ts omits every variant (state, comparison, amount, age, metro)
 *   - ToolPageShell emits `noindex, follow` on those pages
 *
 * The URLs STAY LIVE and fully functional. They remain useful as deep links and
 * as pages a visitor can reach and use. They simply stop being offered to
 * search engines as if they were distinct content, which is the honest
 * description of what they are.
 *
 * ── HOW TO TURN THEM BACK ON ───────────────────────────────────────────────
 * Do not flip this to true to "get more pages indexed". Flip it only after the
 * variant templates carry genuinely per-page content — a state page should use
 * that state's actual tax tables and published rate schedules rather than an
 * estimate, at which point the pages stop being permutations of each other.
 * Re-measure first: scripts/measure_uniqueness.py and scripts/cmp_uniqueness.py
 * will report similarity and shared-number counts for whatever pairs you give
 * them. If a pair still shows ~99% similarity, it is still a doorway page.
 */
export const VARIANT_PAGES_INDEXED = false;
