// lib/tools.ts — the scalable programmatic-SEO core.
// One registry drives: pages, metadata, JSON-LD schema, sitemap, API, forms, FAQ, related links.
// Adding tool #9 = adding one entry here (+ optional explicit page). Everything else is automatic.

import {
  money,
  federalTax,
  fica,
  stateTax,
  paycheckBreakdown,
  debtPayoff,
  dti,
  pmiCalculator,
  helocPayment,
  refinanceAnalysis,
  retirementProjection,
  creditCardMinPayment,
  childSupportEstimate,
  concreteNeeds,
  tdee,
  waterIntake,
  sleepCycles,
  bodyFat,
  paintNeeds,
  mulchNeeds,
  salaryPercentile,
  homeAffordability,
  GRADE_POINTS,
  gpaCalculate,
  dueDate,
  examScoreNeeded,
  percentageCalc,
  compoundInterest,
  cdMaturity,
  overtimePay,
  tipCalc,
  amortizedPayment,
  savingsGoal,
  netWorth,
  hourlyToSalary,
  gasCost,
  squareFootage,
  electricityCost,
  bmiCalc,
  simpleInterest,
  budgetSplit,
  discountPrice,
  salesTaxAmount,
  inflationValue,
  mpgCalc,
  rentVsBuy,
  retirement401k,
  emergencyFund,
  closingCosts,
  carAffordability,
  dividendIncome,
  NO_INCOME_TAX_STATES,
  US_STATES,
} from "./calc.ts";
import { STATES } from "./states.ts";

export const SITE_URL = "https://usmoneyhq.com";
export const SITE_NAME = "US Money HQ";
export const SITE_DESC = "Free, fast US financial calculators, money tools, and cost-of-living data. Mortgage, auto loan, salary, tax, TDEE and more. No sign-up.";

export type ResultRow = { label: string; value: string; highlight?: boolean };

export type ToolField =
  | {
      key: string;
      label: string;
      type: "number";
      default: number;
      min?: number;
      max?: number;
      step?: number;
      prefix?: string;
      inputMode?: "decimal" | "numeric";
    }
  | {
      key: string;
      label: string;
      type: "select";
      default: string | number;
      options: { value: string | number; label: string }[];
    };

export type ToolDef = {
  slug: string;
  title: string; // <title>
  shortTitle: string; // card + breadcrumb
  description: string; // meta description + schema
  h1: string;
  sub: string;
  fields: ToolField[];
  compute: (v: Record<string, number | string>) => ResultRow[];
  note?: string;
  faq: { q: string; a: string }[];
  related: string[];
};

const moneyRow = (label: string, n: number, highlight = false): ResultRow => ({
  label,
  value: money(n),
  highlight,
});

