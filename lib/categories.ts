// lib/categories.ts — shared category definitions for homepage + category landing pages.
//
// TIER decides prominence, and it encodes a positioning decision rather than a
// layout preference.
//
// A 2026-10-05 growth audit found the homepage reading as "a small general
// calculator directory" rather than a focused US personal-finance publisher,
// because mortgage tools sat beside TDEE, BMI, concrete and GPA. Google needs one
// reason to classify a site; a visitor needs one reason to trust it with a salary
// figure. So finance categories lead, and the rest are demoted into a section that
// says plainly what it is.
//
// What this deliberately does NOT do: re-slug the hubs. The audit recommends
// re-cutting them into five finance clusters, and then warns in the same document
// not to restructure "blindly -- first use Search Console and Analytics to identify
// whether they have meaningful US demand." That data is not available here (no GSC
// access), and re-slugging a site mid-AdSense-review trades real URL churn for an
// uncertain gain. Prominence is reversible in one commit; a URL change is not.
// When GSC data exists, that is the moment to re-cut the slugs, with redirects.
export type CategoryTier = "finance" | "other";

export type Category = {
  slug: string;
  name: string;
  h1: string;
  desc: string;
  tier: CategoryTier;
  match: string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "tax-retirement",
    name: "Tax & Retirement",
    h1: "Tax & Retirement Calculators",
    desc: "Salary after tax, tax brackets, 401k, RMD, Social Security, and investment growth — by state and filing status.",
    tier: "finance",
    match: ["salary", "paycheck", "tax", "capital-gains", "overtime", "social-security", "rmd", "401k", "retirement", "investment", "dividend", "savings-bond", "cd-", "compound-interest", "investment-property", "savings-goal", "savings-rate", "rule-of-72", "roi", "inflation"],
  },
  {
    slug: "money-loans",
    name: "Loans, Debt & Housing",
    h1: "Loan, Debt & Housing Calculators",
    desc: "Mortgage, auto loan, debt payoff, and credit calculators — accurate US formulas, no sign-up.",
    tier: "finance",
    match: ["mortgage", "auto-loan", "loan", "debt", "credit", "heloc", "refinance", "student-loan", "dti", "car-affordability", "lease-vs-buy", "simple-interest", "amortization", "mortgage-points", "escrow", "closing-costs", "home-equity", "pmi", "commission", "price-per-square-foot", "property-tax"],
  },
  {
    slug: "everyday-business",
    name: "Everyday & Business",
    h1: "Everyday & Business Calculators",
    desc: "Percentage, discount, sales tax, markup, margin, and budgeting tools for daily life and work.",
    tier: "other",
    match: ["percentage", "discount", "sales-tax", "tip", "budget", "net-worth", "emergency-fund", "due-date", "gpa", "grade", "markup", "margin", "tax-refund", "moving-cost", "life-insurance"],
  },
  {
    slug: "home-improvement",
    name: "Home & Improvement",
    h1: "Home & Improvement Calculators",
    desc: "Concrete, tile, paint, mulch, gravel, drywall, and remodel cost calculators for DIY and contractors.",
    tier: "other",
    match: ["concrete", "paint", "mulch", "square-footage", "tile", "fence", "gravel", "topsoil", "carpet", "wallpaper", "sod", "drywall", "construction-cost", "electricity", "gas-cost", "miles-per-gallon", "remodel"],
  },
  {
    slug: "health-fitness",
    name: "Health & Fitness",
    h1: "Health & Fitness Calculators",
    desc: "TDEE, BMI, body fat, water intake, sleep, and calorie deficit calculators — evidence-based formulas.",
    tier: "other",
    match: ["tdee", "bmi", "body-fat", "water-intake", "sleep", "calorie-deficit", "heart-rate"],
  },
];

/** Finance categories first, then the rest. Stable order for every consumer. */
export const FINANCE_CATEGORIES = CATEGORIES.filter((c) => c.tier === "finance");
export const OTHER_CATEGORIES = CATEGORIES.filter((c) => c.tier === "other");

/**
 * Which category a tool belongs to.
 *
 * First match wins, so ORDER IS SEMANTIC: the finance categories are declared before
 * the catch-all "Everyday & Business", which is why a slug containing "tax" lands in
 * Tax & Retirement rather than the everyday bucket. Reordering CATEGORIES changes
 * which tools appear on which hub.
 */
export function categorize(slug: string): Category {
  for (const c of CATEGORIES) {
    if (c.match.some((k) => slug.includes(k))) return c;
  }
  return CATEGORIES[CATEGORIES.length - 1];
}
