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

/** Paycheck breakdown for one pay period. periods: 52 weekly / 26 biweekly / 24 semimonthly / 12 monthly. */
export function paycheckBreakdown(annual, state, filing, periods = 26) {
  const fed = federalTax(annual, filing);
  const f = fica(annual, filing);
  const st = stateTax(annual, state, filing);
  const totalAnnual = fed.tax + f.total + st.tax;
  return {
    gross: round2(annual / periods),
    federal: round2(fed.tax / periods),
    fica: round2(f.total / periods),
    state: round2(st.tax / periods),
    totalTax: round2(totalAnnual / periods),
    net: round2((annual - totalAnnual) / periods),
  };
}

/** Debt payoff plan. Returns months to payoff, total interest, and first N schedule rows. */
export function debtPayoff(balance, apr, monthlyPayment, extra = 0) {
  if (balance <= 0 || monthlyPayment <= 0) return { months: 0, totalInterest: 0, totalPaid: 0, schedule: [] };
  const r = apr / 100 / 12;
  let b = balance;
  let interestTotal = 0;
  let months = 0;
  const schedule = [];
  while (b > 0 && months < 600) {
    months++;
    const interest = b * r;
    let payment = monthlyPayment + extra;
    if (payment <= interest) payment = interest + 1; // avoid never-paying-off trap
    if (payment > b + interest) payment = b + interest;
    b = Math.max(0, b + interest - payment);
    interestTotal += interest;
    if (schedule.length < 12) schedule.push({ month: months, payment: round2(payment), interest: round2(interest), balance: round2(b) });
  }
  return { months, totalInterest: round2(interestTotal), totalPaid: round2(balance + interestTotal), schedule };
}

/** Debt-to-income ratios. housingPayment includes mortgage PITI. Returns ratios as decimals. */
export function dti(grossMonthly, housingPayment, otherDebts) {
  const front = grossMonthly > 0 ? housingPayment / grossMonthly : 0;
  const back = grossMonthly > 0 ? (housingPayment + otherDebts) / grossMonthly : 0;
  return { frontRatio: round2(front * 10000) / 100, backRatio: round2(back * 10000) / 100 };
}

/** PMI estimate. Annual PMI rate ~0.5% of loan. Cancels when LTV <= 78% of original value. */
export function pmiCalculator(price, downPct, rate, years) {
  const loan = Math.max(0, price - (price * downPct) / 100);
  const term = years * 12;
  const base = monthlyPayment(loan, rate, term);
  const down = price - loan;
  let pmiMonthly = 0;
  let monthsUntilCancel = null;
  let totalPMI = 0;
  if (downPct < 20 && loan > 0) {
    pmiMonthly = (loan * 0.005) / 12; // 0.5% annual PMI rate (typical range 0.3-1.0%)
    // when does balance drop to 78% of original price?
    const target = price * 0.78;
    const sched = amortizationSchedule(loan, rate, term);
    for (let i = 0; i < sched.length; i++) {
      if (sched[i].balance <= target) {
        monthsUntilCancel = sched[i].month;
        break;
      }
    }
    if (monthsUntilCancel == null) monthsUntilCancel = term;
    totalPMI = pmiMonthly * monthsUntilCancel;
  }
  return {
    downPayment: round2(down), loanAmount: round2(loan), basePayment: round2(base),
    pmiMonthly: round2(pmiMonthly), monthsUntilCancel: monthsUntilCancel,
    totalPMI: round2(totalPMI), hasPMI: downPct < 20,
  };
}

/** HELOC payment. interestOnly: draw-period style; else amortize over term. */
export function helocPayment(drawn, rate, termMonths = 120, interestOnly = true) {
  if (drawn <= 0) return { monthly: 0, totalInterest: 0 };
  if (interestOnly) {
    const monthly = (drawn * (rate / 100)) / 12;
    return { monthly: round2(monthly), totalInterest: round2(monthly * termMonths), mode: "interest-only" };
  }
  const monthly = monthlyPayment(drawn, rate, termMonths);
  const totalInterest = monthly * termMonths - drawn;
  return { monthly: round2(monthly), totalInterest: round2(totalInterest), mode: "amortized" };
}
