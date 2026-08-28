// lib/calc.js — shared calculator math (pure functions, unit-testable)

/** Monthly payment for an amortizing loan. rate_pct = annual % (e.g. 6.5), term_months = N. */
export function monthlyPayment(principal, ratePct, termMonths) {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (ratePct === 0) return principal / termMonths;
  const r = ratePct / 100 / 12;
  const p = Math.pow(1 + r, termMonths);
  return (principal * r * p) / (p - 1);
}

/** Full amortization schedule. Returns [{month, payment, interest, principal, balance}]. */
export function amortizationSchedule(principal, ratePct, termMonths) {
  const payment = monthlyPayment(principal, ratePct, termMonths);
  const r = ratePct / 100 / 12;
  let balance = principal;
  const rows = [];
  for (let m = 1; m <= termMonths; m++) {
    const interest = balance * r;
    const principalPart = payment - interest;
    balance = Math.max(0, balance - principalPart);
    rows.push({
      month: m,
      payment: round2(payment),
      interest: round2(interest),
      principal: round2(principalPart),
      balance: round2(balance),
    });
  }
  return rows;
}

/** US federal income tax (2025 brackets, standard deduction). filing: 'single' | 'married'. */
export function federalTax(annualIncome, filing = "single") {
  const stdDeduction = filing === "married" ? 30000 : 15000;
  const taxable = Math.max(0, annualIncome - stdDeduction);
  const brackets =
    filing === "married"
      ? [
          [0, 23850, 0.10],
          [23850, 96950, 0.12],
          [96950, 206700, 0.22],
          [206700, 394600, 0.24],
          [394600, 501050, 0.32],
          [501050, 751600, 0.35],
          [751600, Infinity, 0.37],
        ]
      : [
          [0, 11925, 0.10],
          [11925, 48475, 0.12],
          [48475, 103350, 0.22],
          [103350, 197300, 0.24],
          [197300, 250525, 0.32],
          [250525, 626350, 0.35],
          [626350, Infinity, 0.37],
        ];
  let tax = 0;
  let prev = 0;
  for (const [lo, hi, rate] of brackets) {
    const upper = Math.min(taxable, hi);
    if (taxable > lo) tax += Math.max(0, upper - lo) * rate;
    if (taxable <= hi) break;
    prev = hi;
  }
  void prev;
  return { gross: annualIncome, stdDeduction, taxable, tax: round2(tax) };
}

/** FICA: social security 6.2% up to wage cap, medicare 1.45% (+0.9% above 200K single / 250K married). */
export function fica(annualIncome, filing = "single") {
  const ssCap = 176100; // 2025
  const ss = Math.min(annualIncome, ssCap) * 0.062;
  let mc = annualIncome * 0.0145;
  const extraThreshold = filing === "married" ? 250000 : 200000;
  if (annualIncome > extraThreshold) mc += (annualIncome - extraThreshold) * 0.009;
  return { socialSecurity: round2(ss), medicare: round2(mc), total: round2(ss + mc) };
}

/** Simple state tax estimate: flat 5% for taxable states, 0 for no-income-tax states. Label as estimate. */
export const NO_INCOME_TAX_STATES = [
  "AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY",
];
export function stateTax(annualIncome, state, filing = "single") {
  const stdDeduction = filing === "married" ? 30000 : 15000;
  const taxable = Math.max(0, annualIncome - stdDeduction);
  if (NO_INCOME_TAX_STATES.includes(state.toUpperCase())) return { state, tax: 0, note: "No state income tax" };
  return { state, tax: round2(taxable * 0.05), note: "5% flat estimate — check your state" };
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}

export function money(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}
