import type { MetadataRoute } from "next";
import { SITE_URL, TOOLS } from "@/lib/tools";
import { STATES, STATE_AWARE_TOOLS, getComparisonPairs } from "@/lib/states";
import { AMOUNT_TOOLS, allowedAmounts, AGE_TOOLS, allowedAges } from "@/lib/amounts";
import { METROS } from "@/lib/metros";
import { contentDate } from "@/lib/content-dates";

/**
 * Dynamic sitemap — every tool + every state variant for state-aware tools.
 *
 * `lastModified` comes from lib/content-dates.ts, NOT from `new Date()`. A build
 * timestamp here made all 1,938 entries share a single value that changed on every
 * deploy, which destroys the freshness signal the field exists to carry.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteDate = contentDate("site");
  const toolDate = contentDate("tools");
  const guideDate = contentDate("guides");
  const legalDate = contentDate("legal");
  const amountDate = contentDate("amounts");
  const metroDate = contentDate("metros");
  const stateDate = contentDate("states");

  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: siteDate, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: siteDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/methodology`, lastModified: siteDate, changeFrequency: "yearly", priority: 0.4 },
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

  // amount scenario pages: amount-enabled tools x their amounts.
  //
  // DELIBERATELY EXCLUDES the amount x state combinations. Measured 2026-09-18:
  // 2,907 combo URLs were 60% of this sitemap, yet are 96-98% textually identical
  // to their siblings (361-384 word pages with one number swapped), and receive
  // ZERO internal links from any tool root — sitemap-only orphans. They cannibalise
  // /{tool}/{amount} and /{tool}/{state}, both of which ARE internally linked and are
  // the intended canonical targets, and they spend the crawl budget Google grants a
  // young domain on pages that cannot rank. The URLs stay live and reachable for
  // users; ToolPageShell marks them noindex so they leave the index and stop
  // diluting the site's quality signal. Re-adding them requires per-page unique
  // content, not a sitemap entry.
  for (const slug of Object.keys(AMOUNT_TOOLS)) {
    for (const amt of allowedAmounts(slug) || []) {
      pages.push({ url: `${SITE_URL}/${slug}/${amt}`, lastModified: amountDate, changeFrequency: "monthly", priority: 0.6 });
    }
  }

  // age scenario pages: age-config tools x 9 ages
  for (const slug of Object.keys(AGE_TOOLS)) {
    for (const a of allowedAges(slug) || []) {
      pages.push({ url: `${SITE_URL}/${slug}/${a}`, lastModified: toolDate, changeFrequency: "monthly", priority: 0.6 });
    }
  }

  // metro variants: state-aware tools x top metros
  for (const slug of STATE_AWARE_TOOLS) {
    for (const m of METROS) {
      pages.push({ url: `${SITE_URL}/${slug}/${m.slug}`, lastModified: metroDate, changeFrequency: "monthly", priority: 0.5 });
    }
  }

  // state variants: state-aware tools x 50 states
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

  // state-vs-state comparisons: state-aware tools x 45 top-state pairs
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

  return pages;
}
