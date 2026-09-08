import type { MetadataRoute } from "next";
import { SITE_URL, TOOLS } from "@/lib/tools";
import { STATES, STATE_AWARE_TOOLS, getComparisonPairs } from "@/lib/states";
import { AMOUNT_TOOLS, allowedAmounts, AGE_TOOLS, allowedAges } from "@/lib/amounts";
import { METROS } from "@/lib/metros";

/** Dynamic sitemap — every tool + every state variant for state-aware tools. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/methodology`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/developers`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/llms.txt`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/widgets`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/premium`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/guides/how-much-house-can-i-afford`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/mortgage-calculator-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/salary-after-tax-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/debt-payoff-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/debt-snowball-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/401k-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/investing-basics-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/home-improvement-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/health-fitness-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/rmd-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/529-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/tax-refund-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/shopify-vs-etsy-vs-wix-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guides/best-budgeting-apps-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/blog/cms-warns-500-hospitals-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/cms-enforcement-tracker-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/no-more-grace-period-enforcement-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/from-warning-letter-to-fine-timeline`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/pinnacle-hospital-fined-twice`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/largest-cms-fine-northside`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/real-cost-of-noncompliance`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/28-hospitals-fined-what-they-got-wrong`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/fix-it-later-most-expensive-sentence`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/most-warning-letters-formatting-errors`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/warning-letter-vs-cap-vs-fine`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/escalation-rate-224-percent`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/what-is-machine-readable-file`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/allowed-amount-metrics-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/compliance-attestation-signer`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/shoppable-services-101`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/5-technical-errors-trigger-warning-letters`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/diy-vs-professional-mrf-audit`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/what-to-ask-before-hiring-mrf-auditor`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog/corrective-action-plan-45-days`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  { url: `${SITE_URL}/calculators/money-loans`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/calculators/tax-retirement`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/calculators/home-improvement`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/calculators/health-fitness`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/calculators/everyday-business`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  for (const t of TOOLS) {
    pages.push({
      url: `${SITE_URL}/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }
  // amount scenario pages: amount-enabled tools x their amounts (x 50 states)
  for (const slug of Object.keys(AMOUNT_TOOLS)) {
    const amounts = allowedAmounts(slug) || [];
    for (const amt of amounts) {
      pages.push({ url: `${SITE_URL}/${slug}/${amt}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
      if (STATE_AWARE_TOOLS.includes(slug)) {
        for (const s of STATES) {
          pages.push({ url: `${SITE_URL}/${slug}/${amt}/${s.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
        }
      }
    }
  }

  // age scenario pages: age-config tools x 9 ages
  for (const slug of Object.keys(AGE_TOOLS)) {
    for (const a of allowedAges(slug) || []) {
      pages.push({ url: `${SITE_URL}/${slug}/${a}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
    }
  }

  // metro variants: state-aware tools x top metros
  for (const slug of STATE_AWARE_TOOLS) {
    for (const m of METROS) {
      pages.push({ url: `${SITE_URL}/${slug}/${m.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.5 });
    }
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
