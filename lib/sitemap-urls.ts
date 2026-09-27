import { SITE_URL, TOOLS } from "./tools";
import { STATES, STATE_AWARE_TOOLS, getComparisonPairs } from "./states";
import { AMOUNT_TOOLS, allowedAmounts, AGE_TOOLS, allowedAges } from "./amounts";
import { METROS, METRO_VARIANTS_INDEXED } from "./metros";
import { VARIANT_PAGES_INDEXED } from "./indexing";
import { contentDate } from "./content-dates";

/**
 * The ONE place the published page list is built.
 *
 * Extracted from `app/sitemap.ts` on 2026-09-27. It used to live only there,
 * which meant any other page wanting to state "the site has N pages" had to
 * either import a route file (fragile) or — as /premium did — remember a number
 * by hand. That is how `/premium` came to advertise "Ad-free across all 733
 * pages" long after the inventory had been pruned to 140. A remembered count is
 * a claim that cannot fail loudly; a derived one cannot drift.
 *
 * `pages/premium.js` and `public/llms.txt`'s stated composition both now trace
 * back here. If you prune or add a route, the number changes with it.
 *
 * `lastModified` comes from lib/content-dates.ts, NOT from `new Date()`. A build
 * timestamp made every entry share a single value that changed on every deploy,
 * which destroys the freshness signal the field exists to carry.
 */
export function buildSitemap() {
  const siteDate = contentDate("site");
  const toolDate = contentDate("tools");
  const guideDate = contentDate("guides");
  const legalDate = contentDate("legal");
  const amountDate = contentDate("amounts");
  const metroDate = contentDate("metros");
  const stateDate = contentDate("states");

  const pages: { url: string; lastModified?: string | Date; changeFrequency?: string; priority?: number }[] = [
    { url: SITE_URL, lastModified: siteDate, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: siteDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/methodology`, lastModified: siteDate, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/states`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/developers`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/llms.txt`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: siteDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/widgets`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/premium`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/guides`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/guides/how-much-house-can-i-afford`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/mortgage-calculator-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/salary-after-tax-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/debt-payoff-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/debt-snowball-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/401k-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/investing-basics-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/home-improvement-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/health-fitness-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/rmd-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/529-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/tax-refund-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/shopify-vs-etsy-vs-wix-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/best-budgeting-apps-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/how-to-start-investing-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/best-cd-rates-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/best-high-yield-savings-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/debt-consolidation-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: guideDate, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/blog/cms-warns-500-hospitals-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/cms-enforcement-tracker-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/no-more-grace-period-enforcement-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/from-warning-letter-to-fine-timeline`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/pinnacle-hospital-fined-twice`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/largest-cms-fine-northside`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/real-cost-of-noncompliance`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/28-hospitals-fined-what-they-got-wrong`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/fix-it-later-most-expensive-sentence`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/most-warning-letters-formatting-errors`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/warning-letter-vs-cap-vs-fine`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/escalation-rate-224-percent`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/what-is-machine-readable-file`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/allowed-amount-metrics-2026`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/compliance-attestation-signer`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/shoppable-services-101`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/5-technical-errors-trigger-warning-letters`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/diy-vs-professional-mrf-audit`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/what-to-ask-before-hiring-mrf-auditor`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/corrective-action-plan-45-days`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/calculators/money-loans`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/calculators/tax-retirement`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/calculators/home-improvement`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/calculators/health-fitness`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/calculators/everyday-business`, lastModified: siteDate, changeFrequency: "monthly", priority: 0.5 },
  ];

  for (const t of TOOLS) {
    pages.push({
      url: `${SITE_URL}/${t.slug}`,
      lastModified: toolDate,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }

  // amount scenario pages: amount-config tools x allowed amounts
  //
  // EXCLUDED while VARIANT_PAGES_INDEXED is false — measured 2026-09-26.
  // /mortgage-calculator/100000 and /150000 are 99.6% identical text and
  // IDENTICAL in byte length; 19 of their 21 numbers are shared. These are the
  // pages AdSense called "low value content". See lib/indexing.ts.
  if (VARIANT_PAGES_INDEXED) {
    for (const slug of Object.keys(AMOUNT_TOOLS)) {
      for (const amt of allowedAmounts(slug) || []) {
        pages.push({ url: `${SITE_URL}/${slug}/${amt}`, lastModified: amountDate, changeFrequency: "monthly", priority: 0.6 });
      }
    }
  }

  // age scenario pages: age-config tools x 9 ages. Same class as the amount
  // pages above and excluded on the same reasoning.
  if (VARIANT_PAGES_INDEXED) {
    for (const slug of Object.keys(AGE_TOOLS)) {
      for (const a of allowedAges(slug) || []) {
        pages.push({ url: `${SITE_URL}/${slug}/${a}`, lastModified: toolDate, changeFrequency: "monthly", priority: 0.6 });
      }
    }
  }

  // metro variants: state-aware tools x top metros.
  //
  // EXCLUDED while METRO_VARIANTS_INDEXED is false — measured 2026-09-22. Two
  // cities in the same state share 34 numeric tokens and have ZERO unique ones
  // between them; the only differing text is the city name (99.2% identical
  // overall). These 1,085 URLs are 56% of this sitemap and hold no information
  // their state page does not.
  if (METRO_VARIANTS_INDEXED) {
    for (const slug of STATE_AWARE_TOOLS) {
      for (const m of METROS) {
        pages.push({ url: `${SITE_URL}/${slug}/${m.slug}`, lastModified: metroDate, changeFrequency: "monthly", priority: 0.5 });
      }
    }
  }

  // state variants: state-aware tools x 50 states
  //
  // EXCLUDED while VARIANT_PAGES_INDEXED is false — measured 2026-09-26. This
  // is the largest cohort: 7 tools x 50 states = 350 URLs. /mortgage-calculator/
  // florida vs /ohio are 83.7% identical text with 19 of 21 numbers shared.
  if (VARIANT_PAGES_INDEXED) {
    for (const slug of STATE_AWARE_TOOLS) {
      for (const s of STATES) {
        pages.push({
          url: `${SITE_URL}/${slug}/${s.slug}`,
          lastModified: stateDate,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  // state-vs-state comparisons: state-aware tools x 45 top-state pairs
  //
  // EXCLUDED while VARIANT_PAGES_INDEXED is false — measured 2026-09-26.
  // ca-vs-tx and fl-vs-ny are 92.9% identical and identical in byte length.
  if (VARIANT_PAGES_INDEXED) {
    const pairs = getComparisonPairs();
    for (const slug of STATE_AWARE_TOOLS) {
      for (const [a, b] of pairs) {
        pages.push({
          url: `${SITE_URL}/${slug}/${a.slug}-vs-${b.slug}`,
          lastModified: stateDate,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  // Hospital MRF-compliance posts are EXCLUDED from this sitemap.
  //
  // Verified 2026-09-22: all 20 articles also exist on sealofaudit.com
  // (/blog/<same-slug> returns 200 on both domains), and both copies
  // self-canonicalise to their own domain. That is the worst duplicate shape —
  // two owned domains each claiming to be the original. They belong on
  // SealOfAudit, which is the business that sells this service. Filtering here
  // removes them from discovery without deleting anything.
  return pages.filter((p) => !/\/blog(\/|$)/.test(p.url));
}

/**
 * How many pages this site publishes.
 *
 * Derived, never remembered. `/premium` states this number to prospective
 * subscribers, so it must equal what the sitemap actually serves.
 */
export function publishedPageCount(): number {
  return buildSitemap().length;
}
