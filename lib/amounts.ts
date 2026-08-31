// lib/amounts.ts — scenario pages ("$75,000 salary after tax", "mortgage on $300k").
// Each amount × state variant computes REAL numbers via the existing engine.
export const SALARY_AMOUNTS = [
  30000, 40000, 50000, 60000, 70000, 75000, 80000, 90000, 100000, 120000, 150000, 200000, 250000, 300000, 500000,
];

// Mortgage/home-price amounts
export const PRICE_AMOUNTS = [100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 600000, 750000, 1000000];

// Tools that prefill a single numeric field from the amount slug.
// field = the registry field key that gets prefilled.
export const AMOUNT_TOOLS: Record<string, { field: string; kind: "salary" | "price" | "income" }> = {
  "salary-after-tax-calculator": { field: "salary", kind: "salary" },
  "paycheck-calculator": { field: "salary", kind: "salary" },
  "salary-percentile-calculator": { field: "salary", kind: "salary" },
  "salary-to-hourly-calculator": { field: "salary", kind: "salary" },
  "home-affordability-calculator": { field: "income", kind: "income" },
  "mortgage-calculator": { field: "price", kind: "price" },
};

export function allowedAmounts(slug: string): number[] | undefined {
  const kind = AMOUNT_TOOLS[slug]?.kind;
  if (kind === "price") return PRICE_AMOUNTS;
  if (kind === "salary" || kind === "income") return SALARY_AMOUNTS;
  return undefined;
}

// Age-based scenario pages ("401k at 30") — prefill the years field from a
// retirement-age assumption.
export const AGES = [25, 30, 35, 40, 45, 50, 55, 60, 65];

export const AGE_TOOLS: Record<string, { field: string; retirementAge: number }> = {
  "401k-calculator": { field: "years", retirementAge: 65 },
  "retirement-calculator": { field: "years", retirementAge: 65 },
};

export function allowedAges(slug: string): number[] | undefined {
  return AGE_TOOLS[slug] ? AGES : undefined;
}

export function ageFromSlug(slug: string): number | undefined {
  const n = parseInt(slug, 10);
  if (isNaN(n) || String(n) !== slug) return undefined;
  return n;
}

export function fmtAmount(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

export function amountFromSlug(slug: string): number | undefined {
  const m = slug.match(/^(\d+)(k)?$/);
  if (!m) return undefined;
  return parseInt(m[1], 10) * (m[2] ? 1000 : 1);
}
