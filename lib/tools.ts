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
  NO_INCOME_TAX_STATES,
  US_STATES,
} from "./calc.ts";

export const SITE_URL = "https://uscalctools.com"; // TODO: swap to real domain
export const SITE_NAME = "US Calc Tools";
export const SITE_DESC = "Free, fast US financial calculators: mortgage, auto loan, salary after tax, PMI, HELOC, debt payoff and more. No sign-up.";

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
    title: "Mortgage Calculator 2026 — Monthly Payment & Amortization | US Calc Tools",
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
    title: "Auto Loan Calculator 2026 — Car Payment Estimator | US Calc Tools",
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
    title: "Salary After Tax Calculator 2026 — Take-Home Pay by State | US Calc Tools",
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
    title: "Paycheck Calculator 2026 — Take-Home Pay per Paycheck | US Calc Tools",
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
    title: "Debt Payoff Calculator 2026 — How Long to Pay Off Debt | US Calc Tools",
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
    title: "Debt-to-Income Ratio Calculator 2026 | US Calc Tools",
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
    title: "PMI Calculator 2026 — Private Mortgage Insurance Cost | US Calc Tools",
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
    title: "HELOC Calculator 2026 — Home Equity Line of Credit Payments | US Calc Tools",
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
    title: "Refinance Calculator 2026 — Should You Refinance? | US Calc Tools",
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
    title: "Retirement Calculator 2026 — Project Your Nest Egg | US Calc Tools",
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
    title: "Tax Calculator 2026 — Estimate Your Income Tax | US Calc Tools",
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
    title: "Credit Card Payoff Calculator 2026 — Minimum vs Fixed Payment | US Calc Tools",
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
    title: "Child Support Calculator 2026 — Estimate Monthly Support | US Calc Tools",
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
    title: "Concrete Calculator 2026 — Slab Yardage & Bags | US Calc Tools",
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
    title: "TDEE Calculator 2026 — Maintenance, Cut & Bulk Calories | US Calc Tools",
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
    title: "Water Intake Calculator 2026 — How Much Water to Drink | US Calc Tools",
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
    title: "Sleep Calculator 2026 — Best Bedtime by Sleep Cycles | US Calc Tools",
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
    title: "Body Fat Calculator 2026 — US Navy Method | US Calc Tools",
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
    title: "Paint Calculator 2026 — Gallons Needed & Cost | US Calc Tools",
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
    title: "Mulch Calculator 2026 — Cubic Yards & Bags | US Calc Tools",
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
];

// Planned tools — render automatically via pages/[tool].js once added to TOOLS.
export const FUTURE_TOOLS = ["salary-percentile-calculator", "home-affordability-calculator", "gpa-calculator", "due-date-calculator", "grade-calculator"];

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