export const TOOLS: ToolDef[] = [
  {
    slug: "mortgage-calculator",
    title: "Mortgage Calculator 2026 — Monthly Payment & Amortization | US Money HQ",
    shortTitle: "Mortgage Calculator",
    description:
      "Free US mortgage calculator: estimate your monthly payment, total interest, and full amortization schedule. Updated for 2026 rates.",
    h1: "Mortgage Calculator",
    sub: "Estimate your monthly payment, total interest, and amortization schedule for a US home loan.",
    fields: [
      { key: "amount", label: "Home price (USD)", type: "number", default: 400000, min: 10000, step: 1000, inputMode: "numeric" },
      { key: "down", label: "Down payment (%)", type: "number", default: 20, min: 0, max: 100, step: 0.5, inputMode: "decimal" },
      { key: "rate", label: "Interest rate (annual %)", type: "number", default: 6.5, min: 0, step: 0.01, inputMode: "decimal" },
      {
        key: "years",
        label: "Loan term (years)",
        type: "select",
        default: 30,
        options: [
          { value: 15, label: "15 years" },
          { value: 20, label: "20 years" },
          { value: 30, label: "30 years" },
        ],
      },
    ],
    compute: (v) => {
      const amount = Number(v.amount) || 0;
      const downPct = Number(v.down) || 0;
      const rate = Number(v.rate) || 0;
      const years = Number(v.years) || 30;
      const principal = Math.max(0, amount - (amount * downPct) / 100);
      const payment = principal * (rate / 100 / 12) > 0 || rate === 0 ? monthlyPaymentSafe(principal, rate, years * 12) : 0;
      const rows = [moneyRow("Loan amount", principal), moneyRow("Monthly payment", payment, true)];
      if (principal > 0 && years > 0) {
        const sched = amortSafe(principal, rate, years * 12);
        const totalInterest = sched.reduce((a, r) => a + r.interest, 0);
        rows.push(moneyRow("Total interest", totalInterest));
        rows.push(moneyRow("Total paid", principal + totalInterest));
      }
      return rows;
    },
    note: "Estimate only. Does not include property taxes, insurance, or PMI.",
    faq: [
      { q: "What is a good mortgage rate in 2026?", a: "Rates vary with the economy and your credit profile. Compare offers from at least three lenders and consider whether a 15-year or 30-year term fits your budget." },
      { q: "Does this include property tax and insurance?", a: "No. Your full monthly payment (PITI) also includes property taxes, homeowners insurance, and possibly PMI if your down payment is under 20%." },
      { q: "How does the amortization schedule work?", a: "Early payments go mostly to interest; later payments go mostly to principal. The schedule shows exactly how much of each payment reduces your balance." },
    ],
    related: ["pmi-calculator", "heloc-calculator", "dti-calculator", "refinance-calculator"],
  },
  {
    slug: "auto-loan-calculator",
    title: "Auto Loan Calculator 2026 — Car Payment Estimator | US Money HQ",
    shortTitle: "Auto Loan Calculator",
    description: "Free US auto loan calculator: estimate your monthly car payment, total interest, and total cost. Updated for 2026.",
    h1: "Auto Loan Calculator",
    sub: "Estimate your monthly car payment and total loan cost for a US auto purchase.",
    fields: [
      { key: "price", label: "Vehicle price (USD)", type: "number", default: 35000, min: 1000, step: 500, inputMode: "numeric" },
      { key: "down", label: "Down payment (USD)", type: "number", default: 5000, min: 0, step: 500, inputMode: "numeric" },
      { key: "tradeIn", label: "Trade-in value (USD)", type: "number", default: 0, min: 0, step: 500, inputMode: "numeric" },
      { key: "rate", label: "Interest rate (annual %)", type: "number", default: 7.2, min: 0, step: 0.01, inputMode: "decimal" },
      {
        key: "term",
        label: "Loan term (months)",
        type: "select",
        default: 60,
        options: [
          { value: 36, label: "36 months" },
          { value: 48, label: "48 months" },
          { value: 60, label: "60 months" },
          { value: 72, label: "72 months" },
          { value: 84, label: "84 months" },
        ],
      },
    ],
    compute: (v) => {
      const price = Number(v.price) || 0;
      const down = Number(v.down) || 0;
      const tradeIn = Number(v.tradeIn) || 0;
      const rate = Number(v.rate) || 0;
      const term = Number(v.term) || 60;
      const principal = Math.max(0, price - down - tradeIn);
      const payment = monthlyPaymentSafe(principal, rate, term);
      const totalPaid = payment * term;
      return [
        moneyRow("Loan amount", principal),
        moneyRow("Monthly payment", payment, true),
        moneyRow("Total interest", Math.max(0, totalPaid - principal)),
        moneyRow("Total cost", totalPaid + down + tradeIn),
      ];
    },
    note: "Estimate only. Fees, taxes, and dealer add-ons not included.",
    faq: [
      { q: "Should I choose a 60-month or 72-month car loan?", a: "Shorter terms (48-60 months) typically have lower rates and cost less overall. 72-84 month terms lower the monthly payment but increase total interest and the risk of being upside-down." },
      { q: "What is a good auto loan rate in 2026?", a: "Rates depend on your credit score, the lender, and whether the loan is new or used. Pre-qualify with multiple lenders before visiting the dealership." },
    ],
    related: ["mortgage-calculator", "debt-payoff-calculator", "dti-calculator"],
  },
  {
    slug: "salary-after-tax-calculator",
    title: "Salary After Tax Calculator 2026 — Take-Home Pay by State | US Money HQ",
    shortTitle: "Salary After Tax Calculator",
    description: "Free US salary calculator: estimate federal, FICA, and state taxes and your monthly take-home pay. 2026 tax year, all 50 states.",
    h1: "Salary After Tax Calculator",
    sub: "Estimate your federal, FICA, and state taxes and monthly take-home pay.",
    fields: [
      { key: "salary", label: "Annual salary (USD)", type: "number", default: 75000, min: 0, step: 1000, inputMode: "numeric" },
      {
        key: "state",
        label: "State",
        type: "select",
        default: "TX",
        options: US_STATES.map((s) => ({ value: s, label: s })),
      },
      {
        key: "filing",
        label: "Filing status",
        type: "select",
        default: "single",
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married filing jointly" },
        ],
      },
    ],
    compute: (v) => {
      const salary = Number(v.salary) || 0;
      const state = String(v.state);
      const filing = v.filing === "married" ? "married" : "single";
      const fed = federalTax(salary, filing);
      const f = fica(salary, filing);
      const st = stateTax(salary, state, filing);
      const totalTax = fed.tax + f.total + st.tax;
      const takeHome = salary - totalTax;
      return [
        moneyRow("Take-home (annual)", takeHome, true),
        moneyRow("Per month", takeHome / 12),
        moneyRow("Per bi-weekly paycheck", takeHome / 26),
        moneyRow("Federal income tax", fed.tax),
        moneyRow("Social Security + Medicare", f.total),
        { label: `State tax (${state})`, value: money(st.tax) },
      ];
    },
    note: "Estimate only — does not include 401(k), insurance, or credits.",
    faq: [
      { q: "Which states have no income tax?", a: `Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming do not impose a state income tax: ${NO_INCOME_TAX_STATES.join(", ")}.` },
      { q: "Why does my actual paycheck differ?", a: "Employers also deduct 401(k) contributions, health insurance premiums, and other benefits. This calculator shows a clean estimate before those deductions." },
      { q: "What tax brackets are used?", a: "The calculator uses 2025 federal brackets with standard deductions ($15,000 single / $30,000 married filing jointly) and a 5% flat state estimate." },
    ],
    related: ["paycheck-calculator", "mortgage-calculator", "dti-calculator"],
  },
  {
    slug: "paycheck-calculator",
    title: "Paycheck Calculator 2026 — Take-Home Pay per Paycheck | US Money HQ",
    shortTitle: "Paycheck Calculator",
    description: "Free US paycheck calculator: estimate your federal, FICA, and state deductions and net pay per paycheck. Weekly, biweekly, semimonthly, monthly.",
    h1: "Paycheck Calculator",
    sub: "Estimate your take-home pay per paycheck after federal, FICA, and state taxes.",
    fields: [
      { key: "salary", label: "Annual salary (USD)", type: "number", default: 75000, min: 0, step: 1000, inputMode: "numeric" },
      {
        key: "state",
        label: "State",
        type: "select",
        default: "TX",
        options: US_STATES.map((s) => ({ value: s, label: s })),
      },
      {
        key: "filing",
        label: "Filing status",
        type: "select",
        default: "single",
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married filing jointly" },
        ],
      },
      {
        key: "periods",
        label: "Pay frequency",
        type: "select",
        default: 26,
        options: [
          { value: 52, label: "Weekly (52/year)" },
          { value: 26, label: "Biweekly (26/year)" },
          { value: 24, label: "Semimonthly (24/year)" },
          { value: 12, label: "Monthly (12/year)" },
        ],
      },
    ],
    compute: (v) => {
      const salary = Number(v.salary) || 0;
      const state = String(v.state);
      const filing = v.filing === "married" ? "married" : "single";
      const periods = Number(v.periods) || 26;
      const r = paycheckBreakdown(salary, state, filing, periods);
      return [
        moneyRow("Net pay", r.net, true),
        moneyRow("Gross pay", r.gross),
        moneyRow("Federal income tax", r.federal),
        moneyRow("Social Security + Medicare", r.fica),
        { label: `State tax (${state})`, value: money(r.state) },
      ];
    },
    note: "Estimate only. 401(k), insurance, and credits not included.",
    faq: [
      { q: "Why is my paycheck different from this estimate?", a: "Employers deduct pre-tax benefits like 401(k), health insurance, and HSA/FSA contributions. Your W-4 withholding choices also affect each check." },
    ],
    related: ["salary-after-tax-calculator", "debt-payoff-calculator", "dti-calculator"],
  },
  {
    slug: "debt-payoff-calculator",
    title: "Debt Payoff Calculator 2026 — How Long to Pay Off Debt | US Money HQ",
    shortTitle: "Debt Payoff Calculator",
    description: "Free US debt payoff calculator: see how long it takes to pay off credit card debt, total interest, and how extra payments speed things up.",
    h1: "Debt Payoff Calculator",
    sub: "See how long it takes to clear your debt and how much extra payments save you.",
    fields: [
      { key: "balance", label: "Current balance (USD)", type: "number", default: 10000, min: 0, step: 100, inputMode: "numeric" },
      { key: "apr", label: "APR (%)", type: "number", default: 18, min: 0, step: 0.01, inputMode: "decimal" },
      { key: "payment", label: "Monthly payment (USD)", type: "number", default: 400, min: 1, step: 10, inputMode: "numeric" },
      { key: "extra", label: "Extra payment per month (USD)", type: "number", default: 0, min: 0, step: 10, inputMode: "numeric" },
    ],
    compute: (v) => {
      const balance = Number(v.balance) || 0;
      const apr = Number(v.apr) || 0;
      const payment = Number(v.payment) || 0;
      const extra = Number(v.extra) || 0;
      const r = debtPayoff(balance, apr, payment, extra);
      const base = debtPayoff(balance, apr, payment, 0);
      const fmt = (m: number) => `${m} months (${Math.floor(m / 12)}y ${m % 12}m)`;
      return [
        { label: "Time to payoff", value: fmt(r.months), highlight: true },
        moneyRow("Total interest", r.totalInterest),
        moneyRow("Total paid", r.totalPaid),
        moneyRow("Interest saved with extra", Math.max(0, base.totalInterest - r.totalInterest)),
        { label: "Months saved", value: String(Math.max(0, base.months - r.months)) },
      ];
    },
    note: "Assumes consistent payments and a fixed APR.",
    faq: [
      { q: "Should I pay off debt or invest?", a: "As a rule of thumb, pay off debt above ~7-8% APR before investing, since guaranteed debt interest savings usually beat expected market returns after taxes." },
      { q: "How does extra payment help?", a: "Every extra dollar goes straight to principal, skipping interest. Even $50/month can shave years off a high-APR balance." },
    ],
    related: ["mortgage-calculator", "auto-loan-calculator", "dti-calculator"],
  },
  {
    slug: "dti-calculator",
    title: "Debt-to-Income Ratio Calculator 2026 | US Money HQ",
    shortTitle: "DTI Ratio Calculator",
    description: "Free US debt-to-income (DTI) calculator: see your front-end and back-end ratios and whether you qualify for a mortgage. 28/36 rule explained.",
    h1: "Debt-to-Income Ratio Calculator",
    sub: "Check your front-end and back-end DTI — the two numbers lenders use to approve mortgages.",
    fields: [
      { key: "income", label: "Monthly gross income (USD)", type: "number", default: 8000, min: 0, step: 100, inputMode: "numeric" },
      { key: "housing", label: "Monthly housing payment (USD)", type: "number", default: 1800, min: 0, step: 50, inputMode: "numeric" },
      { key: "other", label: "Other monthly debt (USD)", type: "number", default: 700, min: 0, step: 50, inputMode: "numeric" },
    ],
    compute: (v) => {
      const income = Number(v.income) || 0;
      const housing = Number(v.housing) || 0;
      const other = Number(v.other) || 0;
      const r = dti(income, housing, other);
      const verdict = r.backRatio <= 43 ? "Likely ✓" : r.backRatio <= 50 ? "Borderline" : "Unlikely ✗";
      return [
        { label: "Back-end DTI", value: `${r.backRatio}%`, highlight: true },
        { label: "Front-end DTI", value: `${r.frontRatio}%` },
        { label: "Mortgage qualification", value: verdict },
      ];
    },
    note: "Lenders prefer back-end DTI at or below 43% (28/36 guideline).",
    faq: [
      { q: "What is a good DTI ratio?", a: "Conventional loans generally want a back-end DTI under 43%; FHA loans allow up to 50% in some cases. Lower DTI also means better interest rates." },
      { q: "How can I lower my DTI?", a: "Pay down credit card balances, extend loan terms to lower monthly payments, or increase income. Even a small balance payoff can push you under the threshold." },
    ],
    related: ["mortgage-calculator", "heloc-calculator", "debt-payoff-calculator"],
  },
  {
    slug: "pmi-calculator",
    title: "PMI Calculator 2026 — Private Mortgage Insurance Cost | US Money HQ",
    shortTitle: "PMI Calculator",
    description: "Free US PMI calculator: estimate your private mortgage insurance cost, when it cancels, and total PMI paid on a home loan.",
    h1: "PMI Calculator",
    sub: "Estimate private mortgage insurance — what you pay with a down payment under 20%.",
    fields: [
      { key: "price", label: "Home price (USD)", type: "number", default: 400000, min: 10000, step: 1000, inputMode: "numeric" },
      { key: "down", label: "Down payment (%)", type: "number", default: 10, min: 0, max: 100, step: 0.5, inputMode: "decimal" },
      { key: "rate", label: "Interest rate (annual %)", type: "number", default: 6.5, min: 0, step: 0.01, inputMode: "decimal" },
      {
        key: "years",
        label: "Loan term (years)",
        type: "select",
        default: 30,
        options: [
          { value: 15, label: "15 years" },
          { value: 20, label: "20 years" },
          { value: 30, label: "30 years" },
        ],
      },
    ],
    compute: (v) => {
      const price = Number(v.price) || 0;
      const down = Number(v.down) || 0;
      const rate = Number(v.rate) || 0;
      const years = Number(v.years) || 30;
      const r = pmiCalculator(price, down, rate, years);
      const rows: ResultRow[] = [
        moneyRow("Loan amount", r.loanAmount),
        { label: "Monthly PMI", value: r.hasPMI ? money(r.pmiMonthly) : "$0 — no PMI", highlight: true },
        moneyRow("Base payment (P&I)", r.basePayment),
      ];
      if (r.hasPMI && r.monthsUntilCancel != null) {
        rows.push({ label: "PMI cancels at month", value: String(r.monthsUntilCancel) });
        rows.push(moneyRow("Total PMI paid", r.totalPMI));
      }
      return rows;
    },
    note: "Uses a 0.5% annual PMI rate (typical range 0.3-1.0%).",
    faq: [
      { q: "Is PMI worth avoiding?", a: "With 20% down you skip PMI entirely, but you also delay buying. Compare the PMI cost against rent and expected home appreciation — sometimes paying PMI for a few years is the better financial move." },
      { q: "Can I remove PMI early?", a: "Yes — on a conventional loan, request cancellation once you reach 80% LTV based on current home value (appraisal may be required)." },
    ],
    related: ["mortgage-calculator", "heloc-calculator", "dti-calculator"],
  },
  {
    slug: "heloc-calculator",
    title: "HELOC Calculator 2026 — Home Equity Line of Credit Payments | US Money HQ",
    shortTitle: "HELOC Calculator",
    description: "Free US HELOC calculator: estimate your monthly home equity line of credit payment, interest-only vs amortized, and available equity.",
    h1: "HELOC Calculator",
    sub: "Estimate your home equity line of credit payment and how much equity you can tap.",
    fields: [
      { key: "homeValue", label: "Home value (USD)", type: "number", default: 500000, min: 10000, step: 1000, inputMode: "numeric" },
      { key: "mortgage", label: "Outstanding mortgage (USD)", type: "number", default: 250000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "drawn", label: "Amount drawn (USD)", type: "number", default: 50000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "rate", label: "HELOC rate (annual %)", type: "number", default: 7.5, min: 0, step: 0.01, inputMode: "decimal" },
      {
        key: "mode",
        label: "Payment mode",
        type: "select",
        default: "io",
        options: [
          { value: "io", label: "Interest-only (draw period)" },
          { value: "am", label: "Amortized (10-year repayment)" },
        ],
      },
    ],
    compute: (v) => {
      const homeValue = Number(v.homeValue) || 0;
      const mortgage = Number(v.mortgage) || 0;
      const drawn = Number(v.drawn) || 0;
      const rate = Number(v.rate) || 0;
      const interestOnly = v.mode !== "am";
      const equity = Math.max(0, homeValue - mortgage);
      const r = helocPayment(drawn, rate, 120, interestOnly);
      return [
        moneyRow("Home equity", equity),
        moneyRow("Approx. available (85%)", Math.max(0, equity * 0.85)),
        moneyRow("Monthly payment", r.monthly, true),
        { label: "Mode", value: r.mode === "interest-only" ? "Interest-only" : "Amortized" },
      ];
    },
    note: "Estimate only. Rates are variable; actual limits depend on lender CLTV policy.",
    faq: [
      { q: "Interest-only vs amortized HELOC payments", a: "Most HELOCs let you pay interest only during the draw period (typically 10 years), then payments rise in the repayment phase. Amortizing from the start avoids a payment shock later." },
      { q: "How much can I borrow?", a: "Lenders typically cap combined loan-to-value at 80-90%. This calculator uses 85% as a common default — your lender may differ." },
    ],
    related: ["mortgage-calculator", "pmi-calculator", "dti-calculator"],
  },
  {
    slug: "refinance-calculator",
    title: "Refinance Calculator 2026 — Should You Refinance? | US Money HQ",
    shortTitle: "Refinance Calculator",
    description: "Free US refinance calculator: compare your current vs new mortgage payment, monthly savings, break-even point, and total interest saved.",
    h1: "Refinance Calculator",
    sub: "See if refinancing your mortgage is worth it — payment savings, break-even, and interest saved.",
    fields: [
      { key: "balance", label: "Current loan balance (USD)", type: "number", default: 300000, min: 10000, step: 1000, inputMode: "numeric" },
      { key: "currentRate", label: "Current rate (annual %)", type: "number", default: 7.0, min: 0, step: 0.01, inputMode: "decimal" },
      { key: "newRate", label: "New rate (annual %)", type: "number", default: 5.5, min: 0, step: 0.01, inputMode: "decimal" },
      {
        key: "remainingYears",
        label: "Years remaining on loan",
        type: "select",
        default: 25,
        options: [
          { value: 10, label: "10 years" },
          { value: 15, label: "15 years" },
          { value: 20, label: "20 years" },
          { value: 25, label: "25 years" },
          { value: 30, label: "30 years" },
        ],
      },
      { key: "closingCosts", label: "Closing costs (USD)", type: "number", default: 6000, min: 0, step: 500, inputMode: "numeric" },
    ],
    compute: (v) => {
      const balance = Number(v.balance) || 0;
      const cur = Number(v.currentRate) || 0;
      const next = Number(v.newRate) || 0;
      const years = Number(v.remainingYears) || 25;
      const costs = Number(v.closingCosts) || 0;
      const r = refinanceAnalysis(balance, cur, next, years * 12, costs);
      return [
        moneyRow("Current payment", r.currentPayment),
        moneyRow("New payment", r.newPayment, true),
        moneyRow("Monthly savings", r.monthlySavings),
        { label: "Break-even", value: r.breakEvenMonths === Infinity ? "Never" : `${r.breakEvenMonths} months` },
        moneyRow("Total interest saved", r.interestSaved),
      ];
    },
    note: "Estimate only. Assumes same remaining term and ignores taxes/insurance.",
    faq: [
      { q: "When does refinancing make sense?", a: "Typically when you can lower your rate enough to recover closing costs within the time you plan to keep the home — usually a 0.5-1% rate drop or better." },
      { q: "What are typical closing costs?", a: "Lender fees, appraisal, title, and recording fees usually total 2-6% of the loan amount. Include them in your break-even math." },
    ],
    related: ["mortgage-calculator", "pmi-calculator", "heloc-calculator"],
  },
  {
    slug: "retirement-calculator",
    title: "Retirement Calculator 2026 — Project Your Nest Egg | US Money HQ",
    shortTitle: "Retirement Calculator",
    description: "Free US retirement calculator: project your 401(k)/IRA balance at retirement and the monthly income it can produce. Uses the 4% rule.",
    h1: "Retirement Calculator",
    sub: "Project your savings at retirement and the monthly income your nest egg can support.",
    fields: [
      { key: "currentAge", label: "Current age", type: "number", default: 30, min: 18, max: 80, step: 1, inputMode: "numeric" },
      { key: "retireAge", label: "Retirement age", type: "number", default: 65, min: 40, max: 90, step: 1, inputMode: "numeric" },
      { key: "savings", label: "Current savings (USD)", type: "number", default: 25000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "contribution", label: "Monthly contribution (USD)", type: "number", default: 500, min: 0, step: 50, inputMode: "numeric" },
      { key: "returnPct", label: "Annual return (%)", type: "number", default: 7, min: 0, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const age = Number(v.currentAge) || 30;
      const retire = Number(v.retireAge) || 65;
      const savings = Number(v.savings) || 0;
      const contrib = Number(v.contribution) || 0;
      const ret = Number(v.returnPct) || 0;
      const r = retirementProjection(age, retire, savings, contrib, ret);
      return [
        moneyRow("Balance at retirement", r.balanceAtRetirement, true),
        moneyRow("Monthly income (4% rule)", r.monthlyIncome4pct),
        moneyRow("Total contributions", r.totalContributions),
        moneyRow("Investment growth", r.investmentGrowth),
      ];
    },
    note: "Assumes a constant annual return. Real returns vary year to year.",
    faq: [
      { q: "What is the 4% rule?", a: "A common guideline: withdraw 4% of your nest egg in year one of retirement, adjusting for inflation after. It was designed to make savings last 30 years." },
      { q: "What return should I assume?", a: "Historical US stock market returns average ~7% after inflation, but expect wide swings. Using 5-7% for planning is prudent." },
    ],
    related: ["salary-after-tax-calculator", "paycheck-calculator", "debt-payoff-calculator"],
  },
  {
    slug: "tax-calculator",
    title: "Tax Calculator 2026 — Estimate Your Income Tax | US Money HQ",
    shortTitle: "Tax Calculator",
    description: "Free US income tax calculator: estimate federal, FICA, and state taxes plus your effective tax rate. 2025 brackets, all 50 states.",
    h1: "Tax Calculator",
    sub: "Estimate your total income tax and effective rate for the current tax year.",
    fields: [
      { key: "income", label: "Annual income (USD)", type: "number", default: 80000, min: 0, step: 1000, inputMode: "numeric" },
      {
        key: "state",
        label: "State",
        type: "select",
        default: "CA",
        options: US_STATES.map((s) => ({ value: s, label: s })),
      },
      {
        key: "filing",
        label: "Filing status",
        type: "select",
        default: "single",
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married filing jointly" },
        ],
      },
    ],
    compute: (v) => {
      const income = Number(v.income) || 0;
      const state = String(v.state);
      const filing = v.filing === "married" ? "married" : "single";
      const fed = federalTax(income, filing);
      const f = fica(income, filing);
      const st = stateTax(income, state, filing);
      const total = fed.tax + f.total + st.tax;
      const effective = income > 0 ? (total / income) * 100 : 0;
      return [
        moneyRow("Total tax", total, true),
        moneyRow("Federal income tax", fed.tax),
        moneyRow("Social Security + Medicare", f.total),
        { label: `State tax (${state})`, value: money(st.tax) },
        { label: "Effective tax rate", value: `${effective.toFixed(1)}%` },
      ];
    },
    note: "Estimate only — does not include credits, deductions beyond the standard deduction, or self-employment tax.",
    faq: [
      { q: "What is my effective tax rate?", a: "Your effective rate is total tax divided by gross income. Because of brackets and deductions, it is always lower than your marginal (top-bracket) rate." },
      { q: "Does this include self-employment tax?", a: "No. Self-employed filers pay an extra 15.3% on net earnings (deductible half), which this W-2-style estimate does not include." },
    ],
    related: ["salary-after-tax-calculator", "paycheck-calculator", "retirement-calculator"],
  },
  {
    slug: "credit-card-payoff-calculator",
    title: "Credit Card Payoff Calculator 2026 — Minimum vs Fixed Payment | US Money HQ",
    shortTitle: "Credit Card Payoff Calculator",
    description: "Free US credit card payoff calculator: see how long minimum payments take vs a fixed payment, and the total interest each path costs.",
    h1: "Credit Card Payoff Calculator",
    sub: "See the true cost of minimum payments versus a fixed monthly payment.",
    fields: [
      { key: "balance", label: "Credit card balance (USD)", type: "number", default: 8000, min: 0, step: 100, inputMode: "numeric" },
      { key: "apr", label: "APR (%)", type: "number", default: 22, min: 0, step: 0.01, inputMode: "decimal" },
      { key: "fixedPayment", label: "Your fixed monthly payment (USD)", type: "number", default: 250, min: 1, step: 10, inputMode: "numeric" },
    ],
    compute: (v) => {
      const balance = Number(v.balance) || 0;
      const apr = Number(v.apr) || 0;
      const fixed = Number(v.fixedPayment) || 0;
      const min = creditCardMinPayment(balance, apr);
      const fix = debtPayoff(balance, apr, fixed, 0);
      return [
        { label: "Payoff time (minimum)", value: `${min.months} months`, highlight: true },
        moneyRow("Interest (minimum path)", min.totalInterest),
        { label: "Payoff time (your payment)", value: `${fix.months} months` },
        moneyRow("Interest (your payment)", fix.totalInterest),
        moneyRow("Interest saved", Math.max(0, min.totalInterest - fix.totalInterest)),
      ];
    },
    note: "Assumes a 2% minimum (min $25). Rates and payments can change.",
    faq: [
      { q: "Why do minimum payments take so long?", a: "The minimum mostly covers interest, so the balance shrinks slowly. At 22% APR, a $8,000 balance takes decades at the minimum and costs thousands in interest." },
      { q: "What is the best payoff strategy?", a: "Pay the highest-APR card first (avalanche) to minimize interest, or the smallest balance first (snowball) for motivation. Either beats the minimum." },
    ],
    related: ["debt-payoff-calculator", "auto-loan-calculator", "dti-calculator"],
  },
  {
    slug: "child-support-calculator",
    title: "Child Support Calculator 2026 — Estimate Monthly Support | US Money HQ",
    shortTitle: "Child Support Calculator",
    description: "Free US child support estimator: rough monthly support range based on income and number of children. Check your state's official guideline.",
    h1: "Child Support Calculator",
    sub: "Rough monthly support estimate based on income and number of children.",
    fields: [
      { key: "ncpIncome", label: "Non-custodial monthly income (USD)", type: "number", default: 5000, min: 0, step: 100, inputMode: "numeric" },
      { key: "custodialIncome", label: "Custodial monthly income (USD)", type: "number", default: 3000, min: 0, step: 100, inputMode: "numeric" },
      {
        key: "kids",
        label: "Number of children",
        type: "select",
        default: 2,
        options: [
          { value: 1, label: "1 child" },
          { value: 2, label: "2 children" },
          { value: 3, label: "3 children" },
          { value: 4, label: "4+ children" },
        ],
      },
    ],
    compute: (v) => {
      const ncp = Number(v.ncpIncome) || 0;
      const cust = Number(v.custodialIncome) || 0;
      const kids = Number(v.kids) || 1;
      const r = childSupportEstimate(ncp, cust, kids);
      return [
        moneyRow("Estimated monthly support", r.monthly, true),
        { label: "Share of income", value: `${r.pct}%` },
        { label: "Note", value: r.note },
      ];
    },
    note: "Each state uses its own guideline formula — this is a planning estimate only.",
    faq: [
      { q: "How is child support calculated?", a: "Most states use income-shares or percentage-of-income models considering both parents' income, number of children, and custody time. Official state calculators give exact numbers." },
      { q: "Can support be modified?", a: "Yes — a significant income change or custody change can justify a modification, typically filed through your state's child support agency or court." },
    ],
    related: ["paycheck-calculator", "salary-after-tax-calculator", "dti-calculator"],
  },
  {
    slug: "concrete-calculator",
    title: "Concrete Calculator 2026 — Slab Yardage & Bags | US Money HQ",
    shortTitle: "Concrete Calculator",
    description: "Free concrete calculator: cubic yards for a slab, 60lb/80lb bag counts, and material cost estimate for your project.",
    h1: "Concrete Calculator",
    sub: "Estimate concrete yardage, bag counts, and material cost for a slab.",
    fields: [
      { key: "length", label: "Length (ft)", type: "number", default: 20, min: 1, step: 0.5, inputMode: "decimal" },
      { key: "width", label: "Width (ft)", type: "number", default: 10, min: 1, step: 0.5, inputMode: "decimal" },
      { key: "thickness", label: "Thickness (inches)", type: "number", default: 4, min: 1, max: 24, step: 0.5, inputMode: "decimal" },
      { key: "pricePerYard", label: "Concrete price per cubic yard (USD)", type: "number", default: 150, min: 0, step: 5, inputMode: "numeric" },
    ],
    compute: (v) => {
      const len = Number(v.length) || 0;
      const wid = Number(v.width) || 0;
      const thick = Number(v.thickness) || 0;
      const price = Number(v.pricePerYard) || 0;
      const r = concreteNeeds(len, wid, thick, price);
      return [
        { label: "Cubic yards", value: `${r.cubicYards} yd³`, highlight: true },
        { label: "Cubic feet", value: `${r.cubicFeet} ft³` },
        { label: "60 lb bags", value: String(r.bags60) },
        { label: "80 lb bags", value: String(r.bags80) },
        moneyRow("Material cost (est.)", r.cost),
      ];
    },
    note: "Add 5-10% for waste. Price varies by region and mix.",
    faq: [
      { q: "How many bags of concrete do I need?", a: "A 60 lb bag covers about 0.45 cubic feet; an 80 lb bag about 0.6 cubic feet. Divide your total cubic feet by those numbers and round up." },
      { q: "How thick should a slab be?", a: "Patios and walkways: 4 inches. Driveways: 4-6 inches. Heavy structures: 6+ inches with rebar or wire mesh." },
    ],
    related: ["mortgage-calculator", "heloc-calculator", "dti-calculator"],
  },
  {
    slug: "tdee-calculator",
    title: "TDEE Calculator 2026 — Maintenance, Cut & Bulk Calories | US Money HQ",
    shortTitle: "TDEE Calculator",
    description: "Free TDEE calculator: estimate your total daily energy expenditure, BMR, and calories for cutting, maintaining, or bulking. Mifflin-St Jeor formula.",
    h1: "TDEE Calculator",
    sub: "Find your maintenance calories and the right intake for cutting or bulking.",
    fields: [
      { key: "age", label: "Age", type: "number", default: 30, min: 15, max: 90, step: 1, inputMode: "numeric" },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        default: "male",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
      },
      { key: "heightFt", label: "Height (feet)", type: "number", default: 5, min: 3, max: 7, step: 0.1, inputMode: "decimal" },
      { key: "heightIn", label: "Height (inches)", type: "number", default: 10, min: 0, max: 11, step: 1, inputMode: "numeric" },
      { key: "weightLb", label: "Weight (lbs)", type: "number", default: 180, min: 80, max: 600, step: 1, inputMode: "numeric" },
      {
        key: "activity",
        label: "Activity level",
        type: "select",
        default: 1.375,
        options: [
          { value: 1.2, label: "Sedentary (little exercise)" },
          { value: 1.375, label: "Light (1-3 days/week)" },
          { value: 1.55, label: "Moderate (3-5 days/week)" },
          { value: 1.725, label: "Very active (6-7 days/week)" },
          { value: 1.9, label: "Extra active (physical job + training)" },
        ],
      },
    ],
    compute: (v) => {
      const age = Number(v.age) || 30;
      const gender = v.gender === "female" ? "female" : "male";
      const heightCm = (Number(v.heightFt) || 0) * 30.48 + (Number(v.heightIn) || 0) * 2.54;
      const weightKg = (Number(v.weightLb) || 0) * 0.4536;
      const activity = Number(v.activity) || 1.375;
      const r = tdee(age, gender, heightCm, weightKg, activity);
      return [
        { label: "Maintenance (TDEE)", value: `${Math.round(r.tdee)} cal`, highlight: true },
        { label: "BMR", value: `${Math.round(r.bmr)} cal` },
        { label: "Cut (-500)", value: `${Math.round(r.cut)} cal` },
        { label: "Bulk (+300)", value: `${Math.round(r.bulk)} cal` },
      ];
    },
    note: "Estimate only — individual metabolism varies ±10-15%.",
    faq: [
      { q: "What is TDEE?", a: "Total Daily Energy Expenditure: the calories you burn in a day including activity. Eat below it to lose weight, above it to gain." },
      { q: "Which formula is used?", a: "The Mifflin-St Jeor equation, considered the most accurate BMR formula for most adults, multiplied by a standard activity factor." },
    ],
    related: ["body-fat-calculator", "water-intake-calculator", "sleep-calculator"],
  },
  {
    slug: "water-intake-calculator",
    title: "Water Intake Calculator 2026 — How Much Water to Drink | US Money HQ",
    shortTitle: "Water Intake Calculator",
    description: "Free water intake calculator: how much water you should drink daily based on weight and exercise. Ounces, liters, and cups.",
    h1: "Water Intake Calculator",
    sub: "Daily hydration target based on your body weight and activity.",
    fields: [
      { key: "weightLb", label: "Weight (lbs)", type: "number", default: 180, min: 60, max: 600, step: 1, inputMode: "numeric" },
      { key: "exercise", label: "Exercise per day (minutes)", type: "number", default: 30, min: 0, max: 300, step: 10, inputMode: "numeric" },
    ],
    compute: (v) => {
      const weightKg = (Number(v.weightLb) || 0) * 0.4536;
      const exercise = Number(v.exercise) || 0;
      const r = waterIntake(weightKg, exercise);
      return [
        { label: "Daily target", value: `${Math.round(r.ounces)} oz`, highlight: true },
        { label: "In liters", value: `${r.liters.toFixed(1)} L` },
        { label: "In cups (8 oz)", value: `${Math.round(r.cups)} cups` },
      ];
    },
    note: "Estimate only. Climate, sweat rate, and health conditions change the need.",
    faq: [
      { q: "Is the 8 glasses a day rule accurate?", a: "Not really — needs scale with body weight and activity. A 180 lb active person needs roughly 100+ oz, while a smaller sedentary person needs less." },
      { q: "Does coffee count?", a: "Mostly yes. Caffeinated drinks count toward hydration, though water is still the best choice for most of your intake." },
    ],
    related: ["tdee-calculator", "body-fat-calculator", "sleep-calculator"],
  },
  {
    slug: "sleep-calculator",
    title: "Sleep Calculator 2026 — Best Bedtime by Sleep Cycles | US Money HQ",
    shortTitle: "Sleep Calculator",
    description: "Free sleep calculator: the best bedtimes to wake up refreshed, based on 90-minute sleep cycles.",
    h1: "Sleep Calculator",
    sub: "Find the ideal bedtime to complete full sleep cycles before your wake time.",
    fields: [
      { key: "wakeHour", label: "Wake hour", type: "number", default: 6, min: 1, max: 12, step: 1, inputMode: "numeric" },
      { key: "wakeMin", label: "Wake minute", type: "number", default: 30, min: 0, max: 59, step: 5, inputMode: "numeric" },
      {
        key: "amPm",
        label: "AM / PM",
        type: "select",
        default: "am",
        options: [
          { value: "am", label: "AM" },
          { value: "pm", label: "PM" },
        ],
      },
    ],
    compute: (v) => {
      let hour = Number(v.wakeHour) || 6;
      const min = Number(v.wakeMin) || 0;
      const amPm = String(v.amPm);
      if (amPm === "pm" && hour !== 12) hour += 12;
      if (amPm === "am" && hour === 12) hour = 0;
      const cycles = sleepCycles(hour, min);
      return [
        { label: "6 cycles (9h sleep)", value: cycles[0].bedtime, highlight: true },
        { label: "5 cycles (7.5h sleep)", value: cycles[1].bedtime },
        { label: "4 cycles (6h sleep)", value: cycles[2].bedtime },
      ];
    },
    note: "Waking at the end of a 90-min cycle reduces grogginess.",
    faq: [
      { q: "What are sleep cycles?", a: "Sleep runs in ~90-minute cycles through light, deep, and REM stages. Waking mid-cycle causes sleep inertia; waking at cycle end feels natural." },
      { q: "How many cycles do I need?", a: "Most adults need 5-6 full cycles (7.5-9 hours). Four cycles works for some, but most people feel best at 7.5+ hours." },
    ],
    related: ["tdee-calculator", "water-intake-calculator", "body-fat-calculator"],
  },
  {
    slug: "body-fat-calculator",
    title: "Body Fat Calculator 2026 — US Navy Method | US Money HQ",
    shortTitle: "Body Fat Calculator",
    description: "Free body fat percentage calculator using the US Navy tape method. Height, waist, neck (and hip for women) measurements.",
    h1: "Body Fat Calculator",
    sub: "Estimate your body fat percentage with simple tape measurements.",
    fields: [
      {
        key: "gender",
        label: "Gender",
        type: "select",
        default: "male",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
      },
      { key: "heightIn", label: "Height (inches)", type: "number", default: 70, min: 48, max: 90, step: 0.5, inputMode: "decimal" },
      { key: "waistIn", label: "Waist (inches)", type: "number", default: 34, min: 20, max: 80, step: 0.5, inputMode: "decimal" },
      { key: "neckIn", label: "Neck (inches)", type: "number", default: 15, min: 10, max: 30, step: 0.5, inputMode: "decimal" },
      { key: "hipIn", label: "Hip (inches, women only)", type: "number", default: 38, min: 20, max: 80, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const gender = v.gender === "female" ? "female" : "male";
      const toCm = (i: number) => i * 2.54;
      const heightCm = toCm(Number(v.heightIn) || 0);
      const waistCm = toCm(Number(v.waistIn) || 0);
      const neckCm = toCm(Number(v.neckIn) || 0);
      const hipCm = toCm(Number(v.hipIn) || 0);
      const r = bodyFat(gender, heightCm, waistCm, neckCm, hipCm);
      return [
        { label: "Body fat", value: `${r.pct}%`, highlight: true },
        { label: "Category", value: r.category },
      ];
    },
    note: "US Navy method — accurate to ±3-4% for most people.",
    faq: [
      { q: "How accurate is the tape method?", a: "The US Navy formula is within about ±3-4% of hydrostatic weighing for most people when measurements are taken correctly." },
      { q: "What is a healthy body fat range?", a: "Athletes: 14-24% (women) / 6-17% (men). Acceptable: 25-31% (women) / 18-24% (men). Above that is classified as obese." },
    ],
    related: ["tdee-calculator", "water-intake-calculator", "sleep-calculator"],
  },
  {
    slug: "paint-calculator",
    title: "Paint Calculator 2026 — Gallons Needed & Cost | US Money HQ",
    shortTitle: "Paint Calculator",
    description: "Free paint calculator: gallons of paint needed for a room and estimated cost. Accounts for doors, windows, and coats.",
    h1: "Paint Calculator",
    sub: "Estimate how much paint your room needs and what it costs.",
    fields: [
      { key: "length", label: "Room length (ft)", type: "number", default: 14, min: 1, step: 0.5, inputMode: "decimal" },
      { key: "width", label: "Room width (ft)", type: "number", default: 12, min: 1, step: 0.5, inputMode: "decimal" },
      { key: "height", label: "Wall height (ft)", type: "number", default: 8, min: 1, step: 0.5, inputMode: "decimal" },
      { key: "coats", label: "Coats", type: "number", default: 2, min: 1, max: 5, step: 1, inputMode: "numeric" },
      { key: "doors", label: "Doors", type: "number", default: 1, min: 0, max: 10, step: 1, inputMode: "numeric" },
      { key: "windows", label: "Windows", type: "number", default: 2, min: 0, max: 20, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const len = Number(v.length) || 0;
      const wid = Number(v.width) || 0;
      const h = Number(v.height) || 0;
      const coats = Number(v.coats) || 1;
      const doors = Number(v.doors) || 0;
      const windows = Number(v.windows) || 0;
      const r = paintNeeds(len, wid, h, coats, doors, windows, 40);
      return [
        { label: "Paint needed", value: `${r.gallons} gallon${r.gallons === 1 ? "" : "s"}`, highlight: true },
        { label: "Wall area", value: `${Math.round(r.wallArea)} sq ft` },
        { label: "Estimated cost", value: `$${r.cost.toLocaleString("en-US")}` },
      ];
    },
    note: "Assumes ~350 sq ft coverage per gallon. Textured walls use more.",
    faq: [
      { q: "How much area does a gallon cover?", a: "A gallon of interior paint covers roughly 350-400 sq ft per coat on smooth, primed walls." },
      { q: "Why two coats?", a: "Two coats give even color and better durability. Dark colors and dramatic color changes often need three." },
    ],
    related: ["concrete-calculator", "mulch-calculator", "mortgage-calculator"],
  },
  {
    slug: "mulch-calculator",
    title: "Mulch Calculator 2026 — Cubic Yards & Bags | US Money HQ",
    shortTitle: "Mulch Calculator",
    description: "Free mulch calculator: cubic yards of mulch for your beds, bag counts, and estimated cost.",
    h1: "Mulch Calculator",
    sub: "Estimate how much mulch you need and what it costs.",
    fields: [
      { key: "length", label: "Area length (ft)", type: "number", default: 20, min: 1, step: 0.5, inputMode: "decimal" },
      { key: "width", label: "Area width (ft)", type: "number", default: 10, min: 1, step: 0.5, inputMode: "decimal" },
      { key: "depth", label: "Depth (inches)", type: "number", default: 3, min: 1, max: 12, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const len = Number(v.length) || 0;
      const wid = Number(v.width) || 0;
      const depth = Number(v.depth) || 0;
      const r = mulchNeeds(len, wid, depth, 35);
      return [
        { label: "Cubic yards", value: `${r.cubicYards} yd³`, highlight: true },
        { label: "2 cu ft bags", value: String(r.bags) },
        { label: "Estimated cost", value: `$${r.cost.toLocaleString("en-US")}` },
      ];
    },
    note: "Aim for 2-3 inches of mulch. Prices vary by type (wood, rubber, stone).",
    faq: [
      { q: "How deep should mulch be?", a: "2-3 inches is ideal: enough to suppress weeds and retain moisture without suffocating plant roots." },
      { q: "Bulk vs bagged mulch?", a: "For large areas bulk (by the yard) is cheaper; bags (2 cu ft each) are easier for small beds and DIY transport." },
    ],
    related: ["concrete-calculator", "paint-calculator", "mortgage-calculator"],
  },
  {
    slug: "salary-percentile-calculator",
    title: "Salary Percentile Calculator 2026 — Where Do You Rank? | US Money HQ",
    shortTitle: "Salary Percentile Calculator",
    description: "Free US salary percentile calculator: see what percentile your income ranks among full-time US earners.",
    h1: "Salary Percentile Calculator",
    sub: "See where your income ranks among full-time US earners.",
    fields: [
      { key: "income", label: "Annual income (USD)", type: "number", default: 75000, min: 0, step: 1000, inputMode: "numeric" },
    ],
    compute: (v) => {
      const income = Number(v.income) || 0;
      const r = salaryPercentile(income);
      return [
        { label: "Income percentile", value: `${r.percentile}th`, highlight: true },
        { label: "Note", value: r.note },
      ];
    },
    note: "Estimate for individual full-time earners — household income percentiles differ.",
    faq: [
      { q: "What is the median US salary?", a: "The median individual full-time income is roughly $50-55K. Half of full-time earners make less, half make more." },
      { q: "Individual vs household percentile?", a: "This uses individual earners. Household income percentiles are higher because they combine multiple earners." },
    ],
    related: ["salary-after-tax-calculator", "paycheck-calculator", "retirement-calculator"],
  },
  {
    slug: "home-affordability-calculator",
    title: "Home Affordability Calculator 2026 — How Much House | US Money HQ",
    shortTitle: "Home Affordability Calculator",
    description: "Free home affordability calculator: how much house you can afford based on income, debt, down payment, and the 28/36 rule.",
    h1: "Home Affordability Calculator",
    sub: "How much house can you afford? Uses the lender 28/36 rule.",
    fields: [
      { key: "income", label: "Annual income (USD)", type: "number", default: 120000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "debt", label: "Monthly debt payments (USD)", type: "number", default: 500, min: 0, step: 50, inputMode: "numeric" },
      { key: "down", label: "Down payment (USD)", type: "number", default: 40000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "rate", label: "Interest rate (annual %)", type: "number", default: 6.5, min: 0, step: 0.01, inputMode: "decimal" },
      {
        key: "years",
        label: "Loan term (years)",
        type: "select",
        default: 30,
        options: [
          { value: 15, label: "15 years" },
          { value: 30, label: "30 years" },
        ],
      },
    ],
    compute: (v) => {
      const income = Number(v.income) || 0;
      const debt = Number(v.debt) || 0;
      const down = Number(v.down) || 0;
      const rate = Number(v.rate) || 0;
      const years = Number(v.years) || 30;
      const r = homeAffordability(income, debt, down, rate, years);
      return [
        moneyRow("Max home price", Math.max(0, r.maxPrice), true),
        moneyRow("Max loan amount", Math.max(0, r.maxLoan)),
        moneyRow("Est. monthly payment (PITI)", r.monthlyPayment),
        moneyRow("Housing budget (28/36)", r.housingBudget),
      ];
    },
    note: "Assumes 1% property tax + 0.5% insurance. FHA/VA may allow higher ratios.",
    faq: [
      { q: "What is the 28/36 rule?", a: "Lenders typically cap housing costs at 28% of gross income and total debt at 36%. FHA allows up to 31/43 in many cases." },
      { q: "Should I use the max price?", a: "Just because you qualify doesn't mean you should buy at the max. Leave room for maintenance, repairs, and lifestyle costs." },
    ],
    related: ["mortgage-calculator", "dti-calculator", "pmi-calculator"],
  },
  {
    slug: "gpa-calculator",
    title: "GPA Calculator 2026 — 4.0 Scale | US Money HQ",
    shortTitle: "GPA Calculator",
    description: "Free GPA calculator: compute your grade point average on the 4.0 scale from course credits and letter grades.",
    h1: "GPA Calculator",
    sub: "Calculate your GPA on the 4.0 scale from credits and letter grades.",
    fields: [
      ...Array.from({ length: 6 }, (_, i) => [
        { key: `c${i + 1}`, label: `Course ${i + 1} credits`, type: "number" as const, default: 3, min: 1, max: 6, step: 1, inputMode: "numeric" as const },
        {
          key: `g${i + 1}`,
          label: `Course ${i + 1} grade`,
          type: "select" as const,
          default: "B",
          options: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"].map((g) => ({ value: g, label: g })),
        },
      ]).flat() as ToolField[],
    ],
    compute: (v) => {
      const entries: { credits: number; points: number }[] = [];
      for (let i = 1; i <= 6; i++) {
        const credits = Number(v[`c${i}`]) || 0;
        const grade = String(v[`g${i}`] || "F");
        if (credits > 0) entries.push({ credits, points: GRADE_POINTS[grade] ?? 0 });
      }
      const r = gpaCalculate(entries);
      return [
        { label: "GPA", value: r.gpa.toFixed(2), highlight: true },
        { label: "Total credits", value: String(r.totalCredits) },
      ];
    },
    note: "Standard 4.0 scale with +/- grades. Honors/AP weighting not included.",
    faq: [
      { q: "How is GPA calculated?", a: "Multiply each course's credits by its grade points (A=4, B=3, etc.), sum them, and divide by total credits." },
      { q: "Do plus/minus grades count?", a: "Yes — on this scale A- is 3.7, B+ is 3.3, and so on. Some schools don't use +/-; check your institution." },
    ],
    related: ["grade-calculator", "due-date-calculator", "gpa-calculator"],
  },
  {
    slug: "due-date-calculator",
    title: "Due Date Calculator 2026 — Pregnancy Due Date | US Money HQ",
    shortTitle: "Due Date Calculator",
    description: "Free pregnancy due date calculator: estimated due date from your last period using Naegele's rule, plus current gestational age and trimester.",
    h1: "Due Date Calculator",
    sub: "Estimated due date, gestational age, and trimester from your last period.",
    fields: [
      { key: "lmpMonth", label: "Last period — month", type: "number", default: 1, min: 1, max: 12, step: 1, inputMode: "numeric" },
      { key: "lmpDay", label: "Last period — day", type: "number", default: 15, min: 1, max: 31, step: 1, inputMode: "numeric" },
      { key: "lmpYear", label: "Last period — year", type: "number", default: 2026, min: 2020, max: 2030, step: 1, inputMode: "numeric" },
      {
        key: "cycle",
        label: "Cycle length (days)",
        type: "select",
        default: 28,
        options: [21, 24, 26, 28, 30, 32, 35].map((d) => ({ value: d, label: `${d} days` })),
      },
    ],
    compute: (v) => {
      const m = Number(v.lmpMonth) || 1;
      const d = Number(v.lmpDay) || 1;
      const y = Number(v.lmpYear) || 2026;
      const cycle = Number(v.cycle) || 28;
      const r = dueDate(m, d, y, cycle);
      return [
        { label: "Estimated due date", value: r.dueDate, highlight: true },
        { label: "Gestational age", value: `${r.gestationalWeeks} weeks ${r.gestationalDays} days` },
        { label: "Trimester", value: `${r.trimester} trimester` },
      ];
    },
    note: "Naegele's rule assumes a 28-day cycle. Ultrasound dating is more accurate.",
    faq: [
      { q: "How accurate is a due date from LMP?", a: "Within about a week, assuming regular 28-day cycles. A first-trimester ultrasound is the most accurate dating method." },
      { q: "Why adjust for cycle length?", a: "Ovulation shifts with cycle length. Longer cycles push the due date later; this calculator adjusts proportionally." },
    ],
    related: ["grade-calculator", "gpa-calculator", "sleep-calculator"],
  },
  {
    slug: "grade-calculator",
    title: "Final Grade Calculator 2026 — What You Need on the Exam | US Money HQ",
    shortTitle: "Final Grade Calculator",
    description: "Free final grade calculator: the exam score you need to reach your target course grade, based on your current grade and exam weight.",
    h1: "Final Grade Calculator",
    sub: "What score do you need on the final to hit your target grade?",
    fields: [
      { key: "current", label: "Current grade (%)", type: "number", default: 82, min: 0, max: 100, step: 0.5, inputMode: "decimal" },
      { key: "desired", label: "Target grade (%)", type: "number", default: 90, min: 0, max: 100, step: 0.5, inputMode: "decimal" },
      { key: "weight", label: "Final exam weight (%)", type: "number", default: 30, min: 1, max: 100, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const current = Number(v.current) || 0;
      const desired = Number(v.desired) || 0;
      const weight = Number(v.weight) || 0;
      const r = examScoreNeeded(current, desired, weight);
      return [
        { label: "Score needed on final", value: `${r.needed.toFixed(1)}%`, highlight: true },
        { label: "Achievable?", value: r.possible ? "Yes — within range" : "No — even 100% isn't enough" },
      ];
    },
    note: "Assumes your current grade is your average before the final.",
    faq: [
      { q: "How is the needed score calculated?", a: "Desired = current×(1−weight) + exam×weight. Solving for exam gives the score you need." },
      { q: "What if I can't reach my target?", a: "If the needed score is over 100, your target is mathematically out of reach — recalculate with a lower target." },
    ],
    related: ["gpa-calculator", "due-date-calculator", "salary-percentile-calculator"],
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator 2026 — Free Online | US Money HQ",
    shortTitle: "Percentage Calculator",
    description: "Free percentage calculator: what is X% of Y, X is what percent of Y, and percentage change. Instant results, works on any device.",
    h1: "Percentage Calculator",
    sub: "Solve any percentage problem in seconds: X% of Y, X is what % of Y, and % change.",
    fields: [
      {
        key: "mode",
        label: "Calculation type",
        type: "select",
        default: "of",
        options: [
          { value: "of", label: "What is A% of B?" },
          { value: "iswhat", label: "A is what % of B?" },
          { value: "change", label: "% change from A to B" },
        ],
      },
      { key: "a", label: "Value A", type: "number", default: 15, step: 0.01, inputMode: "decimal" },
      { key: "b", label: "Value B", type: "number", default: 200, step: 0.01, inputMode: "decimal" },
    ],
    compute: (v) => {
      const mode = String(v.mode) as "of" | "iswhat" | "change";
      const a = Number(v.a) || 0;
      const b = Number(v.b) || 0;
      const r = percentageCalc(mode, a, b);
      return [
        { label: "Result", value: `${r.value}`, highlight: true },
        { label: "Expression", value: r.label },
      ];
    },
    note: "Simple percent math — no sign-up, no data stored.",
    faq: [
      { q: "How do I calculate X% of Y?", a: "Multiply X by Y and divide by 100. Example: 15% of 200 = (15 × 200) ÷ 100 = 30." },
      { q: "How do I calculate percentage change?", a: "Subtract the old value from the new value, divide by the old value, and multiply by 100." },
    ],
    related: ["tip-calculator", "salary-percentile-calculator", "grade-calculator"],
  },
  {
    slug: "compound-interest-calculator",
    title: "Compound Interest Calculator 2026 — Growth Over Time | US Money HQ",
    shortTitle: "Compound Interest Calculator",
    description: "Free compound interest calculator: project your investment growth with monthly contributions. See interest earned vs contributions.",
    h1: "Compound Interest Calculator",
    sub: "See how your money grows with compound interest and regular contributions.",
    fields: [
      { key: "principal", label: "Initial amount (USD)", type: "number", default: 10000, min: 0, step: 500, inputMode: "numeric" },
      { key: "rate", label: "Annual interest rate (%)", type: "number", default: 7, min: 0, step: 0.1, inputMode: "decimal" },
      { key: "years", label: "Years", type: "number", default: 20, min: 1, max: 60, step: 1, inputMode: "numeric" },
      { key: "compounds", label: "Compounding", type: "select", default: 12, options: [
          { value: 1, label: "Annually" },
          { value: 4, label: "Quarterly" },
          { value: 12, label: "Monthly" },
          { value: 365, label: "Daily" },
        ] },
      { key: "contribution", label: "Monthly contribution (USD)", type: "number", default: 200, min: 0, step: 50, inputMode: "numeric" },
    ],
    compute: (v) => {
      const principal = Number(v.principal) || 0;
      const rate = Number(v.rate) || 0;
      const years = Number(v.years) || 0;
      const compounds = Number(v.compounds) || 12;
      const contrib = Number(v.contribution) || 0;
      const r = compoundInterest(principal, rate, years, compounds, contrib);
      return [
        moneyRow("Future value", r.futureValue, true),
        moneyRow("Total contributions", r.totalContributions),
        moneyRow("Interest earned", r.interestEarned),
      ];
    },
    note: "Estimate only — real returns vary year to year.",
    faq: [
      { q: "What is compound interest?", a: "Interest earned on both your original money and previously earned interest. Over decades it produces exponential growth." },
      { q: "How often should interest compound?", a: "More frequent compounding (daily vs yearly) yields slightly more. Monthly is the common assumption for savings and investments." },
    ],
    related: ["retirement-calculator", "cd-calculator", "investment-calculator"],
  },
  {
    slug: "cd-calculator",
    title: "CD Calculator 2026 — Certificate of Deposit Maturity | US Money HQ",
    shortTitle: "CD Calculator",
    description: "Free CD calculator: estimate certificate of deposit maturity value and interest earned by term and APY.",
    h1: "CD Calculator",
    sub: "Estimate your certificate of deposit maturity value.",
    fields: [
      { key: "principal", label: "Deposit amount (USD)", type: "number", default: 25000, min: 0, step: 500, inputMode: "numeric" },
      { key: "apy", label: "APY (%)", type: "number", default: 4.5, min: 0, step: 0.05, inputMode: "decimal" },
      { key: "months", label: "Term (months)", type: "select", default: 12, options: [
          { value: 3, label: "3 months" },
          { value: 6, label: "6 months" },
          { value: 12, label: "12 months" },
          { value: 24, label: "24 months" },
          { value: 60, label: "60 months" },
        ] },
    ],
    compute: (v) => {
      const principal = Number(v.principal) || 0;
      const apy = Number(v.apy) || 0;
      const months = Number(v.months) || 12;
      const r = cdMaturity(principal, apy, months, 12);
      return [
        moneyRow("Maturity value", r.maturity, true),
        moneyRow("Interest earned", r.interest),
      ];
    },
    note: "Assumes interest compounds monthly and no early withdrawal penalty.",
    faq: [
      { q: "What is a CD?", a: "A certificate of deposit locks your money for a fixed term in exchange for a guaranteed interest rate, typically higher than a savings account." },
      { q: "Are CD rates worth it?", a: "CDs offer a guaranteed return with FDIC insurance. Compare APYs across banks — online banks often pay 2-3x branch rates." },
    ],
    related: ["compound-interest-calculator", "retirement-calculator", "savings-goal-calculator"],
  },
  {
    slug: "overtime-calculator",
    title: "Overtime Calculator 2026 — Time and a Half Pay | US Money HQ",
    shortTitle: "Overtime Calculator",
    description: "Free overtime calculator: estimate your weekly pay with time-and-a-half (1.5x) and double-time (2x) overtime hours.",
    h1: "Overtime Calculator",
    sub: "Estimate your paycheck with overtime at 1.5x and 2x your regular rate.",
    fields: [
      { key: "rate", label: "Regular hourly rate (USD)", type: "number", default: 25, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "regularHours", label: "Regular hours", type: "number", default: 40, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "ot1x", label: "Overtime hours (1.5x)", type: "number", default: 5, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "ot2x", label: "Double-time hours (2x)", type: "number", default: 0, min: 0, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const rate = Number(v.rate) || 0;
      const reg = Number(v.regularHours) || 0;
      const ot1 = Number(v.ot1x) || 0;
      const ot2 = Number(v.ot2x) || 0;
      const r = overtimePay(rate, reg, ot1, ot2);
      return [
        moneyRow("Regular pay", r.regular),
        moneyRow("Overtime pay", r.overtime),
        moneyRow("Total pay", r.total, true),
      ];
    },
    note: "FLSA requires 1.5x after 40 hours/week; double-time depends on state/employer.",
    faq: [
      { q: "When does overtime start?", a: "Under federal law (FLSA), nonexempt employees earn 1.5x for hours over 40 in a workweek. Some states have daily overtime rules." },
      { q: "What is double time?", a: "Some states or contracts pay 2x for certain hours (e.g., over 12 in a day, or working a 7th consecutive day)." },
    ],
    related: ["paycheck-calculator", "salary-after-tax-calculator", "tax-calculator"],
  },
  {
    slug: "tip-calculator",
    title: "Tip Calculator 2026 — Split the Bill | US Money HQ",
    shortTitle: "Tip Calculator",
    description: "Free tip calculator: calculate tip, total, and per-person amount. Split bills between friends instantly.",
    h1: "Tip Calculator",
    sub: "Tip, total, and per-person share — instant.",
    fields: [
      { key: "bill", label: "Bill amount (USD)", type: "number", default: 85.5, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "tipPct", label: "Tip (%)", type: "number", default: 18, min: 0, max: 100, step: 1, inputMode: "numeric" },
      { key: "split", label: "Split between (people)", type: "number", default: 2, min: 1, max: 20, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const bill = Number(v.bill) || 0;
      const pct = Number(v.tipPct) || 0;
      const split = Number(v.split) || 1;
      const r = tipCalc(bill, pct, split);
      return [
        moneyRow("Tip", r.tip),
        moneyRow("Total", r.total),
        moneyRow("Per person", r.perPerson, true),
      ];
    },
    note: "Standard US tipping is 15-20% for table service.",
    faq: [
      { q: "How much should I tip?", a: "15% for average service, 18-20% for good service in full-service restaurants. Many people tip 20% as the default." },
      { q: "Do I tip on the pre-tax amount?", a: "Etiquette varies, but most people tip on the pre-tax total. Some prefer the after-tax amount — either is acceptable." },
    ],
    related: ["percentage-calculator", "paycheck-calculator", "salary-after-tax-calculator"],
  },
  {
    slug: "student-loan-calculator",
    title: "Student Loan Calculator 2026 — Monthly Payment & Interest | US Money HQ",
    shortTitle: "Student Loan Calculator",
    description: "Free student loan calculator: estimate your monthly payment, total interest, and payoff timeline for federal or private loans.",
    h1: "Student Loan Calculator",
    sub: "Monthly payment, total interest, and payoff for your student loans.",
    fields: [
      { key: "amount", label: "Loan balance (USD)", type: "number", default: 35000, min: 0, step: 500, inputMode: "numeric" },
      { key: "rate", label: "Interest rate (annual %)", type: "number", default: 5.5, min: 0, step: 0.01, inputMode: "decimal" },
      { key: "years", label: "Loan term (years)", type: "select", default: 10, options: [{ value: 5, label: "5 years" }, { value: 10, label: "10 years" }, { value: 15, label: "15 years" }, { value: 20, label: "20 years" }] },
    ],
    compute: (v) => {
      const amount = Number(v.amount) || 0;
      const rate = Number(v.rate) || 0;
      const years = Number(v.years) || 10;
      const r = amortizedPayment(amount, rate, years * 12);
      return [moneyRow("Monthly payment", r.payment, true), moneyRow("Total interest", r.totalInterest), moneyRow("Total paid", r.totalPaid)];
    },
    note: "Federal student loans use simple daily interest; private loans may compound. This is an amortized estimate.",
    faq: [
      { q: "Should I refinance my student loans?", a: "Refinancing can lower your rate if your credit is strong, but you lose federal protections like income-driven repayment and forgiveness programs. Compare your options before switching." },
      { q: "How is student loan interest calculated?", a: "Federal loans accrue simple interest daily based on your rate. This calculator estimates an amortized payment schedule, which is close for private loans and helpful for planning either way." },
    ],
    related: ["loan-calculator", "compound-interest-calculator", "savings-goal-calculator"],
  },
  {
    slug: "loan-calculator",
    title: "Loan Calculator 2026 — Payment & Total Cost | US Money HQ",
    shortTitle: "Loan Calculator",
    description: "Free general loan calculator: monthly payment, total interest, and total cost for any amortized loan.",
    h1: "Loan Calculator",
    sub: "Payment and total cost for any amortized loan.",
    fields: [
      { key: "amount", label: "Loan amount (USD)", type: "number", default: 20000, min: 0, step: 500, inputMode: "numeric" },
      { key: "rate", label: "Interest rate (annual %)", type: "number", default: 7.5, min: 0, step: 0.01, inputMode: "decimal" },
      { key: "months", label: "Loan term (months)", type: "number", default: 60, min: 1, max: 360, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const amount = Number(v.amount) || 0;
      const rate = Number(v.rate) || 0;
      const months = Number(v.months) || 60;
      const r = amortizedPayment(amount, rate, months);
      return [moneyRow("Monthly payment", r.payment, true), moneyRow("Total interest", r.totalInterest), moneyRow("Total paid", r.totalPaid)];
    },
    note: "Applies the standard amortization formula to any fixed-rate loan.",
    faq: [
      { q: "What is an amortized loan?", a: "An amortized loan is repaid in equal monthly installments that cover both principal and interest. Early payments are mostly interest; later payments are mostly principal." },
      { q: "How does a longer term affect cost?", a: "A longer term lowers your monthly payment but increases total interest — sometimes dramatically. Run the same amount at 36, 60, and 84 months to see the trade-off." },
    ],
    related: ["mortgage-calculator", "auto-loan-calculator", "simple-interest-calculator"],
  },
  {
    slug: "savings-goal-calculator",
    title: "Savings Goal Calculator 2026 — Time to Reach Your Target | US Money HQ",
    shortTitle: "Savings Goal Calculator",
    description: "Free savings goal calculator: how many months to reach your savings target with monthly contributions and interest.",
    h1: "Savings Goal Calculator",
    sub: "Months to your target, with contributions and interest.",
    fields: [
      { key: "goal", label: "Savings goal (USD)", type: "number", default: 10000, min: 1, step: 100, inputMode: "numeric" },
      { key: "current", label: "Current savings (USD)", type: "number", default: 1000, min: 0, step: 100, inputMode: "numeric" },
      { key: "monthly", label: "Monthly contribution (USD)", type: "number", default: 300, min: 0, step: 10, inputMode: "numeric" },
      { key: "rate", label: "Annual return (%)", type: "number", default: 4, min: 0, max: 25, step: 0.1, inputMode: "decimal" },
    ],
    compute: (v) => {
      const goal = Number(v.goal) || 0;
      const current = Number(v.current) || 0;
      const monthly = Number(v.monthly) || 0;
      const rate = Number(v.rate) || 0;
      const r = savingsGoal(goal, current, monthly, rate);
      return [
        { label: "Time to goal", value: r.years > 0 ? r.years + " yrs " + r.remMonths + " mo" : r.months + " months", highlight: true },
        moneyRow("Final balance", r.finalBalance),
        moneyRow("You contribute", r.contributed),
      ];
    },
    note: "Assumes monthly compounding at your annual return rate.",
    faq: [
      { q: "Where should I keep a savings goal?", a: "Short-term goals (under 5 years) belong in a high-yield savings account or CDs. Longer goals can tolerate index funds or target-date funds." },
      { q: "What return rate should I use?", a: "High-yield savings accounts pay roughly 4% in 2026. Index funds historically return 7-10% annually before inflation. Use a conservative number for planning." },
    ],
    related: ["compound-interest-calculator", "cd-calculator", "retirement-calculator"],
  },
  {
    slug: "net-worth-calculator",
    title: "Net Worth Calculator 2026 — Assets Minus Liabilities | US Money HQ",
    shortTitle: "Net Worth Calculator",
    description: "Free net worth calculator: add your assets and liabilities to see your true net worth in seconds.",
    h1: "Net Worth Calculator",
    sub: "Assets minus liabilities — your real financial position.",
    fields: [
      { key: "assets", label: "Total assets (USD)", type: "number", default: 150000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "liabilities", label: "Total liabilities (USD)", type: "number", default: 60000, min: 0, step: 1000, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = netWorth(Number(v.assets) || 0, Number(v.liabilities) || 0);
      return [moneyRow("Assets", r.assets), moneyRow("Liabilities", r.liabilities), moneyRow("Net worth", r.netWorth, true)];
    },
    note: "Assets include cash, investments, property, and vehicles. Liabilities include mortgages, loans, and credit card balances.",
    faq: [
      { q: "What counts as an asset?", a: "Anything you own with monetary value: cash, bank accounts, investments, retirement accounts, real estate equity, vehicles, and collectibles." },
      { q: "How often should I track net worth?", a: "Monthly is ideal for spotting trends. It should trend upward over time — if it isn't, your spending or debt is outpacing your savings." },
    ],
    related: ["budget-calculator", "savings-goal-calculator", "retirement-calculator"],
  },
  {
    slug: "hourly-to-salary-calculator",
    title: "Hourly to Salary Calculator 2026 — Annual Pay | US Money HQ",
    shortTitle: "Hourly to Salary Calculator",
    description: "Free hourly to salary calculator: convert your hourly wage to annual, monthly, and weekly pay.",
    h1: "Hourly to Salary Calculator",
    sub: "Your hourly rate, translated to annual pay.",
    fields: [
      { key: "hourly", label: "Hourly rate (USD)", type: "number", default: 22, min: 0, step: 0.25, inputMode: "decimal" },
      { key: "hours", label: "Hours per week", type: "number", default: 40, min: 1, max: 100, step: 1, inputMode: "numeric" },
      { key: "weeks", label: "Weeks worked per year", type: "number", default: 52, min: 1, max: 52, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = hourlyToSalary(Number(v.hourly) || 0, Number(v.hours) || 40, Number(v.weeks) || 52);
      return [moneyRow("Annual salary", r.annual, true), moneyRow("Monthly (gross)", r.monthly), moneyRow("Weekly (gross)", r.weekly)];
    },
    note: "Gross pay before taxes. Use the salary calculator for take-home.",
    faq: [
      { q: "How do I calculate salary from hourly?", a: "Multiply your hourly rate by hours per week, then by weeks per year (usually 52, or 40 if you take 12 weeks unpaid)." },
      { q: "Is overtime included?", a: "No — this assumes straight time. Add overtime separately using the overtime calculator." },
    ],
    related: ["salary-after-tax-calculator", "paycheck-calculator", "overtime-calculator"],
  },
  {
    slug: "gas-cost-calculator",
    title: "Gas Cost Calculator 2026 — Trip Fuel Cost | US Money HQ",
    shortTitle: "Gas Cost Calculator",
    description: "Free gas cost calculator: fuel cost for any trip based on miles, MPG, and gas price.",
    h1: "Gas Cost Calculator",
    sub: "How much your next drive will cost in fuel.",
    fields: [
      { key: "miles", label: "Trip distance (miles)", type: "number", default: 250, min: 0, step: 10, inputMode: "numeric" },
      { key: "mpg", label: "Vehicle MPG", type: "number", default: 28, min: 1, step: 1, inputMode: "numeric" },
      { key: "price", label: "Gas price (per gallon)", type: "number", default: 3.4, min: 0, step: 0.05, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = gasCost(Number(v.miles) || 0, Number(v.mpg) || 1, Number(v.price) || 0);
      return [{ label: "Gallons needed", value: r.gallons.toFixed(2) }, moneyRow("Fuel cost", r.cost, true)];
    },
    note: "MPG = highway/city blend as rated or measured. Real-world MPG is often 10-15% lower.",
    faq: [
      { q: "How do I find my real MPG?", a: "Divide miles driven between fill-ups by gallons pumped. Track 3-4 tanks for an accurate average." },
      { q: "Does driving style affect cost?", a: "Yes — aggressive acceleration, speeding over 60 mph, and idling can reduce fuel economy by 10-30%." },
    ],
    related: ["auto-loan-calculator", "percentage-calculator", "electricity-cost-calculator"],
  },
  {
    slug: "square-footage-calculator",
    title: "Square Footage Calculator 2026 — Room Area | US Money HQ",
    shortTitle: "Square Footage Calculator",
    description: "Free square footage calculator: area of any room or space in square feet and square yards.",
    h1: "Square Footage Calculator",
    sub: "Area in square feet and yards — for flooring, paint, or listing.",
    fields: [
      { key: "length", label: "Length (feet)", type: "number", default: 15, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "width", label: "Width (feet)", type: "number", default: 12, min: 0, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = squareFootage(Number(v.length) || 0, Number(v.width) || 0);
      return [{ label: "Square feet", value: r.squareFeet.toFixed(2), highlight: true }, { label: "Square yards", value: r.squareYards.toFixed(2) }];
    },
    note: "For non-rectangular rooms, split into rectangles and add the results.",
    faq: [
      { q: "How do I measure an irregular room?", a: "Divide the room into rectangles, calculate each, and add them together. For L-shaped rooms, split at the corner." },
      { q: "Square feet vs square yards?", a: "One square yard = 9 square feet. Flooring and carpet are often priced per square yard; most other materials per square foot." },
    ],
    related: ["paint-calculator", "concrete-calculator", "mulch-calculator"],
  },
  {
    slug: "electricity-cost-calculator",
    title: "Electricity Cost Calculator 2026 — Appliance Costs | US Money HQ",
    shortTitle: "Electricity Cost Calculator",
    description: "Free electricity cost calculator: what an appliance costs to run per day or month based on wattage and your rate.",
    h1: "Electricity Cost Calculator",
    sub: "Wattage x hours x your rate = appliance cost.",
    fields: [
      { key: "watts", label: "Appliance wattage", type: "number", default: 1500, min: 1, step: 10, inputMode: "numeric" },
      { key: "hours", label: "Hours used per day", type: "number", default: 4, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "days", label: "Days per month", type: "number", default: 30, min: 1, max: 31, step: 1, inputMode: "numeric" },
      { key: "rate", label: "Electric rate ($/kWh)", type: "number", default: 0.17, min: 0, step: 0.01, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = electricityCost(Number(v.watts) || 0, Number(v.hours) || 0, Number(v.days) || 30, Number(v.rate) || 0);
      return [{ label: "kWh per day", value: r.dailyKwh.toFixed(2) }, { label: "kWh this month", value: r.kwh.toFixed(2) }, moneyRow("Monthly cost", r.cost, true)];
    },
    note: "The average US residential rate is about $0.17/kWh (2026). Check your bill for your exact rate.",
    faq: [
      { q: "How do I find an appliance's wattage?", a: "Check the label or manual — most appliances list watts (e.g., 1,500 for a space heater). If only amps are listed, multiply amps x 120 volts." },
      { q: "Which appliances cost the most?", a: "Heating appliances top the list: space heaters, dryers, water heaters, and ovens. AC costs depend heavily on your climate and thermostat settings." },
    ],
    related: ["gas-cost-calculator", "percentage-calculator", "savings-goal-calculator"],
  },
  {
    slug: "bmi-calculator",
    title: "BMI Calculator 2026 — Body Mass Index | US Money HQ",
    shortTitle: "BMI Calculator",
    description: "Free BMI calculator: your body mass index and weight category from height and weight.",
    h1: "BMI Calculator",
    sub: "Your BMI and weight category, instantly.",
    fields: [
      { key: "weight", label: "Weight (lbs)", type: "number", default: 170, min: 50, step: 1, inputMode: "numeric" },
      { key: "heightFt", label: "Height (feet)", type: "number", default: 5, min: 3, max: 7, step: 1, inputMode: "numeric" },
      { key: "heightIn", label: "Height (inches)", type: "number", default: 9, min: 0, max: 11, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const totalIn = (Number(v.heightFt) || 5) * 12 + (Number(v.heightIn) || 0);
      const r = bmiCalc(Number(v.weight) || 0, totalIn);
      return [{ label: "BMI", value: r.bmi.toFixed(2), highlight: true }, { label: "Category", value: r.category }];
    },
    note: "BMI = 703 x weight(lb) / height(in)^2. A screening tool, not a diagnosis.",
    faq: [
      { q: "Is BMI accurate for athletes?", a: "BMI doesn't distinguish muscle from fat, so very muscular people can show 'overweight' or 'obese' at healthy body-fat levels. Use it as one data point, not the whole picture." },
      { q: "What is a healthy BMI?", a: "18.5-24.9 is the normal range. Below 18.5 is underweight; 25-29.9 overweight; 30+ obese." },
    ],
    related: ["body-fat-calculator", "tdee-calculator", "water-intake-calculator"],
  },
  {
    slug: "simple-interest-calculator",
    title: "Simple Interest Calculator 2026 | US Money HQ",
    shortTitle: "Simple Interest Calculator",
    description: "Free simple interest calculator: interest earned or owed with no compounding, for loans and short-term investments.",
    h1: "Simple Interest Calculator",
    sub: "Principal x rate x time — no compounding.",
    fields: [
      { key: "principal", label: "Principal (USD)", type: "number", default: 5000, min: 0, step: 100, inputMode: "numeric" },
      { key: "rate", label: "Annual rate (%)", type: "number", default: 5, min: 0, step: 0.1, inputMode: "decimal" },
      { key: "years", label: "Time (years)", type: "number", default: 3, min: 0, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = simpleInterest(Number(v.principal) || 0, Number(v.rate) || 0, Number(v.years) || 0);
      return [moneyRow("Interest", r.interest), moneyRow("Total", r.total, true)];
    },
    note: "Simple interest is common on short-term loans and some bonds. Most savings accounts compound.",
    faq: [
      { q: "Simple vs compound interest?", a: "Simple interest is calculated only on the principal. Compound interest earns on both principal and accumulated interest — which grows faster over time. See the compound interest calculator for comparison." },
      { q: "Where is simple interest used?", a: "Personal loans, auto loans with simple-interest terms, and many short-term bonds. Your loan documents state which method applies." },
    ],
    related: ["compound-interest-calculator", "loan-calculator", "cd-calculator"],
  },
  {
    slug: "budget-calculator",
    title: "Budget Calculator 2026 — 50/30/20 Rule | US Money HQ",
    shortTitle: "Budget Calculator",
    description: "Free budget calculator: split your monthly take-home pay into needs, wants, and savings with the 50/30/20 rule.",
    h1: "Budget Calculator",
    sub: "Your take-home pay, split the smart way.",
    fields: [
      { key: "income", label: "Monthly take-home pay (USD)", type: "number", default: 4200, min: 0, step: 50, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = budgetSplit(Number(v.income) || 0);
      return [moneyRow("Needs (50%)", r.needs, true), moneyRow("Wants (30%)", r.wants), moneyRow("Savings & debt (20%)", r.savings)];
    },
    note: "The 50/30/20 rule is a guideline from Senator Elizabeth Warren's budgeting framework.",
    faq: [
      { q: "What counts as needs vs wants?", a: "Needs are essentials: housing, food, utilities, transport, minimum debt payments. Wants are lifestyle: dining out, subscriptions, travel. Savings includes retirement, emergency fund, and extra debt payoff." },
      { q: "My rent is over 50% of take-home — now what?", a: "The rule is a target, not a law. If needs exceed 50%, reduce wants and savings temporarily — then work on income or housing costs to rebalance." },
    ],
    related: ["net-worth-calculator", "savings-goal-calculator", "debt-payoff-calculator"],
  },
  {
    slug: "discount-calculator",
    title: "Discount Calculator 2026 — Sale Price & Savings | US Money HQ",
    shortTitle: "Discount Calculator",
    description: "Free discount calculator: final price after a percent-off sale, and exactly how much you save.",
    h1: "Discount Calculator",
    sub: "Percent off, final price, and savings — instantly.",
    fields: [
      { key: "price", label: "Original price (USD)", type: "number", default: 120, min: 0, step: 1, inputMode: "decimal" },
      { key: "pct", label: "Discount (%)", type: "number", default: 25, min: 0, max: 100, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = discountPrice(Number(v.price) || 0, Number(v.pct) || 0);
      return [moneyRow("You save", r.savings), moneyRow("Final price", r.finalPrice, true)];
    },
    note: "Sale math for anything from shopping carts to contractor quotes.",
    faq: [
      { q: "How do I calculate percent off?", a: "Multiply the original price by the discount percentage (as a decimal), then subtract from the original. Example: $120 x 0.25 = $30 off, final price $90." },
      { q: "Do stacked discounts work that way?", a: "No — a '20% off + 10% off' coupon stack applies sequentially, not as 30%. The second discount applies to the already-discounted price." },
    ],
    related: ["percentage-calculator", "sales-tax-calculator", "tip-calculator"],
  },
  {
    slug: "sales-tax-calculator",
    title: "Sales Tax Calculator 2026 — by State | US Money HQ",
    shortTitle: "Sales Tax Calculator",
    description: "Free sales tax calculator: total price with combined state and local sales tax for any US state.",
    h1: "Sales Tax Calculator",
    sub: "Price plus sales tax — for every state.",
    fields: [
      { key: "price", label: "Item price (USD)", type: "number", default: 499, min: 0, step: 1, inputMode: "decimal" },
      { key: "state", label: "State", type: "select", default: "CA", options: US_STATES.map((s) => ({ value: s, label: s })) },
    ],
    compute: (v) => {
      const price = Number(v.price) || 0;
      const abbr = String(v.state);
      const st = STATES.find((s) => s.abbr === abbr);
      const pct = st ? st.salesTax : 0;
      const r = salesTaxAmount(price, pct);
      return [{ label: "Sales tax rate", value: pct.toFixed(2) + "%" }, moneyRow("Sales tax", r.tax), moneyRow("Total price", r.total, true)];
    },
    note: "Rates are average combined state + local sales tax (2026). Actual rates vary by city and county.",
    faq: [
      { q: "Which states have no sales tax?", a: "Five states have no statewide sales tax: Alaska, Delaware, Montana, New Hampshire, and Oregon. Local taxes may still apply in some areas." },
      { q: "Is online shopping taxed?", a: "Yes — since the Wayfair ruling, most states require online retailers to collect sales tax based on your shipping address, at your local rate." },
    ],
    related: ["discount-calculator", "salary-after-tax-calculator", "percentage-calculator"],
  },
  {
    slug: "inflation-calculator",
    title: "Inflation Calculator 2026 — Purchasing Power | US Money HQ",
    shortTitle: "Inflation Calculator",
    description: "Free inflation calculator: what a dollar amount is worth after years of inflation, and the real loss in purchasing power.",
    h1: "Inflation Calculator",
    sub: "How much your money loses to inflation over time.",
    fields: [
      { key: "amount", label: "Amount (USD)", type: "number", default: 10000, min: 0, step: 100, inputMode: "numeric" },
      { key: "rate", label: "Annual inflation (%)", type: "number", default: 3, min: 0, max: 25, step: 0.1, inputMode: "decimal" },
      { key: "years", label: "Years", type: "number", default: 10, min: 1, max: 50, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = inflationValue(Number(v.amount) || 0, Number(v.rate) || 0, Number(v.years) || 0);
      return [moneyRow("Future value needed", r.futureValue, true), { label: "Purchasing power loss", value: r.lossPct.toFixed(2) + "%" }];
    },
    note: "The Fed targets 2% annual inflation; the long-run US average is about 3%.",
    faq: [
      { q: "How does inflation affect savings?", a: "If your savings earn less than inflation, your purchasing power shrinks. At 3% inflation, $10,000 buys what $7,441 buys today after 10 years." },
      { q: "What causes inflation?", a: "Demand outpacing supply, rising wages and input costs, money supply growth, and supply shocks. The Fed manages it mainly with interest rates." },
    ],
    related: ["compound-interest-calculator", "savings-goal-calculator", "retirement-calculator"],
  },
  {
    slug: "miles-per-gallon-calculator",
    title: "MPG Calculator 2026 — Fuel Economy | US Money HQ",
    shortTitle: "MPG Calculator",
    description: "Free MPG calculator: your real miles per gallon from trip distance and gallons used.",
    h1: "MPG Calculator",
    sub: "Your actual fuel economy, from the pump.",
    fields: [
      { key: "miles", label: "Miles driven", type: "number", default: 320, min: 1, step: 10, inputMode: "numeric" },
      { key: "gallons", label: "Gallons used", type: "number", default: 11.4, min: 0.1, step: 0.1, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = mpgCalc(Number(v.miles) || 0, Number(v.gallons) || 1);
      return [{ label: "Miles per gallon", value: r.mpg.toFixed(1), highlight: true }, { label: "Miles driven", value: r.miles.toFixed(1) }, { label: "Gallons used", value: r.gallons.toFixed(2) }];
    },
    note: "Measure between fill-ups: record miles on the trip odometer and gallons at the pump.",
    faq: [
      { q: "How do I measure my real MPG?", a: "Fill the tank, reset the trip odometer, drive normally, then fill again. Divide miles driven by gallons pumped. Repeat 3-4 tanks for accuracy." },
      { q: "Why is my MPG lower than the sticker?", a: "Sticker estimates come from lab tests. Real-world MPG is typically 10-20% lower due to city driving, traffic, AC use, tire pressure, and driving style." },
    ],
    related: ["gas-cost-calculator", "auto-loan-calculator", "car-affordability-calculator"],
  },
  {
    slug: "rent-vs-buy-calculator",
    title: "Rent vs Buy Calculator 2026 | US Money HQ",
    shortTitle: "Rent vs Buy Calculator",
    description: "Free rent vs buy calculator: compare the total cost of renting vs buying a home over any number of years.",
    h1: "Rent vs Buy Calculator",
    sub: "Renting or buying — the honest 10-year comparison.",
    fields: [
      { key: "rent", label: "Monthly rent (USD)", type: "number", default: 1800, min: 0, step: 50, inputMode: "numeric" },
      { key: "price", label: "Home price (USD)", type: "number", default: 350000, min: 10000, step: 5000, inputMode: "numeric" },
      { key: "down", label: "Down payment (%)", type: "number", default: 20, min: 0, max: 100, step: 0.5, inputMode: "decimal" },
      { key: "rate", label: "Mortgage rate (%)", type: "number", default: 6.5, min: 0, step: 0.01, inputMode: "decimal" },
      { key: "years", label: "Time horizon (years)", type: "number", default: 10, min: 1, max: 30, step: 1, inputMode: "numeric" },
      { key: "rentGrowth", label: "Rent growth (%)", type: "number", default: 3, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "appreciation", label: "Home appreciation (%)", type: "number", default: 3, min: 0, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = rentVsBuy(Number(v.rent) || 0, Number(v.price) || 0, Number(v.down) || 0, Number(v.rate) || 0, Number(v.years) || 10, Number(v.rentGrowth) || 0, Number(v.appreciation) || 0);
      return [
        moneyRow("Buy: monthly cost", r.buyMonthly, true),
        moneyRow("Rent: total paid", r.rentTotal),
        moneyRow("Buy: total cost", r.buyTotal),
        moneyRow("Buy: home value at end", r.homeValue),
      ];
    },
    note: "Buy cost includes mortgage payment, 1% property tax, and 1% maintenance. Renting includes rent growth. Not a substitute for a full financial plan.",
    faq: [
      { q: "Is renting or buying better?", a: "It depends on your time horizon, local prices, and rates. Buying wins when you stay long enough for appreciation and equity to beat transaction costs — often 5-7 years. This calculator shows the raw math for your numbers." },
      { q: "What costs do buyers forget?", a: "Closing costs (2-5% of price), property tax, insurance, maintenance (about 1% of home value per year), HOA fees, and the opportunity cost of the down payment." },
    ],
    related: ["mortgage-calculator", "home-affordability-calculator", "closing-costs-calculator"],
  },
  {
    slug: "401k-calculator",
    title: "401(k) Calculator 2026 — With Employer Match | US Money HQ",
    shortTitle: "401(k) Calculator",
    description: "Free 401(k) calculator: project your balance with contributions and employer match, including match caps.",
    h1: "401(k) Calculator",
    sub: "Your 401(k) with employer match — projected.",
    fields: [
      { key: "current", label: "Current balance (USD)", type: "number", default: 25000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "monthly", label: "Your monthly contribution (USD)", type: "number", default: 500, min: 0, step: 25, inputMode: "numeric" },
      { key: "matchPct", label: "Employer match (%)", type: "number", default: 100, min: 0, max: 100, step: 5, inputMode: "numeric" },
      { key: "capPct", label: "Match cap (% of salary)", type: "number", default: 6, min: 0, max: 20, step: 1, inputMode: "numeric" },
      { key: "salary", label: "Annual salary (USD)", type: "number", default: 85000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "rate", label: "Annual return (%)", type: "number", default: 7, min: 0, max: 25, step: 0.5, inputMode: "decimal" },
      { key: "years", label: "Years to retirement", type: "number", default: 25, min: 1, max: 50, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = retirement401k(Number(v.current) || 0, Number(v.monthly) || 0, Number(v.matchPct) || 0, Number(v.capPct) || 0, Number(v.salary) || 0, Number(v.rate) || 0, Number(v.years) || 25);
      return [moneyRow("Monthly total (incl. match)", r.monthlyTotal), moneyRow("Employer match/mo", r.monthlyMatch), moneyRow("Projected balance", r.balance, true)];
    },
    note: "Assumes monthly compounding. The 2026 401(k) contribution limit is $23,500 ($31,000 if 50+).",
    faq: [
      { q: "Should I max out my employer match first?", a: "Almost always yes — it's an instant 50-100% return on your contribution. Contribute at least enough to capture the full match before other investing." },
      { q: "What return should I assume?", a: "A diversified stock-heavy 401(k) historically returns 7-10% annually. Use 6-7% for a conservative projection." },
    ],
    related: ["retirement-calculator", "compound-interest-calculator", "savings-goal-calculator"],
  },
  {
    slug: "emergency-fund-calculator",
    title: "Emergency Fund Calculator 2026 | US Money HQ",
    shortTitle: "Emergency Fund Calculator",
    description: "Free emergency fund calculator: how much you need saved for 3-12 months of expenses.",
    h1: "Emergency Fund Calculator",
    sub: "Your safety net number, in seconds.",
    fields: [
      { key: "expenses", label: "Monthly expenses (USD)", type: "number", default: 3500, min: 0, step: 50, inputMode: "numeric" },
      { key: "months", label: "Months of coverage", type: "number", default: 6, min: 1, max: 24, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = emergencyFund(Number(v.expenses) || 0, Number(v.months) || 6);
      return [moneyRow("Emergency fund target", r.target, true), { label: "Months covered", value: String(Number(v.months) || 6) }];
    },
    note: "Financial advisors recommend 3-6 months for stable jobs, 6-12 for variable income.",
    faq: [
      { q: "How big should my emergency fund be?", a: "3-6 months of essential expenses is the standard. Freelancers, commission earners, and single-income households should target 6-12 months." },
      { q: "Where should I keep it?", a: "A high-yield savings account — safe, liquid, and earning ~4% in 2026. Don't invest your emergency fund in stocks." },
    ],
    related: ["budget-calculator", "savings-goal-calculator", "net-worth-calculator"],
  },
  {
    slug: "closing-costs-calculator",
    title: "Closing Costs Calculator 2026 | US Money HQ",
    shortTitle: "Closing Costs Calculator",
    description: "Free closing costs calculator: estimate the 2-5% of home price you'll pay at closing, plus total cash needed.",
    h1: "Closing Costs Calculator",
    sub: "What you'll actually pay at the closing table.",
    fields: [
      { key: "price", label: "Home price (USD)", type: "number", default: 350000, min: 10000, step: 5000, inputMode: "numeric" },
      { key: "pct", label: "Closing costs (%)", type: "number", default: 3, min: 0.5, max: 10, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = closingCosts(Number(v.price) || 0, Number(v.pct) || 3);
      return [moneyRow("Estimated closing costs", r.costs, true), moneyRow("Price + closing costs", r.totalCash)];
    },
    note: "Closing costs typically run 2-5% of the purchase price: lender fees, title, appraisal, escrow, and recording.",
    faq: [
      { q: "What is included in closing costs?", a: "Loan origination fees, appraisal, title search and insurance, credit report, escrow prepaids, recording fees, and points. Buyers and sellers split different parts." },
      { q: "Can closing costs be negotiated?", a: "Yes — lenders compete on origination fees, and you can ask the seller to cover some costs. Always compare Loan Estimates from 2-3 lenders." },
    ],
    related: ["mortgage-calculator", "rent-vs-buy-calculator", "home-affordability-calculator"],
  },
  {
    slug: "car-affordability-calculator",
    title: "Car Affordability Calculator 2026 | US Money HQ",
    shortTitle: "Car Affordability Calculator",
    description: "Free car affordability calculator: the max car price you can afford from your monthly payment budget.",
    h1: "Car Affordability Calculator",
    sub: "What car price fits your monthly budget?",
    fields: [
      { key: "payment", label: "Monthly payment budget (USD)", type: "number", default: 450, min: 0, step: 10, inputMode: "numeric" },
      { key: "rate", label: "Loan rate (%)", type: "number", default: 7, min: 0, step: 0.1, inputMode: "decimal" },
      { key: "months", label: "Loan term (months)", type: "select", default: 60, options: [{ value: 36, label: "36 months" }, { value: 48, label: "48 months" }, { value: 60, label: "60 months" }, { value: 72, label: "72 months" }] },
      { key: "down", label: "Down payment (USD)", type: "number", default: 3000, min: 0, step: 500, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = carAffordability(Number(v.payment) || 0, Number(v.rate) || 0, Number(v.months) || 60, Number(v.down) || 0);
      return [moneyRow("Max loan amount", r.loanAmount), moneyRow("Max car price", r.carPrice, true), moneyRow("Total paid (loan only)", r.totalPaid)];
    },
    note: "A common rule: keep total car costs under 15% of monthly take-home pay.",
    faq: [
      { q: "What percentage of income should go to a car?", a: "The 15% rule: total car costs (payment, insurance, fuel, maintenance) under 15% of take-home pay. Many buyers stretch this — the calculator shows what your budget allows." },
      { q: "Is a longer loan term a good idea?", a: "Longer terms lower the payment but add interest and leave you underwater on the loan longer. 60 months is the sweet spot for most buyers; avoid 84-month loans." },
    ],
    related: ["auto-loan-calculator", "gas-cost-calculator", "miles-per-gallon-calculator"],
  },
  {
    slug: "dividend-calculator",
    title: "Dividend Calculator 2026 — Income & Reinvestment | US Money HQ",
    shortTitle: "Dividend Calculator",
    description: "Free dividend calculator: your annual dividend income from a yield, and the power of reinvesting.",
    h1: "Dividend Calculator",
    sub: "Annual income from dividends — reinvested or not.",
    fields: [
      { key: "investment", label: "Investment (USD)", type: "number", default: 50000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "yield", label: "Dividend yield (%)", type: "number", default: 3.5, min: 0, max: 20, step: 0.1, inputMode: "decimal" },
      { key: "years", label: "Years", type: "number", default: 10, min: 1, max: 40, step: 1, inputMode: "numeric" },
      { key: "reinvest", label: "Reinvest dividends", type: "select", default: "yes", options: [{ value: "yes", label: "Yes — DRIP" }, { value: "no", label: "No — take cash" }] },
    ],
    compute: (v) => {
      const r = dividendIncome(Number(v.investment) || 0, Number(v.yield) || 0, Number(v.years) || 10, String(v.reinvest) === "yes");
      return [moneyRow("Annual income", r.annualIncome, true), moneyRow("Monthly income", r.monthlyIncome), moneyRow("Balance after " + (Number(v.years) || 10) + " yrs", r.balanceAfterYears)];
    },
    note: "Assumes the yield stays constant and, with DRIP, dividends buy more shares at the same yield.",
    faq: [
      { q: "What is a good dividend yield?", a: "The S&P 500 average yield is about 1.3-1.5% in 2026. High-yield stocks pay 4-6% but often carry more risk. Yields above 8% deserve extra scrutiny." },
      { q: "Are dividends taxed?", a: "Qualified dividends are taxed at long-term capital gains rates (0/15/20%) depending on income. Non-qualified dividends are taxed as ordinary income." },
    ],
    related: ["compound-interest-calculator", "retirement-calculator", "401k-calculator"],
  },
];

// Planned tools — render automatically via pages/[tool].js once added to TOOLS.
export const FUTURE_TOOLS = ["investment-calculator", "home-equity-calculator", "tax-bracket-calculator"];

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function allToolSlugs(): string[] {
  return TOOLS.map((t) => t.slug);
}

// Internal helpers (kept private to avoid import cycles)
function monthlyPaymentSafe(principal: number, ratePct: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (ratePct === 0) return principal / termMonths;
  const r = ratePct / 100 / 12;
  const p = Math.pow(1 + r, termMonths);
  return (principal * r * p) / (p - 1);
}

function amortSafe(principal: number, ratePct: number, termMonths: number): { interest: number }[] {
  const payment = monthlyPaymentSafe(principal, ratePct, termMonths);
  const r = ratePct / 100 / 12;
  let balance = principal;
  const rows: { interest: number }[] = [];
  for (let m = 1; m <= termMonths; m++) {
    const interest = balance * r;
    balance = Math.max(0, balance - (payment - interest));
    rows.push({ interest });
  }
  return rows;
}
