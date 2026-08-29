// lib/categories.ts — shared category definitions for homepage + category landing pages.
export const CATEGORIES = [
  {
    slug: "money-loans",
    name: "Money & Loans",
    h1: "Money & Loan Calculators",
    desc: "Mortgage, auto loan, debt payoff, and credit calculators — accurate US formulas, no sign-up.",
    match: ["mortgage", "auto-loan", "loan", "debt", "credit", "heloc", "refinance", "student-loan", "dti", "car-affordability", "lease-vs-buy", "simple-interest", "amortization", "mortgage-points", "escrow", "closing-costs", "home-equity", "pmi", "commission", "price-per-square-foot", "property-tax"],
  },
  {
    slug: "tax-retirement",
    name: "Tax & Retirement",
    h1: "Tax & Retirement Calculators",
    desc: "Salary after tax, tax brackets, 401k, RMD, Social Security, and investment growth — by state and filing status.",
    match: ["salary", "paycheck", "tax", "capital-gains", "overtime", "social-security", "rmd", "401k", "retirement", "investment", "dividend", "savings-bond", "cd-", "compound-interest", "investment-property", "savings-goal", "savings-rate", "rule-of-72", "roi", "inflation"],
  },
  {
    slug: "home-improvement",
    name: "Home & Improvement",
    h1: "Home & Improvement Calculators",
    desc: "Concrete, tile, paint, mulch, gravel, drywall, and remodel cost calculators for DIY and contractors.",
    match: ["concrete", "paint", "mulch", "square-footage", "tile", "fence", "gravel", "topsoil", "carpet", "wallpaper", "sod", "drywall", "construction-cost", "electricity", "gas-cost", "miles-per-gallon", "remodel"],
  },
  {
    slug: "health-fitness",
    name: "Health & Fitness",
    h1: "Health & Fitness Calculators",
    desc: "TDEE, BMI, body fat, water intake, sleep, and calorie deficit calculators — evidence-based formulas.",
    match: ["tdee", "bmi", "body-fat", "water-intake", "sleep", "calorie-deficit", "heart-rate"],
  },
  {
    slug: "everyday-business",
    name: "Everyday & Business",
    h1: "Everyday & Business Calculators",
    desc: "Percentage, discount, sales tax, markup, margin, ROI, and budgeting tools for daily life and work.",
    match: ["percentage", "discount", "sales-tax", "tip", "budget", "net-worth", "emergency-fund", "due-date", "gpa", "grade", "markup", "margin", "tax-refund", "moving-cost", "life-insurance"],
  },
];

export function categorize(slug) {
  for (const c of CATEGORIES) {
    if (c.match.some((k) => slug.includes(k))) return c;
  }
  return CATEGORIES[CATEGORIES.length - 1];
}
