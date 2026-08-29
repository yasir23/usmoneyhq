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
  propertyTax,
  capitalGains,
  salaryToHourly,
  amortizationSummary,
  roiCalc,
  markupCalc,
  marginCalc,
  college529,
  homeEquity,
  taxBracketCalc,
  investmentReturn,
  ruleOf72,
  salaryRaise,
  loanWithExtra,
  socialSecurityEstimate,
  debtSnowball,
  leaseVsBuy,
  mortgagePoints,
  pricePerSqft,
  constructionCost,
  calorieDeficit,
  loanCompare,
  savingsRate,
  taxRefundEstimate,
  stockProfit,
  investmentProperty,
  escrowEstimate,
  commissionCalc,
  rmdEstimate,
  savingsBondValue,
  tileNeeds,
  fenceNeeds,
  gravelNeeds,
  carpetNeeds,
  wallpaperNeeds,
  sodNeeds,
  drywallNeeds,
  heartRate,
  percentChange,
  moneyLasts,
  movingCost,
  lifeInsuranceNeeds,
  remodelCost,
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
      { q: "Can I use this for a VA loan?", a: "Yes — VA loans require zero down payment and no PMI, but include a one-time funding fee (2.15-3.3% for most buyers). Set down payment to 0% and ignore the PMI estimate; add the funding fee into the loan amount for a closer number." },
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
      { key: "extra", label: "Extra monthly payment (USD)", type: "number", default: 0, min: 0, step: 10, inputMode: "numeric" },
    ],
    compute: (v) => {
      const price = Number(v.price) || 0;
      const down = Number(v.down) || 0;
      const tradeIn = Number(v.tradeIn) || 0;
      const rate = Number(v.rate) || 0;
      const term = Number(v.term) || 60;
      const principal = Math.max(0, price - down - tradeIn);
      const extra = Number(v.extra) || 0;
      if (extra > 0) {
        const r = loanWithExtra(principal, rate, term, extra);
        return [
          moneyRow("Loan amount", principal),
          moneyRow("Monthly payment (base)", r.payment, true),
          moneyRow("With extra $" + extra + "/mo", r.payment + extra),
          { label: "Payoff time", value: r.years + " yrs " + r.remMonths + " mo" },
          moneyRow("Interest saved", r.interestSaved),
        ];
      }
      const payment = monthlyPaymentSafe(principal, rate, term);
      const totalPaid = payment * term;
      return [
        moneyRow("Loan amount", principal),
        moneyRow("Monthly payment", payment, true),
        moneyRow("Total interest", Math.max(0, totalPaid - principal)),
        moneyRow("Total cost", totalPaid + down + tradeIn),
      ];
    },
    note: "Estimate only. Fees, taxes, and dealer add-ons not included. Add an extra monthly payment to see how much interest you save.",
    faq: [
      { q: "Should I choose a 60-month or 72-month car loan?", a: "Shorter terms (48-60 months) typically have lower rates and cost less overall. 72-84 month terms lower the monthly payment but increase total interest and the risk of being upside-down." },
      { q: "What is a good auto loan rate in 2026?", a: "Rates depend on your credit score, the lender, and whether the loan is new or used. Pre-qualify with multiple lenders before visiting the dealership." },
      { q: "Does paying extra each month help?", a: "Yes — extra principal payments shorten the loan and slash interest. $50/month extra on a $30k loan at 7% saves about $530 in interest and cuts 5 months off the term; $100/month saves over $1,000." },
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
      { q: "Snowball or avalanche method?", a: "Avalanche (highest APR first) saves the most interest. Snowball (smallest balance first, the Dave Ramsey approach) builds momentum. Both beat minimum payments — pick the one you'll stick with." },
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
      { q: "Do credit card payments count in DTI?", a: "Yes — lenders include the minimum monthly payment on every open card, even at a $0 balance. Cards with large balances can push your DTI over the limit even with a solid income." },
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
      { q: "How much cement and ballast do I need?", a: "A common mix is 1 part cement to 4-5 parts ballast by volume. For 1 cubic yard of concrete, that's roughly 5-6 bags of 94 lb Portland cement plus 1 ton of ballast. Ready-mix is usually cheaper for pours over half a yard." },
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
      { q: "What's the difference between BMR and TDEE?", a: "BMR is the calories your body burns at complete rest — just keeping you alive. TDEE adds everything else: walking, workouts, digestion. Your BMR is roughly 60-70% of TDEE. This calculator shows both." },
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
      { q: "What time should I go to bed?", a: "Count back 5-6 sleep cycles (90 minutes each) from your wake time. Waking at 7:00 AM means bedtime between 10:00 PM and 11:30 PM — this calculator gives you the exact times." },
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
      { q: "Navy vs Army body fat method?", a: "The US Navy tape method (used here) measures neck, waist, and hips. The Army method uses height plus neck and waist circumference with age-adjusted tables. Results differ by a few percent — both are within ±3-4% of a DEXA scan." },
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
      { q: "How much house can I afford on $100k salary?", a: "On $100k/year with no other debt and 20% down at a 6.5% rate, the 28% rule puts your max monthly payment around $2,333 — roughly a $370k home. At $150k, that scales to about $555k; at $200k, about $740k. Run your real numbers above — debt, down payment, and rate move the answer a lot." },
      { q: "How much house can I afford with a $20k down payment?", a: "A $20k down payment is 10% on a $200k home or about 6% on a $320k home. Smaller down payments mean PMI and higher monthly costs — run the numbers in this calculator and the PMI calculator together to see the true payment." },
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
      { q: "How does this work with points instead of percentages?", a: "Same math, different units: if your course uses points, use your current points and the exam's point value as the weight. A 50-point exam = 50% weight in a 100-point course." },
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
      { q: "Is compound interest taxable?", a: "Yes — interest from savings accounts, CDs, and bonds is taxed as ordinary income in the year it's earned, even if reinvested. Tax-advantaged accounts (401k, IRA, 529) defer or avoid that tax." },
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
      { q: "What are CD rates in 2026?", a: "Short-term CDs (6-12 months) are tracking the Fed's rate path, generally 3-4% APY in 2026. Longer terms (2-5 years) pay similar or slightly less when the market expects cuts. Always lock the best APY you can find — rates differ by 1%+ between banks." },
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
      { q: "Is this before or after taxes?", a: "Gross pay before taxes. For take-home, run the same salary through the salary after tax calculator — federal, FICA, and state deductions typically leave 70-80% of gross, depending on your state." },
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
      { q: "Does age affect BMI?", a: "The standard BMI formula uses only height and weight — age and gender are not part of the calculation. Healthy ranges are the same for all adults, though doctors sometimes adjust interpretation for older adults and children." },
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
      { q: "How much rent can I afford?", a: "With the 50/30/20 rule, rent belongs in the 50% needs bucket along with utilities and groceries. Many landlords use 30% of gross income as the affordability cap — at $60k/year that's $1,500/month." },
      { q: "How much do I need to make?", a: "Work the rule backward: multiply your monthly needs by 2 for take-home income. If rent + utilities + groceries + minimums total $3,000, you need about $6,000/month take-home ($100k+/year gross) to stay at 50/30/20." },
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
      { q: "Is sales tax applied before or after the discount?", a: "Almost always after — tax is charged on the discounted price you actually pay. A $100 item at 25% off with 8% tax: $75 x 1.08 = $81. Charge the price after discount first, then add tax." },
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
  {
    slug: "property-tax-calculator",
    title: "Property Tax Calculator 2026 — by State | US Money HQ",
    shortTitle: "Property Tax Calculator",
    description: "Free property tax calculator: annual and monthly property tax for any US state using average effective rates.",
    h1: "Property Tax Calculator",
    sub: "Annual and monthly property tax — by state.",
    fields: [
      { key: "value", label: "Home value (USD)", type: "number", default: 350000, min: 10000, step: 5000, inputMode: "numeric" },
      { key: "state", label: "State", type: "select", default: "TX", options: US_STATES.map((s) => ({ value: s, label: s })) },
    ],
    compute: (v) => {
      const value = Number(v.value) || 0;
      const abbr = String(v.state);
      const st = STATES.find((s) => s.abbr === abbr);
      const pct = st ? st.propTaxPct : 1;
      const r = propertyTax(value, pct);
      return [{ label: "Effective rate", value: pct.toFixed(2) + "%" }, moneyRow("Annual property tax", r.annual, true), moneyRow("Monthly (escrow)", r.monthly)];
    },
    note: "Uses average effective property tax rates per state (2026). Actual rates vary by county and exemptions (homestead, senior, veteran).",
    faq: [
      { q: "Which states have the highest property taxes?", a: "New Jersey, Illinois, Connecticut, and New Hampshire have the highest effective rates (2%+). Hawaii, Alabama, and Colorado are among the lowest." },
      { q: "Is property tax paid monthly or yearly?", a: "Most homeowners pay monthly through escrow as part of the mortgage payment; the lender pays the county annually. Without a mortgage, you pay the county directly, usually annually or semi-annually." },
    ],
    related: ["mortgage-calculator", "home-affordability-calculator", "closing-costs-calculator"],
  },
  {
    slug: "capital-gains-calculator",
    title: "Capital Gains Tax Calculator 2026 | US Money HQ",
    shortTitle: "Capital Gains Tax Calculator",
    description: "Free capital gains tax calculator: short-term vs long-term gains tax and your net profit after taxes.",
    h1: "Capital Gains Tax Calculator",
    sub: "Short-term or long-term — what you keep after tax.",
    fields: [
      { key: "gain", label: "Capital gain (USD)", type: "number", default: 20000, min: 0, step: 500, inputMode: "numeric" },
      { key: "income", label: "Other taxable income (USD)", type: "number", default: 60000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "holding", label: "Holding period", type: "select", default: "long", options: [{ value: "long", label: "Long-term (1+ year)" }, { value: "short", label: "Short-term (under 1 year)" }] },
    ],
    compute: (v) => {
      const r = capitalGains(Number(v.gain) || 0, Number(v.income) || 0, String(v.holding) === "short" ? "short" : "long");
      return [moneyRow("Tax on gain", r.tax), { label: "Effective rate", value: r.effectiveRate.toFixed(2) + "%" }, moneyRow("Net after tax", r.net, true)];
    },
    note: "2026 long-term rates: 0% up to $47,025 single, 15% to $518,900, 20% above. Short-term gains are taxed as ordinary income.",
    faq: [
      { q: "What is the 0% capital gains bracket?", a: "For 2026, single filers with taxable income up to $47,025 pay 0% on long-term gains. This can be a powerful tax-planning window for low-income years." },
      { q: "How do I avoid capital gains tax?", a: "Hold assets 1+ years for the lower long-term rates, use tax-advantaged accounts (401k/IRA), and consider tax-loss harvesting — selling losers to offset gains." },
      { q: "Are gains taxed at the state level too?", a: "Yes — most states tax capital gains as ordinary income on top of federal. California and New Jersey tax all gains at your income rate; nine states with no income tax (TX, FL, NV, etc.) don't tax gains at all." },
    ],
    related: ["tax-calculator", "dividend-calculator", "compound-interest-calculator"],
  },
  {
    slug: "salary-to-hourly-calculator",
    title: "Salary to Hourly Calculator 2026 | US Money HQ",
    shortTitle: "Salary to Hourly Calculator",
    description: "Free salary to hourly calculator: what your annual salary equals per hour, week, and month.",
    h1: "Salary to Hourly Calculator",
    sub: "Your annual salary, translated to an hourly rate.",
    fields: [
      { key: "salary", label: "Annual salary (USD)", type: "number", default: 65000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "hours", label: "Hours per week", type: "number", default: 40, min: 1, max: 100, step: 1, inputMode: "numeric" },
      { key: "weeks", label: "Weeks worked per year", type: "number", default: 52, min: 1, max: 52, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = salaryToHourly(Number(v.salary) || 0, Number(v.hours) || 40, Number(v.weeks) || 52);
      return [{ label: "Hourly rate", value: "$" + r.hourly.toFixed(2), highlight: true }, moneyRow("Weekly (gross)", r.weekly), moneyRow("Monthly (gross)", r.monthly)];
    },
    note: "Gross figures before taxes. The $65k salary example at 40h/52w = $31.25/hr.",
    faq: [
      { q: "How do I convert salary to hourly?", a: "Divide annual salary by (hours per week x weeks per year). $65,000 / (40 x 52) = $31.25/hour. Salaried exempt employees often work more than 40 hours, lowering the real hourly rate." },
      { q: "Is salary or hourly better?", a: "Salary offers stability and benefits; hourly offers overtime pay. Compare total compensation — including benefits worth 20-30% of salary — not just the headline number." },
    ],
    related: ["hourly-to-salary-calculator", "salary-after-tax-calculator", "overtime-calculator"],
  },
  {
    slug: "amortization-schedule-calculator",
    title: "Amortization Schedule Calculator 2026 — Payment & Interest | US Money HQ",
    shortTitle: "Amortization Schedule Calculator",
    description: "Free amortization schedule calculator: monthly payment, total interest, and payoff summary for any loan.",
    h1: "Amortization Schedule Calculator",
    sub: "The full cost of your loan, in plain numbers.",
    fields: [
      { key: "amount", label: "Loan amount (USD)", type: "number", default: 250000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "rate", label: "Interest rate (annual %)", type: "number", default: 6.5, min: 0, step: 0.01, inputMode: "decimal" },
      { key: "years", label: "Loan term (years)", type: "select", default: 30, options: [{ value: 10, label: "10 years" }, { value: 15, label: "15 years" }, { value: 20, label: "20 years" }, { value: 30, label: "30 years" }] },
      { key: "extra", label: "Extra monthly payment (USD)", type: "number", default: 0, min: 0, step: 25, inputMode: "numeric" },
    ],
    compute: (v) => {
      const extra = Number(v.extra) || 0;
      if (extra > 0) {
        const r = loanWithExtra(Number(v.amount) || 0, Number(v.rate) || 0, (Number(v.years) || 30) * 12, extra);
        return [moneyRow("Monthly payment (base)", r.payment, true), { label: "Payoff time", value: r.years + " yrs " + r.remMonths + " mo" }, moneyRow("Total interest", r.totalInterest), moneyRow("Interest saved", r.interestSaved)];
      }
      const r = amortizationSummary(Number(v.amount) || 0, Number(v.rate) || 0, Number(v.years) || 30);
      return [moneyRow("Monthly payment", r.payment, true), moneyRow("Total interest", r.totalInterest), moneyRow("Total paid", r.totalPaid), { label: "Payoff", value: r.years + " years (" + r.months + " months)" }];
    },
    note: "Standard amortization: equal payments, interest front-loaded.",
    faq: [
      { q: "What is an amortization schedule?", a: "It's the monthly breakdown of principal and interest over a loan's life. Early payments are mostly interest; later payments shift toward principal." },
      { q: "How can I pay less interest?", a: "Shorter terms and extra principal payments slash total interest. Even one extra payment per year can shave years off a 30-year mortgage." },
    ],
    related: ["mortgage-calculator", "loan-calculator", "simple-interest-calculator"],
  },
  {
    slug: "roi-calculator",
    title: "ROI Calculator 2026 — Return on Investment | US Money HQ",
    shortTitle: "ROI Calculator",
    description: "Free ROI calculator: return on investment and annualized return for any business or investment.",
    h1: "ROI Calculator",
    sub: "ROI and annualized return — instantly.",
    fields: [
      { key: "investment", label: "Amount invested (USD)", type: "number", default: 10000, min: 0, step: 500, inputMode: "numeric" },
      { key: "gain", label: "Total gain / profit (USD)", type: "number", default: 2500, min: 0, step: 100, inputMode: "numeric" },
      { key: "years", label: "Holding period (years)", type: "number", default: 3, min: 1, max: 50, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = roiCalc(Number(v.investment) || 0, Number(v.gain) || 0, Number(v.years) || 1);
      return [{ label: "ROI", value: r.roi.toFixed(2) + "%", highlight: true }, { label: "Annualized return", value: r.annualized.toFixed(2) + "%" }];
    },
    note: "Annualized ROI lets you compare investments held for different lengths of time.",
    faq: [
      { q: "ROI vs annualized ROI?", a: "ROI is total return over the whole period. Annualized ROI is the equivalent yearly return — essential when comparing a 1-year trade to a 5-year holding." },
      { q: "What is a good ROI?", a: "For most investments, 7-10% annualized is a solid long-term target. Businesses often expect higher: 20%+ on marketing spend." },
    ],
    related: ["investment-calculator", "compound-interest-calculator", "dividend-calculator"],
  },
  {
    slug: "markup-calculator",
    title: "Markup Calculator 2026 — Price From Cost | US Money HQ",
    shortTitle: "Markup Calculator",
    description: "Free markup calculator: set your selling price from cost and markup percentage, and see your profit.",
    h1: "Markup Calculator",
    sub: "Cost + markup = price, and your profit.",
    fields: [
      { key: "cost", label: "Cost (USD)", type: "number", default: 50, min: 0, step: 1, inputMode: "decimal" },
      { key: "markup", label: "Markup (%)", type: "number", default: 40, min: 0, max: 1000, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = markupCalc(Number(v.cost) || 0, Number(v.markup) || 0);
      return [moneyRow("Profit", r.profit), moneyRow("Selling price", r.price, true)];
    },
    note: "Markup % is on cost. Margin % is on price — see the margin calculator for that view.",
    faq: [
      { q: "Markup vs margin — what's the difference?", a: "Markup is profit divided by cost. Margin is profit divided by price. A 50% markup equals a 33% margin — they sound similar but are very different numbers." },
      { q: "What's a typical retail markup?", a: "Apparel often runs 50-100% markup, groceries 10-20%, electronics 10-30%. Service businesses commonly target 100%+ on labor." },
    ],
    related: ["margin-calculator", "percentage-calculator", "discount-calculator"],
  },
  {
    slug: "margin-calculator",
    title: "Margin Calculator 2026 — Price From Margin | US Money HQ",
    shortTitle: "Margin Calculator",
    description: "Free margin calculator: set your selling price from a target profit margin and see your profit per unit.",
    h1: "Margin Calculator",
    sub: "Price for your target margin — and the profit.",
    fields: [
      { key: "cost", label: "Cost (USD)", type: "number", default: 50, min: 0, step: 1, inputMode: "decimal" },
      { key: "margin", label: "Target margin (%)", type: "number", default: 33, min: 0, max: 95, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = marginCalc(Number(v.cost) || 0, Number(v.margin) || 0);
      return [moneyRow("Selling price", r.price, true), moneyRow("Profit", r.profit)];
    },
    note: "Margin % is profit as a share of price, not cost.",
    faq: [
      { q: "How do I price for a 33% margin?", a: "Divide cost by (1 - 0.33). A $50 item needs a $74.63 price for 33% margin. The profit ($24.63) is one-third of the price." },
      { q: "What margin should a small business target?", a: "20-40% gross margin is common across industries; SaaS runs 70-90%. Know your overhead to find the margin that keeps you profitable." },
    ],
    related: ["markup-calculator", "percentage-calculator", "roi-calculator"],
  },
  {
    slug: "529-calculator",
    title: "529 College Savings Calculator 2026 | US Money HQ",
    shortTitle: "529 Calculator",
    description: "Free 529 calculator: project your college savings balance and see the shortfall vs target college costs.",
    h1: "529 College Savings Calculator",
    sub: "Your college fund, projected against the cost.",
    fields: [
      { key: "current", label: "Current 529 balance (USD)", type: "number", default: 10000, min: 0, step: 500, inputMode: "numeric" },
      { key: "monthly", label: "Monthly contribution (USD)", type: "number", default: 250, min: 0, step: 10, inputMode: "numeric" },
      { key: "rate", label: "Expected annual return (%)", type: "number", default: 6, min: 0, max: 25, step: 0.5, inputMode: "decimal" },
      { key: "years", label: "Years until college", type: "number", default: 10, min: 1, max: 25, step: 1, inputMode: "numeric" },
      { key: "cost", label: "Estimated college cost (USD)", type: "number", default: 120000, min: 0, step: 5000, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = college529(Number(v.current) || 0, Number(v.monthly) || 0, Number(v.rate) || 0, Number(v.years) || 10, Number(v.cost) || 0);
      return [moneyRow("Projected balance", r.balance, true), moneyRow("Estimated cost", r.cost), moneyRow("Shortfall (if any)", r.shortfall)];
    },
    note: "Average 4-year public college cost is roughly $110k-$130k today (tuition, room, board). Private schools run higher.",
    faq: [
      { q: "Is a 529 worth it?", a: "Earnings grow tax-free and withdrawals for qualified education expenses are tax-free — plus many states offer a tax deduction on contributions. It's the best college savings vehicle for most families." },
      { q: "What return should I assume?", a: "Age-based 529 portfolios blend stocks and bonds. Expect 5-7% for long horizons, less as the child nears college." },
      { q: "Does my state give a 529 tax deduction?", a: "Most states offer a state income tax deduction or credit for 529 contributions — 30+ states do, with limits usually between $5k-$20k per year per beneficiary. A few (like California and New Jersey) don't, but you can still use any state's plan." },
    ],
    related: ["savings-goal-calculator", "compound-interest-calculator", "net-worth-calculator"],
  },
  {
    slug: "home-equity-calculator",
    title: "Home Equity Calculator 2026 — Equity & LTV | US Money HQ",
    shortTitle: "Home Equity Calculator",
    description: "Free home equity calculator: your equity and loan-to-value ratio — the key numbers for HELOCs and refinancing.",
    h1: "Home Equity Calculator",
    sub: "Equity and LTV — the numbers lenders use.",
    fields: [
      { key: "value", label: "Home value (USD)", type: "number", default: 400000, min: 10000, step: 5000, inputMode: "numeric" },
      { key: "balance", label: "Mortgage balance (USD)", type: "number", default: 280000, min: 0, step: 5000, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = homeEquity(Number(v.value) || 0, Number(v.balance) || 0);
      return [moneyRow("Home equity", r.equity, true), { label: "Loan-to-value (LTV)", value: r.ltv.toFixed(1) + "%" }];
    },
    note: "Lenders typically require LTV below 80% for HELOCs and cash-out refinances.",
    faq: [
      { q: "How much equity can I borrow against?", a: "Most lenders cap your combined loan-to-value at 80-85%, meaning you keep 15-20% equity in the home. On a $400k home with a $280k mortgage, you could borrow roughly $40k-$60k more." },
      { q: "HELOC vs cash-out refinance?", a: "A HELOC is a revolving line with variable rates and no upfront cash. A cash-out refi replaces your mortgage at a new fixed rate. HELOCs win for flexibility; refis win if your current rate is high." },
    ],
    related: ["heloc-calculator", "mortgage-calculator", "refinance-calculator"],
  },
  {
    slug: "tax-bracket-calculator",
    title: "Tax Bracket Calculator 2026 — Marginal & Effective | US Money HQ",
    shortTitle: "Tax Bracket Calculator",
    description: "Free tax bracket calculator: your marginal bracket, effective tax rate, and total federal income tax.",
    h1: "Tax Bracket Calculator",
    sub: "Which bracket you're in — and your real effective rate.",
    fields: [
      { key: "income", label: "Taxable income (USD)", type: "number", default: 85000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "filing", label: "Filing status", type: "select", default: "single", options: [{ value: "single", label: "Single" }, { value: "married", label: "Married filing jointly" }] },
    ],
    compute: (v) => {
      const r = taxBracketCalc(Number(v.income) || 0, String(v.filing) === "married" ? "married" : "single");
      return [moneyRow("Total federal tax", r.tax, true), { label: "Marginal bracket", value: r.marginal + "%" }, { label: "Effective rate", value: r.effective.toFixed(2) + "%" }, moneyRow("Taxable after std. deduction", r.taxable)];
    },
    note: "2026 federal brackets, single and married, with standard deduction. Marginal ≠ effective — only income above each threshold is taxed at the higher rate.",
    faq: [
      { q: "What's the difference between marginal and effective rate?", a: "Marginal is the rate on your LAST dollar (e.g., 22%). Effective is total tax divided by total income — usually much lower, because lower brackets are taxed at lower rates." },
      { q: "Will a raise push me into a higher bracket and cost me money?", a: "No — brackets are marginal. Only the portion above the threshold is taxed higher. A raise always increases take-home, never decreases it." },
    ],
    related: ["tax-calculator", "salary-after-tax-calculator", "capital-gains-calculator"],
  },
  {
    slug: "investment-calculator",
    title: "Investment Calculator 2026 — Growth Projection | US Money HQ",
    shortTitle: "Investment Calculator",
    description: "Free investment calculator: project your portfolio's future value with monthly contributions and compound growth.",
    h1: "Investment Calculator",
    sub: "What your investments could be worth — projected.",
    fields: [
      { key: "initial", label: "Initial investment (USD)", type: "number", default: 10000, min: 0, step: 500, inputMode: "numeric" },
      { key: "monthly", label: "Monthly contribution (USD)", type: "number", default: 300, min: 0, step: 25, inputMode: "numeric" },
      { key: "rate", label: "Expected annual return (%)", type: "number", default: 7, min: 0, max: 30, step: 0.5, inputMode: "decimal" },
      { key: "years", label: "Years", type: "number", default: 20, min: 1, max: 50, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = investmentReturn(Number(v.initial) || 0, Number(v.monthly) || 0, Number(v.rate) || 0, Number(v.years) || 20);
      return [moneyRow("Projected value", r.balance, true), moneyRow("You invested", r.invested), moneyRow("Growth", r.growth)];
    },
    note: "Assumes monthly compounding at a constant return. The S&P 500 has averaged about 10% historically (7% after inflation).",
    faq: [
      { q: "What return should I use?", a: "For a diversified stock portfolio, 7% is a common conservative real return (after inflation). Use 4-5% for bond-heavy portfolios and 10% for optimistic stock-only cases." },
      { q: "Why does time matter so much?", a: "Compound growth is exponential. $300/month at 7% grows to ~$158k in 20 years but ~$365k in 30 — the last decade does more than all the earlier ones combined." },
      { q: "What if I increase my contributions over time?", a: "Raising contributions with your income accelerates growth dramatically. If $300/month grows to ~$158k in 20 years at 7%, increasing by just $25/month every year reaches roughly $215k — an extra $57k from gradual raises." },
    ],
    related: ["compound-interest-calculator", "retirement-calculator", "401k-calculator"],
  },
  {
    slug: "rule-of-72-calculator",
    title: "Rule of 72 Calculator 2026 — Years to Double | US Money HQ",
    shortTitle: "Rule of 72 Calculator",
    description: "Free Rule of 72 calculator: how many years it takes your money to double at any annual return rate.",
    h1: "Rule of 72 Calculator",
    sub: "Years to double your money — instantly.",
    fields: [
      { key: "rate", label: "Annual return (%)", type: "number", default: 7, min: 0.1, max: 30, step: 0.1, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = ruleOf72(Number(v.rate) || 7);
      return [{ label: "Years to double", value: r.years.toFixed(1), highlight: true }];
    },
    note: "72 ÷ rate = years to double. It's an approximation — accurate within a year for rates of 6-10%.",
    faq: [
      { q: "How does the Rule of 72 work?", a: "Divide 72 by your annual return. At 8%, your money doubles every 9 years (72/8). At 4%, every 18 years. It reveals how powerful higher returns are." },
      { q: "Is it exact?", a: "It's a close approximation for typical rates. For 8%, the true doubling time is 9.01 years — the rule is within 1%." },
    ],
    related: ["compound-interest-calculator", "investment-calculator", "cd-calculator"],
  },
  {
    slug: "salary-raise-calculator",
    title: "Salary Raise Calculator 2026 — New Pay | US Money HQ",
    shortTitle: "Salary Raise Calculator",
    description: "Free salary raise calculator: your new salary after a raise, plus the monthly and weekly difference.",
    h1: "Salary Raise Calculator",
    sub: "What your raise means per paycheck.",
    fields: [
      { key: "salary", label: "Current salary (USD)", type: "number", default: 65000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "raise", label: "Raise (%)", type: "number", default: 5, min: 0, max: 100, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = salaryRaise(Number(v.salary) || 0, Number(v.raise) || 0);
      return [moneyRow("New salary", r.newSalary, true), moneyRow("More per month", r.monthlyDelta), moneyRow("More per week", r.weeklyDelta)];
    },
    note: "Gross figures. A 5% raise on $65k adds $3,250 a year — about $125 per bi-weekly paycheck before taxes.",
    faq: [
      { q: "What is a typical raise?", a: "3-5% is the standard merit increase range. Job switchers often negotiate 10-20% more. If your raise is below inflation, your real pay is falling." },
      { q: "Should I negotiate?", a: "Almost always. Research comparable salaries, cite specific contributions, and ask — employees who negotiate typically gain 5-10% more than the first offer." },
    ],
    related: ["salary-after-tax-calculator", "hourly-to-salary-calculator", "salary-percentile-calculator"],
  },
  {
    slug: "social-security-calculator",
    title: "Social Security Calculator 2026 — Benefit Estimate | US Money HQ",
    shortTitle: "Social Security Calculator",
    description: "Free Social Security calculator: estimate your monthly retirement benefit based on income and claiming age.",
    h1: "Social Security Calculator",
    sub: "Your estimated monthly benefit — clearly an estimate.",
    fields: [
      { key: "income", label: "Current annual income (USD)", type: "number", default: 75000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "age", label: "Your age now", type: "number", default: 45, min: 18, max: 85, step: 1, inputMode: "numeric" },
      { key: "retireAge", label: "Claiming age", type: "select", default: 67, options: [{ value: 62, label: "62 (early)" }, { value: 65, label: "65" }, { value: 67, label: "67 (full retirement)" }, { value: 70, label: "70 (delayed)" }] },
    ],
    compute: (v) => {
      const r = socialSecurityEstimate(Number(v.age) || 45, Number(v.retireAge) || 67, Number(v.income) || 0);
      return [moneyRow("Est. monthly benefit", r.monthly, true), moneyRow("Est. annual benefit", r.annual), moneyRow("PIA (full retirement age)", r.pia)];
    },
    note: "Rough estimate using 2026 bend points and today's income. Actual benefits use your 35 highest-earning years — check ssa.gov for your real statement.",
    faq: [
      { q: "When should I claim Social Security?", a: "Full retirement age is 67 for anyone born after 1960. Claiming at 62 cuts benefits ~30% permanently; waiting to 70 adds ~8% per year. The right choice depends on your health, savings, and lifespan expectations." },
      { q: "Is my benefit taxed?", a: "Up to 85% of Social Security benefits can be taxed if your combined income exceeds $25k (single) or $32k (married). About 40% of beneficiaries owe tax on some portion." },
    ],
    related: ["retirement-calculator", "401k-calculator", "investment-calculator"],
  },
  {
    slug: "debt-snowball-calculator",
    title: "Debt Snowball Calculator 2026 — Payoff Plan | US Money HQ",
    shortTitle: "Debt Snowball Calculator",
    description: "Free debt snowball calculator: order your debts, see months to debt-free, and total interest paid — snowball or avalanche method.",
    h1: "Debt Snowball Calculator",
    sub: "Your debt-free date, method by method.",
    fields: [
      { key: "budget", label: "Monthly debt budget (USD)", type: "number", default: 700, min: 0, step: 25, inputMode: "numeric" },
      { key: "method", label: "Method", type: "select", default: "snowball", options: [{ value: "snowball", label: "Snowball (smallest first)" }, { value: "avalanche", label: "Avalanche (highest APR first)" }] },
      { key: "b1", label: "Debt 1 balance (USD)", type: "number", default: 1500, min: 0, step: 50, inputMode: "numeric" },
      { key: "a1", label: "Debt 1 APR (%)", type: "number", default: 22, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "m1", label: "Debt 1 min payment", type: "number", default: 60, min: 0, step: 5, inputMode: "numeric" },
      { key: "b2", label: "Debt 2 balance (USD)", type: "number", default: 5000, min: 0, step: 100, inputMode: "numeric" },
      { key: "a2", label: "Debt 2 APR (%)", type: "number", default: 18, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "m2", label: "Debt 2 min payment", type: "number", default: 150, min: 0, step: 5, inputMode: "numeric" },
      { key: "b3", label: "Debt 3 balance (USD)", type: "number", default: 12000, min: 0, step: 100, inputMode: "numeric" },
      { key: "a3", label: "Debt 3 APR (%)", type: "number", default: 7, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "m3", label: "Debt 3 min payment", type: "number", default: 250, min: 0, step: 5, inputMode: "numeric" },
    ],
    compute: (v) => {
      const debts = [];
      for (const i of [1, 2, 3]) {
        const bal = Number(v["b" + i]) || 0;
        if (bal > 0) debts.push({ name: "Debt " + i, balance: bal, apr: Number(v["a" + i]) || 0, min: Number(v["m" + i]) || 0 });
      }
      const r = debtSnowball(debts, Number(v.budget) || 0, String(v.method) === "avalanche" ? "avalanche" : "snowball");
      return [{ label: "Debt-free in", value: r.years > 0 ? r.years + " yrs " + r.remMonths + " mo" : r.months + " months", highlight: true }, moneyRow("Total interest paid", r.totalInterest), { label: "Method", value: String(v.method) === "avalanche" ? "Avalanche" : "Snowball" }];
    },
    note: "Snowball pays smallest balances first (momentum); avalanche pays highest APR first (least interest). Both use every freed minimum toward the next debt.",
    faq: [
      { q: "Snowball or avalanche — which is better?", a: "Avalanche saves the most money; snowball keeps you motivated. Studies show both work — the best method is the one you'll actually stick with." },
      { q: "Should my monthly budget exceed the minimums?", a: "Yes — the gap between your budget and total minimums is what accelerates payoff. Every extra dollar goes to the current target debt." },
    ],
    related: ["debt-payoff-calculator", "credit-card-payoff-calculator", "budget-calculator"],
  },
  {
    slug: "lease-vs-buy-calculator",
    title: "Lease vs Buy Calculator 2026 — Car | US Money HQ",
    shortTitle: "Lease vs Buy Calculator",
    description: "Free lease vs buy calculator: compare total cost of leasing vs financing a car over the lease term.",
    h1: "Lease vs Buy Calculator",
    sub: "Lease or finance — the honest comparison.",
    fields: [
      { key: "price", label: "Car price (USD)", type: "number", default: 35000, min: 1000, step: 500, inputMode: "numeric" },
      { key: "leaseMonths", label: "Lease term (months)", type: "select", default: 36, options: [{ value: 24, label: "24 months" }, { value: 36, label: "36 months" }, { value: 48, label: "48 months" }] },
      { key: "leasePayment", label: "Monthly lease payment (USD)", type: "number", default: 420, min: 0, step: 10, inputMode: "numeric" },
      { key: "residual", label: "Residual value (%)", type: "number", default: 55, min: 0, max: 90, step: 1, inputMode: "numeric" },
      { key: "rate", label: "Finance rate (%)", type: "number", default: 7, min: 0, step: 0.1, inputMode: "decimal" },
      { key: "buyMonths", label: "Finance term (months)", type: "select", default: 60, options: [{ value: 48, label: "48 months" }, { value: 60, label: "60 months" }, { value: 72, label: "72 months" }] },
      { key: "down", label: "Down payment (USD)", type: "number", default: 3000, min: 0, step: 500, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = leaseVsBuy(Number(v.price) || 0, Number(v.leaseMonths) || 36, Number(v.leasePayment) || 0, Number(v.residual) || 55, Number(v.rate) || 7, Number(v.buyMonths) || 60, Number(v.down) || 0);
      return [moneyRow("Lease total (over term)", r.leaseTotal, true), moneyRow("Buy total (over term)", r.buyTotal), moneyRow("Buy monthly payment", r.buyPayment), { label: "Car residual value", value: "$" + r.residual.toLocaleString() }];
    },
    note: "Compares cash out over the lease term only. Leasing lets you walk away after the term; buying leaves you an asset worth the residual.",
    faq: [
      { q: "Is leasing cheaper than buying?", a: "Monthly payments are usually lower, but you own nothing at the end. Over a 36-month window, leasing often costs less cash — over 5-10 years, buying almost always wins because you keep the car." },
      { q: "What is a good residual value?", a: "55-60% for a 36-month lease is typical. Higher residual = lower payment. Negotiate the cap cost (price) hard — that's what drives the payment." },
    ],
    related: ["auto-loan-calculator", "car-affordability-calculator", "gas-cost-calculator"],
  },
  {
    slug: "mortgage-points-calculator",
    title: "Mortgage Points Calculator 2026 — Buy Down | US Money HQ",
    shortTitle: "Mortgage Points Calculator",
    description: "Free mortgage points calculator: cost of buying discount points, your reduced rate, monthly savings, and break-even.",
    h1: "Mortgage Points Calculator",
    sub: "Should you buy down your rate?",
    fields: [
      { key: "amount", label: "Loan amount (USD)", type: "number", default: 300000, min: 10000, step: 5000, inputMode: "numeric" },
      { key: "rate", label: "Interest rate (%)", type: "number", default: 6.5, min: 0, step: 0.01, inputMode: "decimal" },
      { key: "points", label: "Points to buy", type: "number", default: 1, min: 0, max: 4, step: 0.125, inputMode: "decimal" },
      { key: "years", label: "Loan term (years)", type: "select", default: 30, options: [{ value: 15, label: "15 years" }, { value: 30, label: "30 years" }] },
    ],
    compute: (v) => {
      const r = mortgagePoints(Number(v.amount) || 0, Number(v.rate) || 0, Number(v.points) || 0, Number(v.years) || 30);
      return [moneyRow("Points cost", r.pointCost), { label: "Reduced rate", value: r.reducedRate.toFixed(2) + "%" }, moneyRow("Monthly savings", r.monthlySavings), { label: "Break-even", value: r.breakevenMonths + " months" }];
    },
    note: "One point = 1% of the loan, typically cutting the rate by ~0.25%. Points pay off if you stay past break-even.",
    faq: [
      { q: "Should I buy mortgage points?", a: "Buy points if you'll stay in the home past the break-even point — usually 4-8 years. If you might move sooner, skip them or negotiate a lender credit instead." },
      { q: "Are points tax deductible?", a: "Points on a purchase mortgage are generally deductible in the year paid as mortgage interest. Refinance points must be amortized over the loan term." },
    ],
    related: ["mortgage-calculator", "closing-costs-calculator", "refinance-calculator"],
  },
  {
    slug: "price-per-square-foot-calculator",
    title: "Price Per Square Foot Calculator 2026 | US Money HQ",
    shortTitle: "Price Per Square Foot Calculator",
    description: "Free price per square foot calculator: compare home prices per square foot — the standard real estate metric.",
    h1: "Price Per Square Foot Calculator",
    sub: "The real estate metric that levels the comparison field.",
    fields: [
      { key: "price", label: "Home price (USD)", type: "number", default: 350000, min: 10000, step: 5000, inputMode: "numeric" },
      { key: "sqft", label: "Square feet", type: "number", default: 1800, min: 100, step: 50, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = pricePerSqft(Number(v.price) || 0, Number(v.sqft) || 1);
      return [{ label: "Price per sq ft", value: "$" + r.pricePerSqft.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), highlight: true }];
    },
    note: "Compare like-for-like: same neighborhood, same home type. Condition and lot size move the number a lot.",
    faq: [
      { q: "What is a good price per square foot?", a: "It varies wildly by market — $150 in the Midwest, $400+ on the coasts. Only compare within the same city and home type." },
      { q: "Why do appraisers use price per sq ft?", a: "It's the quickest apples-to-apples comparison for similar homes. Appraisers combine it with condition, upgrades, lot size, and recent comps." },
    ],
    related: ["square-footage-calculator", "home-affordability-calculator", "property-tax-calculator"],
  },
  {
    slug: "construction-cost-calculator",
    title: "Construction Cost Calculator 2026 — Build Estimate | US Money HQ",
    shortTitle: "Construction Cost Calculator",
    description: "Free construction cost calculator: estimate building costs by square footage, from basic to luxury finishes.",
    h1: "Construction Cost Calculator",
    sub: "What new construction costs in your market.",
    fields: [
      { key: "sqft", label: "Building size (sq ft)", type: "number", default: 2000, min: 100, step: 100, inputMode: "numeric" },
      { key: "costPerSqft", label: "Cost per sq ft (USD)", type: "number", default: 200, min: 50, max: 1000, step: 5, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = constructionCost(Number(v.sqft) || 0, Number(v.costPerSqft) || 0);
      return [moneyRow("Total build cost", r.total, true), { label: "Per sq ft", value: "$" + r.perSqft.toFixed(2) }];
    },
    note: "Typical US new-construction runs $120-$400/sq ft depending on region and finishes. This excludes land and soft costs.",
    faq: [
      { q: "How much does it cost to build a house?", a: "Nationally, $150-$250/sq ft for mid-grade finishes — a 2,000 sq ft home runs $300k-$500k plus land. Coastal and luxury markets exceed $400/sq ft." },
      { q: "What's included in cost per square foot?", a: "Materials, labor, foundation, framing, roof, systems, and basic finishes. It excludes land, permits, design fees, and site work." },
    ],
    related: ["concrete-calculator", "square-footage-calculator", "home-equity-calculator"],
  },
  {
    slug: "calorie-deficit-calculator",
    title: "Calorie Deficit Calculator 2026 — Weight Loss Timeline | US Money HQ",
    shortTitle: "Calorie Deficit Calculator",
    description: "Free calorie deficit calculator: how long it takes to lose your target pounds at your calorie intake.",
    h1: "Calorie Deficit Calculator",
    sub: "Your weight-loss timeline, honestly calculated.",
    fields: [
      { key: "tdee", label: "Your daily TDEE (calories)", type: "number", default: 2400, min: 800, step: 50, inputMode: "numeric" },
      { key: "intake", label: "Daily calorie intake", type: "number", default: 1900, min: 800, step: 50, inputMode: "numeric" },
      { key: "target", label: "Weight to lose (lbs)", type: "number", default: 15, min: 1, max: 300, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = calorieDeficit(Number(v.tdee) || 0, Number(v.intake) || 0, Number(v.target) || 0);
      return [{ label: "Daily deficit", value: r.deficit + " cal" }, { label: "Time to target", value: r.weeks >= 0 ? r.weeks + " weeks (" + r.months + " months)" : "No deficit — eating at/above TDEE", highlight: true }];
    },
    note: "3,500 calories ≈ 1 lb of fat. A 500-calorie daily deficit loses ~1 lb/week. Get your TDEE from the TDEE calculator.",
    faq: [
      { q: "How fast should I lose weight?", a: "1-2 lbs per week is the safe, sustainable range. Faster deficits risk muscle loss and rebound. Never eat below ~1,200 (women) / ~1,500 (men) without medical guidance." },
      { q: "Do calories from exercise count?", a: "Exercise calories are notoriously overestimated. Set your TDEE activity level conservatively and treat extra workouts as bonus deficit." },
    ],
    related: ["tdee-calculator", "bmi-calculator", "body-fat-calculator"],
  },
  {
    slug: "loan-comparison-calculator",
    title: "Loan Comparison Calculator 2026 — Side by Side | US Money HQ",
    shortTitle: "Loan Comparison Calculator",
    description: "Free loan comparison calculator: compare two loans side by side — payment, interest, and total cost.",
    h1: "Loan Comparison Calculator",
    sub: "Two loans, side by side, no math required.",
    fields: [
      { key: "a1", label: "Loan A amount (USD)", type: "number", default: 20000, min: 0, step: 500, inputMode: "numeric" },
      { key: "r1", label: "Loan A rate (%)", type: "number", default: 8, min: 0, step: 0.1, inputMode: "decimal" },
      { key: "t1", label: "Loan A term (months)", type: "number", default: 60, min: 1, max: 360, step: 1, inputMode: "numeric" },
      { key: "a2", label: "Loan B amount (USD)", type: "number", default: 20000, min: 0, step: 500, inputMode: "numeric" },
      { key: "r2", label: "Loan B rate (%)", type: "number", default: 6, min: 0, step: 0.1, inputMode: "decimal" },
      { key: "t2", label: "Loan B term (months)", type: "number", default: 48, min: 1, max: 360, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = loanCompare(
        { amount: Number(v.a1) || 0, rate: Number(v.r1) || 0, months: Number(v.t1) || 60 },
        { amount: Number(v.a2) || 0, rate: Number(v.r2) || 0, months: Number(v.t2) || 48 }
      );
      return [moneyRow("A monthly", r.a.payment), moneyRow("A total interest", r.a.interest), moneyRow("B monthly", r.b.payment), moneyRow("B total interest", r.b.interest), { label: "Monthly difference (A−B)", value: "$" + r.diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), highlight: true }];
    },
    note: "Same loan math, two columns — perfect for comparing lender offers or terms.",
    faq: [
      { q: "Which loan is better?", a: "Compare total cost, not just the payment. A longer term lowers payments but adds interest — this calculator shows both sides explicitly." },
      { q: "Should I compare APR or interest rate?", a: "APR includes fees and is the truer cost. Use APR for the rate field when comparing lenders." },
    ],
    related: ["loan-calculator", "refinance-calculator", "simple-interest-calculator"],
  },
  {
    slug: "savings-rate-calculator",
    title: "Savings Rate Calculator 2026 — % of Income | US Money HQ",
    shortTitle: "Savings Rate Calculator",
    description: "Free savings rate calculator: your savings rate as a percentage of income, and what it means for your timeline.",
    h1: "Savings Rate Calculator",
    sub: "What percent of your income you're keeping.",
    fields: [
      { key: "income", label: "Monthly take-home income (USD)", type: "number", default: 5000, min: 0, step: 100, inputMode: "numeric" },
      { key: "saved", label: "Monthly savings (USD)", type: "number", default: 1000, min: 0, step: 50, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = savingsRate(Number(v.income) || 0, Number(v.saved) || 0);
      return [{ label: "Savings rate", value: r.rate.toFixed(1) + "%", highlight: true }];
    },
    note: "The Mr. Money Mustache table: 10% rate = ~51 years to retirement; 25% = ~32 years; 50% = ~17 years.",
    faq: [
      { q: "What is a good savings rate?", a: "The average American saves ~5-10%. FIRE enthusiasts target 50%+. Even moving from 10% to 15% shaves roughly a decade off the road to financial independence." },
      { q: "Does savings rate include retirement contributions?", a: "Yes — 401k, IRA, and employer match all count. The point is the percentage of income you're not spending." },
    ],
    related: ["budget-calculator", "net-worth-calculator", "investment-calculator"],
  },
  {
    slug: "tax-refund-calculator",
    title: "Tax Refund Calculator 2026 — Refund or Owed | US Money HQ",
    shortTitle: "Tax Refund Calculator",
    description: "Free tax refund calculator: estimate your federal refund or amount owed from income and taxes withheld.",
    h1: "Tax Refund Calculator",
    sub: "Refund or bill — estimate before filing.",
    fields: [
      { key: "income", label: "Annual income (USD)", type: "number", default: 75000, min: 0, step: 1000, inputMode: "numeric" },
      { key: "withheld", label: "Federal tax withheld (USD)", type: "number", default: 9000, min: 0, step: 100, inputMode: "numeric" },
      { key: "filing", label: "Filing status", type: "select", default: "single", options: [{ value: "single", label: "Single" }, { value: "married", label: "Married filing jointly" }] },
    ],
    compute: (v) => {
      const r = taxRefundEstimate(Number(v.income) || 0, Number(v.withheld) || 0, String(v.filing) === "married" ? "married" : "single");
      return [moneyRow("Estimated refund", r.refund, true), moneyRow("Amount owed", r.owed), moneyRow("Actual federal tax", r.tax)];
    },
    note: "Estimate based on standard deduction only — credits, deductions, and other income change the real number.",
    faq: [
      { q: "Is a big refund good?", a: "A refund means you over-withheld — you gave the government an interest-free loan. Most people prefer to break even or owe a little. Adjust your W-4 if refunds top $1,000." },
      { q: "How do I check what was withheld?", a: "Look at box 2 of your W-2 or the 'Federal income tax withheld' line on your paystubs. This calculator compares that total to your actual tax." },
    ],
    related: ["tax-calculator", "salary-after-tax-calculator", "tax-bracket-calculator"],
  },
  {
    slug: "stock-profit-calculator",
    title: "Stock Profit Calculator 2026 — ROI & Gain | US Money HQ",
    shortTitle: "Stock Profit Calculator",
    description: "Free stock profit calculator: your gain, ROI, and commission when buying and selling shares.",
    h1: "Stock Profit Calculator",
    sub: "Buy price, sell price — what you actually keep.",
    fields: [
      { key: "shares", label: "Shares", type: "number", default: 100, min: 1, step: 1, inputMode: "numeric" },
      { key: "buy", label: "Buy price per share (USD)", type: "number", default: 50, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "sell", label: "Sell price per share (USD)", type: "number", default: 65, min: 0, step: 0.5, inputMode: "decimal" },
      { key: "commission", label: "Commission (%)", type: "number", default: 0.5, min: 0, max: 5, step: 0.1, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = stockProfit(Number(v.shares) || 0, Number(v.buy) || 0, Number(v.sell) || 0, Number(v.commission) || 0);
      return [moneyRow("Total profit", r.profit, true), { label: "ROI", value: r.roi.toFixed(2) + "%" }, moneyRow("Buy total", r.buyTotal), moneyRow("Sell total", r.sellTotal)];
    },
    note: "Does not include capital gains tax — run the result through the capital gains calculator for after-tax profit.",
    faq: [
      { q: "What is ROI on stocks?", a: "ROI = profit ÷ cost basis. $1,500 profit on a $5,000 position is 30%. Compare it against the market's return over the same period to judge performance." },
      { q: "Are stock profits taxable?", a: "Yes — short-term gains (under 1 year) are taxed as ordinary income; long-term gains at 0/15/20%. Use the capital gains calculator for the tax side." },
    ],
    related: ["capital-gains-calculator", "dividend-calculator", "roi-calculator"],
  },
  {
    slug: "investment-property-calculator",
    title: "Investment Property Calculator 2026 — Rental ROI | US Money HQ",
    shortTitle: "Investment Property Calculator",
    description: "Free investment property calculator: monthly cash flow, cap rate, and cash-on-cash return for a rental.",
    h1: "Investment Property Calculator",
    sub: "Is that rental actually a good deal?",
    fields: [
      { key: "price", label: "Purchase price (USD)", type: "number", default: 250000, min: 10000, step: 5000, inputMode: "numeric" },
      { key: "down", label: "Down payment (%)", type: "number", default: 20, min: 0, max: 100, step: 1, inputMode: "numeric" },
      { key: "rent", label: "Monthly rent (USD)", type: "number", default: 1800, min: 0, step: 50, inputMode: "numeric" },
      { key: "expenses", label: "Monthly expenses (USD)", type: "number", default: 400, min: 0, step: 25, inputMode: "numeric" },
      { key: "rate", label: "Mortgage rate (%)", type: "number", default: 7, min: 0, step: 0.1, inputMode: "decimal" },
      { key: "years", label: "Loan term (years)", type: "select", default: 30, options: [{ value: 15, label: "15 years" }, { value: 30, label: "30 years" }] },
    ],
    compute: (v) => {
      const r = investmentProperty(Number(v.price) || 0, Number(v.down) || 0, Number(v.rent) || 0, Number(v.expenses) || 0, Number(v.rate) || 0, Number(v.years) || 30);
      return [moneyRow("Monthly mortgage", r.monthlyPayment), moneyRow("Monthly cash flow", r.monthlyCashFlow, true), { label: "Cap rate", value: r.capRate.toFixed(2) + "%" }, { label: "Cash-on-cash return", value: r.cashOnCash.toFixed(2) + "%" }];
    },
    note: "Expenses should include property tax, insurance, maintenance (1% of value/year), vacancy, and management. Most markets target 1%+ rent-to-price ratio.",
    faq: [
      { q: "What is a good cap rate?", a: "5-8% is typical for single-family rentals; 8-12% for multi-family in secondary markets. Cap rate = net operating income ÷ price — higher means better cash yield." },
      { q: "What is cash-on-cash return?", a: "Annual cash flow ÷ cash invested (down payment + closing costs). It measures return on YOUR money, not the property's value — 8-12% is a solid target." },
    ],
    related: ["mortgage-calculator", "home-affordability-calculator", "roi-calculator"],
  },
  {
    slug: "escrow-calculator",
    title: "Escrow Calculator 2026 — Monthly Tax & Insurance | US Money HQ",
    shortTitle: "Escrow Calculator",
    description: "Free mortgage escrow calculator: monthly property tax and insurance escrow included in your payment.",
    h1: "Escrow Calculator",
    sub: "What your lender holds for taxes and insurance.",
    fields: [
      { key: "price", label: "Home price (USD)", type: "number", default: 350000, min: 10000, step: 5000, inputMode: "numeric" },
      { key: "down", label: "Down payment (%)", type: "number", default: 20, min: 0, max: 100, step: 1, inputMode: "numeric" },
      { key: "taxRate", label: "Property tax rate (%)", type: "number", default: 1.1, min: 0, max: 5, step: 0.05, inputMode: "decimal" },
      { key: "insurance", label: "Annual insurance (USD)", type: "number", default: 1500, min: 0, step: 50, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = escrowEstimate(Number(v.price) || 0, Number(v.down) || 0, Number(v.taxRate) || 0, Number(v.insurance) || 0);
      return [moneyRow("Monthly escrow", r.monthlyEscrow, true), moneyRow("Annual property tax", r.annualPropertyTax), moneyRow("Annual insurance", r.annualInsurance)];
    },
    note: "The national average property tax rate is about 1.1% of home value. Check your county's actual rate.",
    faq: [
      { q: "Is escrow required?", a: "Lenders require escrow for property tax and insurance when you put down less than 20%. With 20%+ down, you may opt out and pay them yourself." },
      { q: "Why does my escrow payment change?", a: "Lenders do an annual escrow analysis. When tax or insurance premiums rise, your monthly escrow increases to cover the new total and any shortfall." },
    ],
    related: ["mortgage-calculator", "property-tax-calculator", "closing-costs-calculator"],
  },
  {
    slug: "commission-calculator",
    title: "Commission Calculator 2026 — Real Estate & Sales | US Money HQ",
    shortTitle: "Commission Calculator",
    description: "Free commission calculator: real estate agent commission and net to seller from any sale price and rate.",
    h1: "Commission Calculator",
    sub: "What the agent earns — and what you keep.",
    fields: [
      { key: "price", label: "Sale price (USD)", type: "number", default: 400000, min: 1000, step: 5000, inputMode: "numeric" },
      { key: "rate", label: "Commission rate (%)", type: "number", default: 5, min: 0, max: 10, step: 0.25, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = commissionCalc(Number(v.price) || 0, Number(v.rate) || 0);
      return [moneyRow("Total commission", r.commission, true), moneyRow("Net to seller", r.netToSeller)];
    },
    note: "Typical US real estate commission is 5-6%, usually split between buyer's and seller's agents. The rate is negotiable.",
    faq: [
      { q: "Can I negotiate commission?", a: "Yes — commission has always been negotiable, and 2024 rule changes made it more explicit. Flat-fee and discount brokers offer 1-2% alternatives." },
      { q: "Who pays the commission?", a: "Traditionally the seller pays, and it's split between both agents. Buyers may now negotiate their own agent's compensation directly under the new rules." },
    ],
    related: ["price-per-square-foot-calculator", "property-tax-calculator", "closing-costs-calculator"],
  },
  {
    slug: "rmd-calculator",
    title: "RMD Calculator 2026 — Required Minimum Distribution | US Money HQ",
    shortTitle: "RMD Calculator",
    description: "Free RMD calculator: your required minimum distribution from retirement accounts using IRS life expectancy factors.",
    h1: "RMD Calculator",
    sub: "What the IRS requires you to withdraw.",
    fields: [
      { key: "balance", label: "Account balance (USD)", type: "number", default: 500000, min: 0, step: 10000, inputMode: "numeric" },
      { key: "age", label: "Your age this year", type: "number", default: 73, min: 72, max: 100, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = rmdEstimate(Number(v.balance) || 0, Number(v.age) || 73);
      return [moneyRow("Required distribution", r.rmd, true), { label: "Life expectancy factor", value: String(r.factor) }];
    },
    note: "RMDs start at age 73 for anyone born after 1960 (age 75 for those born in 1960+). Missing an RMD carries a 25% penalty (10% if corrected quickly).",
    faq: [
      { q: "When do RMDs start?", a: "Age 73 if you were born between 1951-1959, age 75 if born in 1960 or later. Your first RMD can be delayed to April 1 of the year after you turn the RMD age." },
      { q: "Which accounts have RMDs?", a: "Traditional IRAs, 401(k)s, and similar employer plans. Roth IRAs have no RMDs during your lifetime — a key reason savers convert." },
    ],
    related: ["retirement-calculator", "401k-calculator", "tax-bracket-calculator"],
  },
  {
    slug: "savings-bonds-calculator",
    title: "Savings Bonds Calculator 2026 — EE & I Bonds | US Money HQ",
    shortTitle: "Savings Bonds Calculator",
    description: "Free savings bond calculator: what your bond is worth with semi-annual compounding at a fixed rate.",
    h1: "Savings Bonds Calculator",
    sub: "Your bond's value, grown semi-annually.",
    fields: [
      { key: "face", label: "Face value (USD)", type: "number", default: 1000, min: 25, step: 25, inputMode: "numeric" },
      { key: "rate", label: "Annual rate (%)", type: "number", default: 2.5, min: 0, max: 10, step: 0.1, inputMode: "decimal" },
      { key: "years", label: "Years held", type: "number", default: 10, min: 1, max: 30, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = savingsBondValue(Number(v.face) || 0, Number(v.rate) || 0, Number(v.years) || 10);
      return [moneyRow("Current value", r.value, true), moneyRow("Gain", r.gain)];
    },
    note: "EE bonds earn a fixed rate and double after 20 years. I bonds adjust for inflation. Use the current rate from TreasuryDirect for accuracy.",
    faq: [
      { q: "EE vs I bonds — what's the difference?", a: "EE bonds pay a fixed rate set at purchase (and are guaranteed to double in 20 years). I bonds pay a variable rate tied to inflation, protecting purchasing power." },
      { q: "Are savings bond gains taxable?", a: "Yes — interest is exempt from state tax but subject to federal tax, unless used for qualified education expenses (education exclusion)." },
    ],
    related: ["cd-calculator", "compound-interest-calculator", "investment-calculator"],
  },
  {
    slug: "tile-calculator",
    title: "Tile Calculator 2026 — Tiles Needed & Cost | US Money HQ",
    shortTitle: "Tile Calculator",
    description: "Free tile calculator: how many tiles you need for any floor or wall, with waste, boxes, and coverage.",
    h1: "Tile Calculator",
    sub: "Tiles, boxes, and coverage — with waste built in.",
    fields: [
      { key: "area", label: "Area to cover (sq ft)", type: "number", default: 200, min: 1, step: 10, inputMode: "numeric" },
      { key: "size", label: "Tile size (inches)", type: "select", default: 12, options: [{ value: 6, label: "6x6" }, { value: 12, label: "12x12" }, { value: 18, label: "18x18" }, { value: 24, label: "24x24" }] },
      { key: "waste", label: "Waste allowance (%)", type: "number", default: 10, min: 0, max: 30, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = tileNeeds(Number(v.area) || 0, Number(v.size) || 12, Number(v.waste) || 10);
      return [{ label: "Tiles needed", value: String(r.tiles), highlight: true }, { label: "Boxes (10-tile)", value: String(r.boxes) }, { label: "Coverage per tile", value: r.perTile.toFixed(2) + " sq ft" }];
    },
    note: "Add 10% waste for cuts and breakage — 15% for diagonal or large-format patterns.",
    faq: [
      { q: "How much extra tile should I buy?", a: "10% for straight layouts, 15% for diagonal or herringbone. Keep the extras — matching dye lots later is nearly impossible." },
      { q: "What size tiles are easiest to install?", a: "12x12 and 12x24 are DIY-friendly. Large format (24x24+) needs perfectly flat floors and more skill." },
    ],
    related: ["square-footage-calculator", "carpet-calculator", "concrete-calculator"],
  },
  {
    slug: "fence-calculator",
    title: "Fence Calculator 2026 — Panels & Materials | US Money HQ",
    shortTitle: "Fence Calculator",
    description: "Free fence calculator: how many panels you need for any fence run, with total width.",
    h1: "Fence Calculator",
    sub: "Panel count for your fence line, instantly.",
    fields: [
      { key: "length", label: "Fence length (feet)", type: "number", default: 120, min: 1, step: 10, inputMode: "numeric" },
      { key: "panel", label: "Panel width (feet)", type: "select", default: 8, options: [{ value: 6, label: "6 ft" }, { value: 8, label: "8 ft" }] },
    ],
    compute: (v) => {
      const r = fenceNeeds(Number(v.length) || 0, Number(v.panel) || 8);
      return [{ label: "Panels needed", value: String(r.panels), highlight: true }, { label: "Total panel width", value: r.totalWidth + " ft" }];
    },
    note: "Add one post per panel plus an end post. Gates replace one panel section.",
    faq: [
      { q: "How many posts do I need?", a: "One post at each end plus one per panel. A 120 ft run with 8-ft panels = 15 panels + 16 posts (concrete set)." },
      { q: "Wood, vinyl, or chain link?", a: "Wood costs least but needs staining every 2-3 years. Vinyl lasts decades with zero maintenance. Chain link is cheapest per foot but lacks privacy." },
    ],
    related: ["gravel-calculator", "sod-calculator", "topsoil-calculator"],
  },
  {
    slug: "gravel-calculator",
    title: "Gravel Calculator 2026 — Cubic Yards & Cost | US Money HQ",
    shortTitle: "Gravel Calculator",
    description: "Free gravel calculator: cubic yards and tons of gravel for driveways, paths, and beds, with cost.",
    h1: "Gravel Calculator",
    sub: "Cubic yards, tons, and cost — in seconds.",
    fields: [
      { key: "length", label: "Length (feet)", type: "number", default: 30, min: 1, step: 5, inputMode: "numeric" },
      { key: "width", label: "Width (feet)", type: "number", default: 12, min: 1, step: 1, inputMode: "numeric" },
      { key: "depth", label: "Depth (inches)", type: "number", default: 4, min: 1, max: 24, step: 0.5, inputMode: "decimal" },
      { key: "price", label: "Price per yard (USD)", type: "number", default: 45, min: 0, step: 5, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = gravelNeeds(Number(v.length) || 0, Number(v.width) || 0, Number(v.depth) || 4, Number(v.price) || 0);
      return [{ label: "Cubic yards", value: String(r.cubicYards), highlight: true }, { label: "Approx. tons", value: String(r.tons) }, moneyRow("Material cost", r.cost)];
    },
    note: "Crushed stone weighs ~1.4 tons per yard. Driveways typically need 4-6 inches of gravel.",
    faq: [
      { q: "How deep should gravel be?", a: "Walkways: 2 inches. Driveways: 4-6 inches in two layers (large base + small top). Drainage areas may need more." },
      { q: "Should I buy by the yard or by the bag?", a: "Any project over half a yard — buy bulk. Delivery typically costs less than 40+ bags." },
    ],
    related: ["topsoil-calculator", "mulch-calculator", "concrete-calculator"],
  },
  {
    slug: "topsoil-calculator",
    title: "Topsoil Calculator 2026 — Yards Needed | US Money HQ",
    shortTitle: "Topsoil Calculator",
    description: "Free topsoil calculator: cubic yards of topsoil for lawns and gardens, with cost.",
    h1: "Topsoil Calculator",
    sub: "How much soil your yard needs.",
    fields: [
      { key: "length", label: "Length (feet)", type: "number", default: 20, min: 1, step: 5, inputMode: "numeric" },
      { key: "width", label: "Width (feet)", type: "number", default: 10, min: 1, step: 1, inputMode: "numeric" },
      { key: "depth", label: "Depth (inches)", type: "number", default: 3, min: 0.5, max: 24, step: 0.5, inputMode: "decimal" },
      { key: "price", label: "Price per yard (USD)", type: "number", default: 25, min: 0, step: 5, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = gravelNeeds(Number(v.length) || 0, Number(v.width) || 0, Number(v.depth) || 3, Number(v.price) || 0);
      return [{ label: "Cubic yards", value: String(r.cubicYards), highlight: true }, moneyRow("Material cost", r.cost)];
    },
    note: "Topsoil runs $15-$40 per yard delivered. Use 3-4 inches for new lawns, 6+ for raised beds.",
    faq: [
      { q: "How much topsoil do I need for a new lawn?", a: "3-4 inches is the sweet spot. A 500 sq ft lawn at 3 inches needs about 4.6 cubic yards." },
      { q: "Screened or unscreened topsoil?", a: "Screened is weed-free and consistent — worth it for lawns. Unscreened is fine for bulk fill and beds you'll till." },
    ],
    related: ["gravel-calculator", "mulch-calculator", "sod-calculator"],
  },
  {
    slug: "carpet-calculator",
    title: "Carpet Calculator 2026 — Sq Ft & Cost | US Money HQ",
    shortTitle: "Carpet Calculator",
    description: "Free carpet calculator: square feet, square yards, and cost for carpeting any room.",
    h1: "Carpet Calculator",
    sub: "Carpet area and cost, room by room.",
    fields: [
      { key: "length", label: "Room length (feet)", type: "number", default: 14, min: 1, step: 1, inputMode: "numeric" },
      { key: "width", label: "Room width (feet)", type: "number", default: 12, min: 1, step: 1, inputMode: "numeric" },
      { key: "price", label: "Price per sq ft (USD)", type: "number", default: 3.5, min: 0, step: 0.25, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = carpetNeeds(Number(v.length) || 0, Number(v.width) || 0, Number(v.price) || 0);
      return [{ label: "Square feet", value: String(r.sqft), highlight: true }, { label: "Square yards", value: String(r.sqYards) }, moneyRow("Carpet cost", r.cost)];
    },
    note: "Carpet is sold by the square yard but priced per sq ft — this calculator shows both. Installers add ~10% for seams and waste.",
    faq: [
      { q: "Carpet by square foot or yard?", a: "Retail shows per sq ft; installers quote per sq yd (9 sq ft). Always compare the same unit." },
      { q: "What does carpet installation cost?", a: "$2-$4 per sq ft including padding and labor, on top of carpet. Move furniture and removal add fees." },
    ],
    related: ["square-footage-calculator", "tile-calculator", "wallpaper-calculator"],
  },
  {
    slug: "wallpaper-calculator",
    title: "Wallpaper Calculator 2026 — Rolls Needed | US Money HQ",
    shortTitle: "Wallpaper Calculator",
    description: "Free wallpaper calculator: rolls needed for any room, with wall area and 10% waste.",
    h1: "Wallpaper Calculator",
    sub: "Rolls for your room, no math required.",
    fields: [
      { key: "length", label: "Room length (feet)", type: "number", default: 12, min: 1, step: 1, inputMode: "numeric" },
      { key: "width", label: "Room width (feet)", type: "number", default: 10, min: 1, step: 1, inputMode: "numeric" },
      { key: "height", label: "Wall height (feet)", type: "number", default: 8, min: 1, step: 1, inputMode: "numeric" },
      { key: "coverage", label: "Roll coverage (sq ft)", type: "number", default: 56, min: 10, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = wallpaperNeeds(Number(v.length) || 0, Number(v.width) || 0, Number(v.height) || 8, Number(v.coverage) || 56);
      return [{ label: "Wall area", value: r.wallArea + " sq ft" }, { label: "Rolls needed", value: String(r.rolls), highlight: true }];
    },
    note: "Standard rolls cover ~56 sq ft. Subtract doors and windows from your area — this calculator is conservative with 10% waste.",
    faq: [
      { q: "How do I subtract windows and doors?", a: "A standard door is ~21 sq ft, a double window ~15 sq ft. Subtract them from the wall area before dividing by roll coverage." },
      { q: "How much do wallpaper rolls cost?", a: "Budget rolls run $20-$40; designer runs $60-$150+. The calculator gives rolls — multiply by your price point." },
    ],
    related: ["paint-calculator", "carpet-calculator", "square-footage-calculator"],
  },
  {
    slug: "sod-calculator",
    title: "Sod Calculator 2026 — Pallets & Cost | US Money HQ",
    shortTitle: "Sod Calculator",
    description: "Free sod calculator: square feet, pallets, and cost to sod your lawn.",
    h1: "Sod Calculator",
    sub: "Instant lawn, correctly measured.",
    fields: [
      { key: "length", label: "Lawn length (feet)", type: "number", default: 40, min: 1, step: 5, inputMode: "numeric" },
      { key: "width", label: "Lawn width (feet)", type: "number", default: 25, min: 1, step: 5, inputMode: "numeric" },
      { key: "price", label: "Price per pallet (USD)", type: "number", default: 250, min: 0, step: 10, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = sodNeeds(Number(v.length) || 0, Number(v.width) || 0, Number(v.price) || 0);
      return [{ label: "Square feet", value: String(r.sqft), highlight: true }, { label: "Pallets (450 sq ft each)", value: String(r.pallets) }, moneyRow("Sod cost", r.cost)];
    },
    note: "One pallet covers ~450 sq ft. Add 5-10% for cutting around curves and beds.",
    faq: [
      { q: "Sod or seed?", a: "Sod gives an instant lawn but costs 5-10x more. Seed is cheaper but needs 6-8 weeks of careful watering." },
      { q: "When should I lay sod?", a: "Early fall or spring — cool temperatures and rain help it root. Never lay sod on frozen or flooded ground." },
    ],
    related: ["topsoil-calculator", "gravel-calculator", "mulch-calculator"],
  },
  {
    slug: "drywall-calculator",
    title: "Drywall Calculator 2026 — Sheets Needed | US Money HQ",
    shortTitle: "Drywall Calculator",
    description: "Free drywall calculator: 4x8 sheets for walls and ceiling, with openings subtracted.",
    h1: "Drywall Calculator",
    sub: "Sheets for the whole room — walls and ceiling.",
    fields: [
      { key: "length", label: "Room length (feet)", type: "number", default: 12, min: 1, step: 1, inputMode: "numeric" },
      { key: "width", label: "Room width (feet)", type: "number", default: 10, min: 1, step: 1, inputMode: "numeric" },
      { key: "height", label: "Wall height (feet)", type: "number", default: 8, min: 1, step: 1, inputMode: "numeric" },
      { key: "openings", label: "Doors + windows (sq ft)", type: "number", default: 60, min: 0, step: 5, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = drywallNeeds(Number(v.length) || 0, Number(v.width) || 0, Number(v.height) || 8, Number(v.openings) || 0);
      return [{ label: "Drywall area", value: r.area + " sq ft" }, { label: "4x8 sheets", value: String(r.sheets), highlight: true }];
    },
    note: "Standard 4x8 sheets cover 32 sq ft. Add 10% for cuts and mistakes.",
    faq: [
      { q: "4x8 or 4x12 sheets?", a: "4x12 sheets mean fewer seams on 8-foot walls, but they need two people to carry. DIYers should stick with 4x8." },
      { q: "What thickness do I need?", a: "1/2-inch for walls and ceilings in homes; 5/8-inch for garages, fire-rated, or commercial. 1/4-inch is for curved surfaces." },
    ],
    related: ["paint-calculator", "concrete-calculator", "square-footage-calculator"],
  },
  {
    slug: "heart-rate-calculator",
    title: "Heart Rate Calculator 2026 — Target Zones | US Money HQ",
    shortTitle: "Heart Rate Calculator",
    description: "Free heart rate calculator: max heart rate and target training zones by age and resting rate.",
    h1: "Heart Rate Calculator",
    sub: "Train in the right zone, every workout.",
    fields: [
      { key: "age", label: "Your age", type: "number", default: 35, min: 15, max: 90, step: 1, inputMode: "numeric" },
      { key: "rest", label: "Resting heart rate (bpm)", type: "number", default: 65, min: 30, max: 120, step: 1, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = heartRate(Number(v.age) || 35, Number(v.rest) || 65);
      return [{ label: "Max heart rate", value: String(r.max), highlight: true }, { label: "Moderate zone (50-70%)", value: r.zone50 + "-" + Math.round(r.max * 0.7) + " bpm" }, { label: "Vigorous zone (70-85%)", value: Math.round(r.max * 0.7) + "-" + r.zone85 + " bpm" }, { label: "Karvonen target (50-85%)", value: r.targetLow + "-" + r.targetHigh + " bpm" }];
    },
    note: "Uses the 220-age formula plus the Karvonen method with your resting rate — more accurate than age alone.",
    faq: [
      { q: "What is a good resting heart rate?", a: "60-100 bpm is normal; well-trained athletes often sit at 40-60. A lower resting rate usually means better cardiovascular fitness." },
      { q: "What zone should I train in?", a: "Moderate (50-70%) for fat-burning and base fitness; vigorous (70-85%) for cardio improvement. Mix both across the week." },
    ],
    related: ["tdee-calculator", "bmi-calculator", "calorie-deficit-calculator"],
  },
  {
    slug: "percentage-change-calculator",
    title: "Percentage Change Calculator 2026 — % Increase/Decrease | US Money HQ",
    shortTitle: "Percentage Change Calculator",
    description: "Free percentage change calculator: percent increase or decrease between two numbers, with the absolute difference.",
    h1: "Percentage Change Calculator",
    sub: "From-to percent change, instantly.",
    fields: [
      { key: "from", label: "Original value", type: "number", default: 100, min: -99999999, step: 1, inputMode: "decimal" },
      { key: "to", label: "New value", type: "number", default: 125, min: -99999999, step: 1, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = percentChange(Number(v.from) || 0, Number(v.to) || 0);
      return [{ label: "Percent change", value: (r.change >= 0 ? "+" : "") + r.change.toFixed(2) + "%", highlight: true }, { label: "Absolute difference", value: (r.absolute >= 0 ? "+" : "") + r.absolute.toLocaleString() }];
    },
    note: "Percent change = (new − old) ÷ |old| × 100. Use it for prices, salaries, stock moves, and revenue.",
    faq: [
      { q: "How do I calculate percentage change?", a: "Subtract the original from the new value, divide by the original (absolute value), multiply by 100. $50 to $60 = +20%." },
      { q: "Why does a 50% loss need a 100% gain to recover?", a: "Percentages compound on different bases. $100 → $50 is −50%, but $50 → $100 is +100%. Always compare in dollars when the direction matters." },
    ],
    related: ["percentage-calculator", "discount-calculator", "inflation-calculator"],
  },
  {
    slug: "how-long-will-my-money-last-calculator",
    title: "How Long Will My Money Last Calculator 2026 | US Money HQ",
    shortTitle: "How Long Will My Money Last Calculator",
    description: "Free retirement withdrawal calculator: how long your savings last with monthly withdrawals and investment growth.",
    h1: "How Long Will My Money Last Calculator",
    sub: "Withdrawal longevity, honestly projected.",
    fields: [
      { key: "balance", label: "Savings balance (USD)", type: "number", default: 500000, min: 0, step: 10000, inputMode: "numeric" },
      { key: "withdrawal", label: "Monthly withdrawal (USD)", type: "number", default: 2500, min: 0, step: 100, inputMode: "numeric" },
      { key: "rate", label: "Annual return (%)", type: "number", default: 5, min: 0, max: 15, step: 0.5, inputMode: "decimal" },
    ],
    compute: (v) => {
      const r = moneyLasts(Number(v.balance) || 0, Number(v.withdrawal) || 0, Number(v.rate) || 0);
      return [{ label: "Money lasts", value: r.years > 0 ? r.years + " yrs " + r.remMonths + " mo" : r.months + " months", highlight: true }, moneyRow("Remaining at end", r.finalBalance)];
    },
    note: "The 4% rule: withdraw no more than 4% of your portfolio per year to make it last 30 years. This calculator lets you stress-test your actual numbers.",
    faq: [
      { q: "What is the 4% rule?", a: "Withdraw 4% of your starting balance in year one, adjusted for inflation. On $1M that's $40k/year. It survived most historical market scenarios over 30 years." },
      { q: "What withdrawal rate is safe for me?", a: "3-4% is the standard range. Early retirees or longer horizons should use 3-3.5%. Higher returns or lower spending extends the runway." },
    ],
    related: ["retirement-calculator", "401k-calculator", "investment-calculator"],
  },
  {
    slug: "moving-cost-calculator",
    title: "Moving Cost Calculator 2026 — Estimate | US Money HQ",
    shortTitle: "Moving Cost Calculator",
    description: "Free moving cost calculator: estimate your move with distance fees, hourly movers, and truck costs.",
    h1: "Moving Cost Calculator",
    sub: "Local or long-distance — rough but real.",
    fields: [
      { key: "distance", label: "Distance (miles)", type: "number", default: 50, min: 0, step: 10, inputMode: "numeric" },
      { key: "hours", label: "Movers' time (hours)", type: "number", default: 4, min: 1, step: 1, inputMode: "numeric" },
      { key: "rate", label: "Hourly rate per mover (USD)", type: "number", default: 50, min: 0, step: 5, inputMode: "numeric" },
      { key: "truck", label: "Truck fee (USD)", type: "number", default: 150, min: 0, step: 25, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = movingCost(Number(v.distance) || 0, Number(v.hours) || 0, Number(v.rate) || 0, Number(v.truck) || 0);
      return [moneyRow("Estimated total", r.total, true), moneyRow("Distance fee", r.distanceFee), moneyRow("Labor (2 movers)", r.labor)];
    },
    note: "Local moves: $300-$600 for a studio, $1,000-$2,500 for a 3-bed home. Long-distance: $2,000-$6,000+. Get 3 quotes before booking.",
    faq: [
      { q: "How much does a local move cost?", a: "Hourly rates of $40-$75 per mover plus a truck fee. A 4-hour 2-mover local move typically lands $400-$700." },
      { q: "How much is a long-distance move?", a: "Cross-country moves run $2,000-$6,000+ depending on weight and distance. Compare binding quotes from at least 3 licensed movers." },
    ],
    related: ["gas-cost-calculator", "budget-calculator", "emergency-fund-calculator"],
  },
  {
    slug: "life-insurance-needs-calculator",
    title: "Life Insurance Needs Calculator 2026 | US Money HQ",
    shortTitle: "Life Insurance Needs Calculator",
    description: "Free life insurance needs calculator: how much coverage you need to replace income, cover debts, and final expenses.",
    h1: "Life Insurance Needs Calculator",
    sub: "Coverage that actually covers.",
    fields: [
      { key: "income", label: "Annual income (USD)", type: "number", default: 75000, min: 0, step: 5000, inputMode: "numeric" },
      { key: "years", label: "Years to cover", type: "number", default: 20, min: 1, max: 40, step: 1, inputMode: "numeric" },
      { key: "debts", label: "Mortgage + debts (USD)", type: "number", default: 250000, min: 0, step: 10000, inputMode: "numeric" },
      { key: "final", label: "Final expenses (USD)", type: "number", default: 15000, min: 0, step: 5000, inputMode: "numeric" },
      { key: "current", label: "Existing coverage (USD)", type: "number", default: 50000, min: 0, step: 10000, inputMode: "numeric" },
    ],
    compute: (v) => {
      const r = lifeInsuranceNeeds(Number(v.income) || 0, Number(v.years) || 20, Number(v.debts) || 0, Number(v.final) || 0, Number(v.current) || 0);
      return [moneyRow("Coverage needed", r.needs, true), moneyRow("Income replacement (70%)", r.incomeReplacement), moneyRow("Total needs before existing", r.totalNeeds)];
    },
    note: "Common rule: 10-12x annual income. This calculator is more precise: 70% income replacement + debts + final expenses − existing coverage.",
    faq: [
      { q: "How much life insurance do I need?", a: "10-12x annual income is the standard benchmark. The precise version: 70% of income × years to cover, plus debts and final expenses, minus what you already have." },
      { q: "Term or whole life?", a: "Term insurance is cheap and covers the gap when kids are dependent — the right choice for 90% of families. Whole life costs 10x more and mostly benefits the agent." },
    ],
    related: ["net-worth-calculator", "budget-calculator", "emergency-fund-calculator"],
  },
  {
    slug: "home-remodel-cost-calculator",
    title: "Home Remodel Cost Calculator 2026 | US Money HQ",
    shortTitle: "Home Remodel Cost Calculator",
    description: "Free home remodel cost calculator: budget ranges for kitchen, bath, basement, and whole-home remodels by quality level.",
    h1: "Home Remodel Cost Calculator",
    sub: "Realistic remodel budgets, room by room.",
    fields: [
      { key: "room", label: "Project", type: "select", default: "kitchen", options: [{ value: "kitchen", label: "Kitchen" }, { value: "bath", label: "Bathroom" }, { value: "basement", label: "Basement finish" }, { value: "wholehome", label: "Whole home" }] },
      { key: "sqft", label: "Project size (sq ft)", type: "number", default: 200, min: 10, step: 10, inputMode: "numeric" },
      { key: "quality", label: "Quality", type: "select", default: "mid", options: [{ value: "budget", label: "Budget" }, { value: "mid", label: "Mid-range" }, { value: "luxury", label: "Luxury" }] },
    ],
    compute: (v) => {
      const r = remodelCost(String(v.room) || "kitchen", Number(v.sqft) || 0, String(v.quality) || "mid");
      return [moneyRow("Low estimate", r.low, true), moneyRow("High estimate", r.high), { label: "Per sq ft", value: "$" + r.perSqftLow + "-$" + r.perSqftHigh }];
    },
    note: "National averages, not local quotes. Labor is 40-60% of remodel cost in most markets.",
    faq: [
      { q: "How much does a kitchen remodel cost?", a: "Budget: $100-$150/sq ft, mid-range: $150-$250, luxury: $250+. A typical 200 sq ft mid-range kitchen runs $30k-$50k." },
      { q: "What adds the most value?", a: "Kitchens and baths return 60-80% on resale. Focus on cabinet fronts, countertops, and lighting before splurging on appliances." },
    ],
    related: ["construction-cost-calculator", "concrete-calculator", "paint-calculator"],
  },
];

// Planned tools — render automatically via pages/[tool].js once added to TOOLS.
// No tools in the pipeline — every planned tool shipped. Add future slugs here when scoping new ones.
export const FUTURE_TOOLS: string[] = [];

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
