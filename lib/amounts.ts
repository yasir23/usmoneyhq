// lib/amounts.ts — salary-amount scenario pages ("$75,000 salary after tax").
// Each amount × state variant computes REAL numbers via the existing engine,
// so pages are genuinely differentiated (never thin).
export const SALARY_AMOUNTS = [
  30000, 40000, 50000, 60000, 70000, 75000, 80000, 90000, 100000, 120000, 150000, 200000, 250000, 300000, 500000,
];

export const SALARY_TOOL_SLUGS = [
  "salary-after-tax-calculator",
  "paycheck-calculator",
  "salary-percentile-calculator",
  "salary-to-hourly-calculator",
];

export function fmtAmount(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

export function amountFromSlug(slug: string): number | undefined {
  const m = slug.match(/^(\d+)(k)?$/);
  if (!m) return undefined;
  const n = parseInt(m[1], 10) * (m[2] ? 1000 : 1);
  return n;
}
