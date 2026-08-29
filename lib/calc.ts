// lib/calc.ts — typed US financial calculator engine (shared: server + client + API)

export type Filing = "single" | "married";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

/** Monthly payment for an amortizing loan. ratePct = annual % (e.g. 6.5), termMonths = N. */
export function monthlyPayment(principal: number, ratePct: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (ratePct === 0) return principal / termMonths;
  const r = ratePct / 100 / 12;
  const p = Math.pow(1 + r, termMonths);
  return (principal * r * p) / (p - 1);
}

export type AmortRow = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

/** Full amortization schedule. */
export function amortizationSchedule(principal: number, ratePct: number, termMonths: number): AmortRow[] {
  const payment = monthlyPayment(principal, ratePct, termMonths);
  const r = ratePct / 100 / 12;
  let balance = principal;
  const rows: AmortRow[] = [];
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

/** US federal income tax (2025 brackets, standard deduction). */
export function federalTax(annualIncome: number, filing: Filing = "single"): { gross: number; stdDeduction: number; taxable: number; tax: number } {
  const stdDeduction = filing === "married" ? 30000 : 15000;
  const taxable = Math.max(0, annualIncome - stdDeduction);
  const brackets: [number, number, number][] =
    filing === "married"
      ? [
          [0, 23850, 0.1],
          [23850, 96950, 0.12],
          [96950, 206700, 0.22],
          [206700, 394600, 0.24],
          [394600, 501050, 0.32],
          [501050, 751600, 0.35],
          [751600, Infinity, 0.37],
        ]
      : [
          [0, 11925, 0.1],
          [11925, 48475, 0.12],
          [48475, 103350, 0.22],
          [103350, 197300, 0.24],
          [197300, 250525, 0.32],
          [250525, 626350, 0.35],
          [626350, Infinity, 0.37],
        ];
  let tax = 0;
  for (const [lo, hi, rate] of brackets) {
    if (taxable <= lo) break;
    tax += (Math.min(taxable, hi) - lo) * rate;
    if (taxable <= hi) break;
  }
  return { gross: annualIncome, stdDeduction, taxable, tax: round2(tax) };
}

/** FICA: social security 6.2% up to wage cap, medicare 1.45% (+0.9% above threshold). */
export function fica(annualIncome: number, filing: Filing = "single"): { socialSecurity: number; medicare: number; total: number } {
  const ssCap = 176100; // 2025
  const ss = Math.min(annualIncome, ssCap) * 0.062;
  let mc = annualIncome * 0.0145;
  const extraThreshold = filing === "married" ? 250000 : 200000;
  if (annualIncome > extraThreshold) mc += (annualIncome - extraThreshold) * 0.009;
  return { socialSecurity: round2(ss), medicare: round2(mc), total: round2(ss + mc) };
}

export const NO_INCOME_TAX_STATES = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"];

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
  "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
  "WV", "WI", "WY",
];

/** Simple state tax estimate: 5% flat for taxable states, 0 for no-income-tax states. Label as estimate. */
export function stateTax(annualIncome: number, state: string, filing: Filing = "single"): { state: string; tax: number; note: string } {
  const stdDeduction = filing === "married" ? 30000 : 15000;
  const taxable = Math.max(0, annualIncome - stdDeduction);
  if (NO_INCOME_TAX_STATES.includes(state.toUpperCase())) {
    return { state, tax: 0, note: "No state income tax" };
  }
  return { state, tax: round2(taxable * 0.05), note: "5% flat estimate — check your state" };
}

/** Paycheck breakdown for one pay period. periods: 52 / 26 / 24 / 12. */
export function paycheckBreakdown(annual: number, state: string, filing: Filing = "single", periods = 26) {
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

/** Debt payoff plan. */
export function debtPayoff(balance: number, apr: number, monthlyPaymentAmt: number, extra = 0) {
  if (balance <= 0 || monthlyPaymentAmt <= 0) return { months: 0, totalInterest: 0, totalPaid: 0, schedule: [] as { month: number; payment: number; interest: number; balance: number }[] };
  const r = apr / 100 / 12;
  let b = balance;
  let interestTotal = 0;
  let months = 0;
  const schedule: { month: number; payment: number; interest: number; balance: number }[] = [];
  while (b > 0 && months < 600) {
    months++;
    const interest = b * r;
    let payment = monthlyPaymentAmt + extra;
    if (payment <= interest) payment = interest + 1;
    if (payment > b + interest) payment = b + interest;
    b = Math.max(0, b + interest - payment);
    interestTotal += interest;
    if (schedule.length < 12) schedule.push({ month: months, payment: round2(payment), interest: round2(interest), balance: round2(b) });
  }
  return { months, totalInterest: round2(interestTotal), totalPaid: round2(balance + interestTotal), schedule };
}

/** Debt-to-income ratios (decimals as percentages). */
export function dti(grossMonthly: number, housingPayment: number, otherDebts: number): { frontRatio: number; backRatio: number } {
  const front = grossMonthly > 0 ? housingPayment / grossMonthly : 0;
  const back = grossMonthly > 0 ? (housingPayment + otherDebts) / grossMonthly : 0;
  return { frontRatio: round2(front * 10000) / 100, backRatio: round2(back * 10000) / 100 };
}

/** PMI estimate. Annual PMI rate ~0.5% of loan. Cancels when LTV <= 78% of original value. */
export function pmiCalculator(price: number, downPct: number, rate: number, years: number) {
  const loan = Math.max(0, price - (price * downPct) / 100);
  const term = years * 12;
  const base = monthlyPayment(loan, rate, term);
  const down = price - loan;
  let pmiMonthly = 0;
  let monthsUntilCancel: number | null = null;
  let totalPMI = 0;
  if (downPct < 20 && loan > 0) {
    pmiMonthly = (loan * 0.005) / 12;
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
    downPayment: round2(down),
    loanAmount: round2(loan),
    basePayment: round2(base),
    pmiMonthly: round2(pmiMonthly),
    monthsUntilCancel,
    totalPMI: round2(totalPMI),
    hasPMI: downPct < 20,
  };
}

/** HELOC payment. interestOnly: draw-period style; else amortize over term. */
export function helocPayment(drawn: number, rate: number, termMonths = 120, interestOnly = true) {
  if (drawn <= 0) return { monthly: 0, totalInterest: 0, mode: "interest-only" };
  if (interestOnly) {
    const monthly = (drawn * (rate / 100)) / 12;
    return { monthly: round2(monthly), totalInterest: round2(monthly * termMonths), mode: "interest-only" };
  }
  const monthly = monthlyPayment(drawn, rate, termMonths);
  const totalInterest = monthly * termMonths - drawn;
  return { monthly: round2(monthly), totalInterest: round2(totalInterest), mode: "amortized" };
}

/** Refinance analysis. closingCosts = lender fees in USD. Returns payment + savings + break-even. */
export function refinanceAnalysis(balance: number, currentRate: number, newRate: number, remainingMonths: number, closingCosts: number) {
  const curPayment = monthlyPayment(balance, currentRate, remainingMonths);
  const newPayment = monthlyPayment(balance, newRate, remainingMonths);
  const monthlySavings = Math.max(0, curPayment - newPayment);
  const curInterest = curPayment * remainingMonths - balance;
  const newInterest = newPayment * remainingMonths - balance;
  const interestSaved = Math.max(0, curInterest - newInterest);
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;
  return {
    currentPayment: round2(curPayment),
    newPayment: round2(newPayment),
    monthlySavings: round2(monthlySavings),
    breakEvenMonths,
    totalInterestCurrent: round2(curInterest),
    totalInterestNew: round2(newInterest),
    interestSaved: round2(interestSaved),
  };
}

/** Retirement projection: future value of savings + contributions; 4% rule monthly income. */
export function retirementProjection(currentAge: number, retireAge: number, savings: number, monthlyContribution: number, annualReturnPct: number) {
  const years = Math.max(0, retireAge - currentAge);
  const months = years * 12;
  const r = annualReturnPct / 100 / 12;
  let balance = savings;
  let totalContributions = savings;
  for (let m = 0; m < months; m++) {
    balance = balance * (1 + r) + monthlyContribution;
    totalContributions += monthlyContribution;
  }
  return {
    years,
    balanceAtRetirement: round2(balance),
    totalContributions: round2(totalContributions),
    investmentGrowth: round2(balance - totalContributions),
    monthlyIncome4pct: round2(balance * 0.04 / 12),
  };
}

/** Credit card minimum payment path: min = max(minPct * balance, minFlat). */
export function creditCardMinPayment(balance: number, apr: number, minPct = 0.02, minFlat = 25) {
  const r = apr / 100 / 12;
  let b = balance;
  let interestTotal = 0;
  let months = 0;
  let totalPaid = 0;
  while (b > 0 && months < 600) {
    months++;
    const interest = b * r;
    let payment = Math.max(b * minPct, minFlat);
    if (payment > b + interest) payment = b + interest;
    b = Math.max(0, b + interest - payment);
    interestTotal += interest;
    totalPaid += payment;
  }
  return { months, totalInterest: round2(interestTotal), totalPaid: round2(totalPaid) };
}

/** Child support rough estimate (income-share style % of non-custodial income). State-specific. */
export function childSupportEstimate(ncpIncome: number, _custodialIncome: number, numKids: number) {
  const pct = numKids <= 0 ? 0 : numKids === 1 ? 0.2 : numKids === 2 ? 0.25 : 0.3;
  return { monthly: round2(ncpIncome * pct), pct: Math.round(pct * 100), note: "Rough guideline — check your state's official calculator" };
}

/** Concrete slab: cubic yards + 60/80lb bag counts + material cost estimate ($/yd). */
export function concreteNeeds(lengthFt: number, widthFt: number, thicknessIn: number, pricePerYard = 150) {
  const cubicFeet = lengthFt * widthFt * (thicknessIn / 12);
  const cubicYards = cubicFeet / 27;
  const bags60 = Math.ceil(cubicFeet / 0.45); // ~0.45 cu ft per 60lb bag
  const bags80 = Math.ceil(cubicFeet / 0.6); // ~0.6 cu ft per 80lb bag
  return {
    cubicFeet: round2(cubicFeet),
    cubicYards: round2(cubicYards),
    bags60,
    bags80,
    cost: round2(cubicYards * pricePerYard),
  };
}

/** TDEE via Mifflin-St Jeor BMR + activity multiplier. heightCm, weightKg. */
export function tdee(age: number, gender: "male" | "female", heightCm: number, weightKg: number, activity: number) {
  const bmr = gender === "male" ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5 : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const maintenance = bmr * activity;
  return {
    bmr: round2(bmr),
    tdee: round2(maintenance),
    cut: round2(maintenance - 500),
    bulk: round2(maintenance + 300),
  };
}

/** Water intake: 35ml/kg base + 12oz per 30 min exercise. */
export function waterIntake(weightKg: number, exerciseMin: number) {
  const baseMl = weightKg * 35;
  const extraOz = Math.floor(exerciseMin / 30) * 12;
  const totalOz = baseMl * 0.033814 + extraOz;
  return { ounces: round2(totalOz), liters: round2(totalOz * 0.0295735), cups: round2(totalOz / 8) };
}

/** Sleep cycles: best bedtimes for a wake time (90-min cycles). */
export function sleepCycles(wakeHour: number, wakeMin: number) {
  const wakeTotal = (wakeHour * 60 + wakeMin) % 1440;
  const cycles = [6, 5, 4].map((c) => {
    let bed = wakeTotal - c * 90;
    if (bed < 0) bed += 1440;
    const h = Math.floor(bed / 60) % 24;
    const m = bed % 60;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return { cycles: c, bedtime: `${h12}:${String(m).padStart(2, "0")} ${period}` };
  });
  return cycles;
}

/** US Navy body fat formula. All measurements in cm. */
export function bodyFat(gender: "male" | "female", heightCm: number, waistCm: number, neckCm: number, hipCm: number) {
  let pct: number;
  if (gender === "male") {
    pct = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    pct = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
  }
  pct = Math.max(2, Math.min(60, pct));
  const category = pct < 6 ? "Essential fat" : pct < 14 ? "Athletic" : pct < 18 ? "Fitness" : pct < 25 ? "Acceptable" : "Obese";
  return { pct: round2(pct), category };
}

/** Paint: wall area -> gallons (350 sq ft/gal), doors 20 / windows 15 sq ft deduction. */
export function paintNeeds(lengthFt: number, widthFt: number, heightFt: number, coats: number, doors: number, windows: number, pricePerGallon = 40) {
  const wallArea = Math.max(0, 2 * (lengthFt + widthFt) * heightFt - doors * 20 - windows * 15);
  const gallons = Math.ceil((wallArea * coats) / 350);
  return { wallArea: round2(wallArea), gallons, cost: round2(gallons * pricePerGallon) };
}

/** Mulch: area x depth -> cubic yards + 2 cu ft bags + cost. */
export function mulchNeeds(lengthFt: number, widthFt: number, depthIn: number, pricePerYard = 35) {
  const cubicFeet = lengthFt * widthFt * (depthIn / 12);
  const cubicYards = cubicFeet / 27;
  const bags = Math.ceil(cubicFeet / 2);
  return { cubicFeet: round2(cubicFeet), cubicYards: round2(cubicYards), bags, cost: round2(cubicYards * pricePerYard) };
}

/** US individual income percentile estimate (full-time earners, interpolated). */
export function salaryPercentile(annualIncome: number) {
  const points: [number, number][] = [
    [20000, 5], [30000, 20], [40000, 35], [50000, 50], [60000, 62],
    [75000, 72], [90000, 80], [110000, 88], [150000, 95], [200000, 97.5],
  ];
  if (annualIncome <= points[0][0]) return { percentile: 1, note: "Below ~5th percentile of full-time earners" };
  if (annualIncome >= points[points.length - 1][0]) return { percentile: 99, note: "Above ~97.5th percentile of full-time earners" };
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (annualIncome >= x0 && annualIncome <= x1) {
      const pct = y0 + ((annualIncome - x0) / (x1 - x0)) * (y1 - y0);
      return { percentile: Math.round(pct), note: "Estimate for individual full-time earners, all ages" };
    }
  }
  return { percentile: 50, note: "Estimate" };
}

/** Home affordability: max price via 28/36 rule with taxes+insurance (1.5%/yr of price). */
export function homeAffordability(income: number, monthlyDebt: number, downPayment: number, rate: number, years: number) {
  const monthlyIncome = income / 12;
  const housingBudget = Math.min(0.28 * monthlyIncome, 0.36 * monthlyIncome - monthlyDebt);
  const r = rate / 100 / 12;
  const n = years * 12;
  let price = housingBudget * years * 12;
  for (let i = 0; i < 20; i++) {
    const taxIns = price * 0.015 / 12;
    const pmiBudget = Math.max(0, housingBudget - taxIns);
    if (r === 0) {
      price = pmiBudget * n + downPayment;
    } else {
      const loan = (pmiBudget * (1 - Math.pow(1 + r, -n))) / r;
      price = loan + downPayment;
    }
  }
  const maxLoan = Math.max(0, price - downPayment);
  const payment = monthlyPayment(maxLoan, rate, n);
  return {
    maxPrice: round2(price),
    maxLoan: round2(maxLoan),
    monthlyPayment: round2(payment + price * 0.015 / 12),
    housingBudget: round2(housingBudget),
  };
}

/** GPA (4.0 scale). gradePoints map; entries = [{credits, gradePoints}]. */
export const GRADE_POINTS: Record<string, number> = {
  A: 4, "A-": 3.7, "B+": 3.3, B: 3, "B-": 2.7, "C+": 2.3, C: 2, "C-": 1.7, "D+": 1.3, D: 1, F: 0,
};

export function gpaCalculate(entries: { credits: number; points: number }[]) {
  let totalCredits = 0;
  let totalPoints = 0;
  for (const e of entries) {
    totalCredits += e.credits;
    totalPoints += e.credits * e.points;
  }
  return { gpa: totalCredits > 0 ? round2(totalPoints / totalCredits) : 0, totalCredits: round2(totalCredits) };
}

/** Due date via Naegele's rule: LMP + 280 days, adjusted for cycle length. */
export function dueDate(lmpMonth: number, lmpDay: number, lmpYear: number, cycleDays: number) {
  const lmp = new Date(lmpYear, lmpMonth - 1, lmpDay);
  const adjustment = Math.max(0, cycleDays - 28);
  const due = new Date(lmp.getTime() + (280 + adjustment) * 86400000);
  const now = new Date();
  const daysPregnant = Math.max(0, Math.floor((now.getTime() - lmp.getTime()) / 86400000));
  const weeks = Math.floor(daysPregnant / 7);
  const days = daysPregnant % 7;
  const trimester = weeks < 14 ? "First" : weeks < 28 ? "Second" : "Third";
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return { dueDate: fmt(due), gestationalWeeks: weeks, gestationalDays: days, trimester };
}

/** Final exam score needed: (desired - current*(1-w)) / w. */
export function examScoreNeeded(current: number, desired: number, weightPct: number) {
  const w = weightPct / 100;
  const needed = (desired - current * (1 - w)) / w;
  return { needed: round2(needed), possible: needed <= 100, percent: weightPct };
}

/** Percentage: mode 'of' = a% of b; mode 'iswhat' = a is what % of b; mode 'change' = % change a->b. */
export function percentageCalc(mode: "of" | "iswhat" | "change", a: number, b: number) {
  if (mode === "of") return { value: round2((a / 100) * b), label: `${a}% of ${b}` };
  if (mode === "iswhat") return { value: round2(b !== 0 ? (a / b) * 100 : 0), label: `${a} is what % of ${b}` };
  return { value: round2(a !== 0 ? ((b - a) / a) * 100 : 0), label: `% change ${a} → ${b}` };
}

/** Compound interest with optional monthly contribution. */
export function compoundInterest(principal: number, rate: number, years: number, compoundsPerYear: number, monthlyContribution = 0) {
  const r = rate / 100 / compoundsPerYear;
  const n = compoundsPerYear * years;
  const base = principal * Math.pow(1 + r, n);
  const contrib = monthlyContribution > 0
    ? monthlyContribution * ((Math.pow(1 + r, n) - 1) / r)
    : 0;
  const future = base + contrib;
  const totalContributions = principal + monthlyContribution * n;
  return {
    futureValue: round2(future),
    totalContributions: round2(totalContributions),
    interestEarned: round2(future - totalContributions),
  };
}

/** CD maturity: principal, APY, months, compounding per year. */
export function cdMaturity(principal: number, apy: number, months: number, compoundsPerYear = 12) {
  const years = months / 12;
  const r = apy / 100 / compoundsPerYear;
  const n = compoundsPerYear * years;
  const maturity = principal * Math.pow(1 + r, n);
  return { maturity: round2(maturity), interest: round2(maturity - principal), apy, months };
}

/** Overtime pay: regular rate x hours; 1.5x and 2x overtime hours. */
export function overtimePay(rate: number, regularHours: number, ot1xHours: number, ot2xHours: number) {
  const regular = rate * regularHours;
  const ot1x = rate * 1.5 * ot1xHours;
  const ot2x = rate * 2 * ot2xHours;
  return { regular: round2(regular), overtime: round2(ot1x + ot2x), total: round2(regular + ot1x + ot2x) };
}

/** Tip: bill, tip %, split between N people. */
export function tipCalc(bill: number, tipPct: number, split: number) {
  const tip = bill * (tipPct / 100);
  const total = bill + tip;
  return { tip: round2(tip), total: round2(total), perPerson: round2(total / Math.max(1, split)) };
}

/** Standard amortized loan payment: principal, annual rate %, term months. */
export function amortizedPayment(principal: number, ratePct: number, termMonths: number) {
  const r = ratePct / 100 / 12;
  if (r === 0) return { payment: round2(principal / Math.max(1, termMonths)), totalInterest: 0, totalPaid: principal };
  const n = Math.max(1, termMonths);
  const payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPaid = payment * n;
  return { payment: round2(payment), totalInterest: round2(totalPaid - principal), totalPaid: round2(totalPaid) };
}

/** Savings goal: months to reach goal with starting balance + monthly contributions + annual return. */
export function savingsGoal(goal: number, current: number, monthly: number, ratePct: number) {
  const r = ratePct / 100 / 12;
  let bal = current;
  let months = 0;
  const maxMonths = 1200;
  while (bal < goal && months < maxMonths) {
    bal = bal * (1 + r) + monthly;
    months++;
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return { months, years, remMonths, finalBalance: round2(bal), contributed: round2(current + monthly * months) };
}

/** Net worth: assets minus liabilities. */
export function netWorth(assets: number, liabilities: number) {
  return { netWorth: round2(assets - liabilities), assets: round2(assets), liabilities: round2(liabilities) };
}

/** Hourly rate to annual salary (and reverse). */
export function hourlyToSalary(hourly: number, hoursPerWeek: number, weeksPerYear = 52) {
  const annual = hourly * hoursPerWeek * weeksPerYear;
  return { annual: round2(annual), monthly: round2(annual / 12), weekly: round2(hourly * hoursPerWeek) };
}

/** Fuel cost for a trip. */
export function gasCost(miles: number, mpg: number, pricePerGallon: number) {
  const gallons = miles / Math.max(1, mpg);
  return { gallons: round2(gallons), cost: round2(gallons * pricePerGallon) };
}

/** Square footage of a rectangle. */
export function squareFootage(lengthFt: number, widthFt: number) {
  return { squareFeet: round2(lengthFt * widthFt), squareYards: round2((lengthFt * widthFt) / 9) };
}

/** Electricity cost: watts x hours/day x days x rate. */
export function electricityCost(watts: number, hoursPerDay: number, days: number, ratePerKwh: number) {
  const kwh = (watts * hoursPerDay * days) / 1000;
  return { kwh: round2(kwh), cost: round2(kwh * ratePerKwh), dailyKwh: round2((watts * hoursPerDay) / 1000) };
}

/** BMI (imperial): 703 * lb / in^2. */
export function bmiCalc(weightLb: number, heightIn: number) {
  const bmi = (703 * weightLb) / (heightIn * heightIn);
  let category = "Normal weight";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  return { bmi: round2(bmi), category };
}

/** Simple interest: P*r*t (no compounding). */
export function simpleInterest(principal: number, ratePct: number, years: number) {
  const interest = principal * (ratePct / 100) * years;
  return { interest: round2(interest), total: round2(principal + interest) };
}

/** 50/30/20 budget split from monthly take-home. */
export function budgetSplit(netMonthly: number) {
  return { needs: round2(netMonthly * 0.5), wants: round2(netMonthly * 0.3), savings: round2(netMonthly * 0.2) };
}

/** Discount: price minus % off. */
export function discountPrice(price: number, pct: number) {
  const savings = price * (pct / 100);
  return { savings: round2(savings), finalPrice: round2(price - savings) };
}

/** Sales tax: price plus tax at given combined rate %. */
export function salesTaxAmount(price: number, pct: number) {
  const tax = price * (pct / 100);
  return { tax: round2(tax), total: round2(price + tax) };
}

/** Inflation: what amount is worth after N years at given annual rate. */
export function inflationValue(amount: number, ratePct: number, years: number) {
  const futureValue = amount * Math.pow(1 + ratePct / 100, years);
  return { futureValue: round2(futureValue), lossPct: round2((1 - amount / futureValue) * 100) };
}

/** MPG: miles per gallon. */
export function mpgCalc(miles: number, gallons: number) {
  return { mpg: round2(miles / Math.max(0.001, gallons)), miles: round2(miles), gallons: round2(gallons) };
}

/** Rent vs buy over N years. Buy: monthly payment + 1% maintenance + property tax; appreciation on price. */
export function rentVsBuy(rentMonthly: number, price: number, downPct: number, ratePct: number, years: number, rentGrowthPct: number, appreciationPct: number) {
  const n = 360; // standard 30-year mortgage term for the payment math
  const horizon = Math.max(1, years * 12);
  const down = price * (downPct / 100);
  const principal = price - down;
  const r = ratePct / 100 / 12;
  let payment = principal;
  if (r > 0) payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const propTax = price * 0.011 / 12;
  const maintenance = price * 0.01 / 12;
  const buyMonthly = payment + propTax + maintenance;
  let rent = rentMonthly;
  let rentTotal = 0;
  for (let i = 0; i < horizon; i++) {
    rentTotal += rent;
    rent *= (1 + rentGrowthPct / 100 / 12);
  }
  const buyTotal = buyMonthly * horizon + down;
  const homeValue = price * Math.pow(1 + appreciationPct / 100, years);
  return {
    buyMonthly: round2(buyMonthly),
    rentTotal: round2(rentTotal),
    buyTotal: round2(buyTotal),
    homeValue: round2(homeValue),
    diff: round2(buyTotal - rentTotal),
    rentStartsAt: round2(rent),
  };
}

/** 401k projection with employer match (match % of your contribution, capped at % of salary). */
export function retirement401k(current: number, monthlyOwn: number, matchPct: number, matchCapPct: number, salary: number, ratePct: number, years: number) {
  const monthlyCap = (salary / 12) * (matchCapPct / 100);
  const match = Math.min(monthlyOwn, monthlyCap) * (matchPct / 100);
  const totalMonthly = monthlyOwn + match;
  const r = ratePct / 100 / 12;
  let bal = current;
  const n = Math.max(1, years * 12);
  for (let i = 0; i < n; i++) bal = bal * (1 + r) + totalMonthly;
  return { balance: round2(bal), monthlyTotal: round2(totalMonthly), monthlyMatch: round2(match) };
}

/** Emergency fund target. */
export function emergencyFund(monthlyExpenses: number, months: number) {
  return { target: round2(monthlyExpenses * months) };
}

/** Closing costs: % of home price (typical 2-5%). */
export function closingCosts(price: number, pct: number) {
  const costs = price * (pct / 100);
  return { costs: round2(costs), totalCash: round2(price + costs) };
}

/** Car affordability: max loan amount from monthly budget (reverse amortization). */
export function carAffordability(payment: number, ratePct: number, months: number, downPayment: number) {
  const r = ratePct / 100 / 12;
  let principal = payment * months;
  if (r > 0) principal = payment * (1 - Math.pow(1 + r, -months)) / r;
  return { loanAmount: round2(principal), carPrice: round2(principal + downPayment), totalPaid: round2(payment * months) };
}

/** Dividend income: annual income from a yield, and balance after N years reinvesting. */
export function dividendIncome(investment: number, yieldPct: number, years: number, reinvest: boolean) {
  const annual = investment * (yieldPct / 100);
  let bal = investment;
  if (reinvest) {
    const r = yieldPct / 100;
    for (let i = 0; i < years; i++) bal = bal * (1 + r);
  }
  return { annualIncome: round2(annual), monthlyIncome: round2(annual / 12), balanceAfterYears: reinvest ? round2(bal) : round2(investment) };
}

/** Property tax: annual and monthly from home value and effective rate %. */
export function propertyTax(homeValue: number, ratePct: number) {
  const annual = homeValue * (ratePct / 100);
  return { annual: round2(annual), monthly: round2(annual / 12) };
}

/** Capital gains tax: short-term (ordinary income) vs long-term (0/15/20) on gain. */
export function capitalGains(gain: number, taxableIncome: number, holding: "short" | "long") {
  let tax = 0;
  if (holding === "short") {
    const t = federalTax(taxableIncome + gain, "single");
    const t0 = federalTax(taxableIncome, "single");
    tax = Math.max(0, t.tax - t0.tax);
  } else {
    if (taxableIncome + gain <= 47025) tax = 0;
    else if (taxableIncome <= 47025 && taxableIncome + gain > 47025) tax = (taxableIncome + gain - 47025) * 0.15;
    else if (taxableIncome + gain <= 518900) tax = gain * 0.15;
    else tax = gain * 0.2;
  }
  return { tax: round2(tax), net: round2(gain - tax), effectiveRate: round2((tax / Math.max(1, gain)) * 100) };
}

/** Annual salary to hourly wage. */
export function salaryToHourly(annual: number, hoursPerWeek: number, weeksPerYear = 52) {
  const hourly = annual / Math.max(1, hoursPerWeek * weeksPerYear);
  return { hourly: round2(hourly), weekly: round2(annual / Math.max(1, weeksPerYear)), monthly: round2(annual / 12) };
}

/** Amortization SUMMARY: payment, interest, total, payoff time (full schedule lives in amortizationSchedule). */
export function amortizationSummary(principal: number, ratePct: number, years: number) {
  const n = Math.max(1, Math.round(years * 12));
  const r = ratePct / 100 / 12;
  if (r === 0) return { payment: round2(principal / n), totalInterest: 0, totalPaid: principal, months: n, years: Math.round(n / 12) };
  const payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPaid = payment * n;
  return { payment: round2(payment), totalInterest: round2(totalPaid - principal), totalPaid: round2(totalPaid), months: n, years: Math.round(n / 12) };
}

/** ROI: gain on investment, annualized. */
export function roiCalc(investment: number, gain: number, years: number) {
  const roi = (gain / Math.max(1, investment)) * 100;
  const annualized = years > 0 ? (Math.pow(1 + roi / 100, 1 / years) - 1) * 100 : 0;
  return { roi: round2(roi), annualized: round2(annualized) };
}

/** Markup: cost + % on top. */
export function markupCalc(cost: number, markupPct: number) {
  const profit = cost * (markupPct / 100);
  return { profit: round2(profit), price: round2(cost + profit) };
}

/** Margin: price from cost at target margin % (margin = profit / price). */
export function marginCalc(cost: number, marginPct: number) {
  const price = cost / Math.max(0.001, 1 - marginPct / 100);
  return { price: round2(price), profit: round2(price - cost) };
}

/** 529 college savings projection vs target cost. */
export function college529(current: number, monthly: number, ratePct: number, years: number, collegeCost: number) {
  const r = ratePct / 100 / 12;
  let bal = current;
  const n = Math.max(1, years * 12);
  for (let i = 0; i < n; i++) bal = bal * (1 + r) + monthly;
  return { balance: round2(bal), shortfall: round2(Math.max(0, collegeCost - bal)), cost: round2(collegeCost) };
}

/** Home equity + loan-to-value. */
export function homeEquity(homeValue: number, loanBalance: number) {
  const equity = homeValue - loanBalance;
  const ltv = (loanBalance / Math.max(1, homeValue)) * 100;
  return { equity: round2(equity), ltv: round2(ltv) };
}

/** Marginal bracket + effective rate from federal tax. */
export function taxBracketCalc(income: number, filing: "single" | "married" = "single") {
  const t = federalTax(income, filing);
  const effective = income > 0 ? (t.tax / income) * 100 : 0;
  let marginal = 0;
  const brackets = filing === "married"
    ? [[23200, 10], [94300, 12], [201050, 22], [383900, 24], [487450, 32], [731200, 35], [Infinity, 37]]
    : [[11600, 10], [47150, 12], [100525, 22], [191950, 24], [243725, 32], [609350, 35], [Infinity, 37]];
  const taxable = Math.max(0, income - t.stdDeduction);
  for (const [cap, rate] of brackets) {
    if (taxable <= cap) { marginal = rate; break; }
  }
  return { tax: t.tax, marginal: marginal, effective: round2(effective), taxable: round2(taxable) };
}

/** Investment projection: initial + monthly contributions. */
export function investmentReturn(initial: number, monthly: number, ratePct: number, years: number) {
  const r = ratePct / 100 / 12;
  let bal = initial;
  const n = Math.max(1, years * 12);
  for (let i = 0; i < n; i++) bal = bal * (1 + r) + monthly;
  return { balance: round2(bal), invested: round2(initial + monthly * n), growth: round2(bal - (initial + monthly * n)) };
}

/** Rule of 72: years to double. */
export function ruleOf72(ratePct: number) {
  return { years: round2(72 / Math.max(0.1, ratePct)) };
}

/** Salary raise: new salary + weekly/monthly delta. */
export function salaryRaise(salary: number, raisePct: number) {
  const newSalary = salary * (1 + raisePct / 100);
  return { newSalary: round2(newSalary), monthlyDelta: round2((newSalary - salary) / 12), weeklyDelta: round2((newSalary - salary) / 52) };
}

/** Loan payoff with extra monthly payments: base payment, months saved, interest saved. */
export function loanWithExtra(principal: number, ratePct: number, termMonths: number, extraMonthly: number) {
  const r = ratePct / 100 / 12;
  const base = r === 0 ? principal / Math.max(1, termMonths) : (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  const monthly = base + Math.max(0, extraMonthly);
  let bal = principal;
  let months = 0;
  let totalInterest = 0;
  const maxMonths = 1200;
  while (bal > 0 && months < maxMonths) {
    const interest = bal * r;
    totalInterest += interest;
    bal = bal + interest - monthly;
    if (bal < 0) bal = 0;
    months++;
  }
  const baseInterest = r === 0 ? 0 : base * termMonths - principal;
  return {
    payment: Math.round(base * 100) / 100,
    months,
    years: Math.floor(months / 12),
    remMonths: months % 12,
    totalInterest: Math.round(totalInterest * 100) / 100,
    interestSaved: Math.round(Math.max(0, baseInterest - totalInterest) * 100) / 100,
  };
}

/** Multi-debt snowball/avalanche: order list, months to clear, total interest paid. */
export function debtSnowball(debts: { name: string; balance: number; apr: number; min: number }[], monthlyBudget: number, method: "snowball" | "avalanche") {
  const list = debts.map((d) => ({ ...d, balance: Math.max(0, d.balance), apr: Math.max(0, d.apr), min: Math.max(0, d.min) }));
  list.sort(method === "avalanche" ? (a, b) => b.apr - a.apr : (a, b) => a.balance - b.balance);
  let month = 0;
  let totalInterest = 0;
  let extraPool = Math.max(0, monthlyBudget - list.reduce((s, d) => s + d.min, 0));
  const maxMonths = 1200;
  while (list.some((d) => d.balance > 0) && month < maxMonths) {
    month++;
    let pool = extraPool;
    for (const d of list) {
      if (d.balance <= 0) continue;
      const interest = (d.balance * d.apr) / 100 / 12;
      totalInterest += interest;
      d.balance += interest;
      const payment = d.min + pool;
      d.balance = Math.max(0, d.balance - payment);
      if (d.balance <= 0) pool += Math.abs(d.balance) === 0 ? d.min + pool - (d.min + pool) : 0; // keep simple: leftover of this payment rolls
    }
    // roll freed minimums: recompute extra pool for next month
    extraPool = Math.max(0, monthlyBudget - list.reduce((s, d) => s + (d.balance > 0 ? d.min : 0), 0));
    if (month > 1 && extraPool > 0) extraPool += 0; // minimums freed already reflected
  }
  const years = Math.floor(month / 12);
  return { months: month, years, remMonths: month % 12, totalInterest: Math.round(totalInterest * 100) / 100 };
}

/** Social Security rough monthly benefit (PIA approximation) — clearly labeled estimate. */
export function socialSecurityEstimate(ageNow: number, retireAge: number, annualIncome: number) {
  const aime = annualIncome / 12;
  // 2026 bend points
  const bend1 = Math.min(aime, 1174) * 0.9;
  const bend2 = Math.max(0, Math.min(aime, 7078) - 1174) * 0.32;
  const bend3 = Math.max(0, aime - 7078) * 0.15;
  const pia = bend1 + bend2 + bend3;
  const factor = retireAge < 67 ? 1 - (67 - retireAge) * 5 / 900 : retireAge > 70 ? 1.32 : retireAge > 67 ? 1 + (retireAge - 67) * 8 / 100 : 1;
  return { monthly: Math.round(pia * factor), annual: Math.round(pia * factor * 12), pia: Math.round(pia) };
}

/** Car lease vs buy over lease term. */
export function leaseVsBuy(carPrice: number, leaseTermMonths: number, leasePayment: number, residualPct: number, buyRatePct: number, buyTermMonths: number, downPayment: number) {
  const residual = carPrice * (residualPct / 100);
  const leaseTotal = leasePayment * leaseTermMonths + downPayment;
  const r = buyRatePct / 100 / 12;
  const principal = carPrice - downPayment;
  const payment = r === 0 ? principal / buyTermMonths : (principal * r * Math.pow(1 + r, buyTermMonths)) / (Math.pow(1 + r, buyTermMonths) - 1);
  const buyTotal = payment * buyTermMonths + downPayment;
  return { leaseTotal: round2(leaseTotal), buyTotal: round2(buyTotal), buyPayment: round2(payment), residual: round2(residual) };
}

/** Mortgage points: cost to buy points vs rate reduction. */
export function mortgagePoints(loanAmount: number, ratePct: number, points: number, termYears: number) {
  const pointCost = loanAmount * (points / 100);
  const reducedRate = ratePct - points * 0.25;
  const base = amortizedPayment(loanAmount, ratePct, termYears * 12);
  const reduced = amortizedPayment(loanAmount, Math.max(0, reducedRate), termYears * 12);
  const monthlySavings = base.payment - reduced.payment;
  const breakevenMonths = monthlySavings > 0 ? pointCost / monthlySavings : 0;
  return { pointCost: round2(pointCost), reducedRate: round2(Math.max(0, reducedRate)), monthlySavings: round2(monthlySavings), breakevenMonths: Math.round(breakevenMonths) };
}

/** Price per square foot. */
export function pricePerSqft(price: number, sqft: number) {
  return { pricePerSqft: round2(price / Math.max(1, sqft)) };
}

/** Construction cost estimate by sqft. */
export function constructionCost(sqft: number, costPerSqft: number) {
  return { total: round2(sqft * costPerSqft), perSqft: round2(costPerSqft) };
}

/** Calorie deficit: weeks to lose target pounds. */
export function calorieDeficit(tdee: number, calorieIntake: number, targetLb: number) {
  const deficit = Math.max(0, tdee - calorieIntake);
  const days = deficit > 0 ? (targetLb * 3500) / deficit : Infinity;
  const weeks = days / 7;
  return { deficit: round2(deficit), weeks: Math.round(weeks * 10) / 10, months: Math.round((weeks / 4.33) * 10) / 10, days: Math.round(days) };
}

/** Compare two loans side by side. */
export function loanCompare(a: { amount: number; rate: number; months: number }, b: { amount: number; rate: number; months: number }) {
  const ra = amortizedPayment(a.amount, a.rate, a.months);
  const rb = amortizedPayment(b.amount, b.rate, b.months);
  return { a: { payment: ra.payment, interest: ra.totalInterest, total: ra.totalPaid }, b: { payment: rb.payment, interest: rb.totalInterest, total: rb.totalPaid }, diff: round2(ra.payment - rb.payment) };
}

/** Savings rate: % of income saved. */
export function savingsRate(income: number, saved: number) {
  return { rate: round2((saved / Math.max(1, income)) * 100) };
}

/** Tax refund rough estimate: withheld vs actual federal tax. */
export function taxRefundEstimate(income: number, withheld: number, filing: "single" | "married" = "single") {
  const t = federalTax(income, filing);
  const diff = withheld - t.tax;
  return { refund: round2(Math.max(0, diff)), owed: round2(Math.max(0, -diff)), tax: t.tax };
}

/** Stock profit: buy vs sell price with commission %. */
export function stockProfit(shares: number, buyPrice: number, sellPrice: number, commissionPct: number) {
  const buy = shares * buyPrice;
  const sell = shares * sellPrice;
  const commission = (buy + sell) * (commissionPct / 100);
  const profit = sell - buy - commission;
  return { profit: round2(profit), roi: round2((profit / Math.max(1, buy)) * 100), buyTotal: round2(buy), sellTotal: round2(sell), commission: round2(commission) };
}

/** Investment property: monthly cash flow, cap rate, cash-on-cash return. */
export function investmentProperty(price: number, downPct: number, monthlyRent: number, monthlyExpenses: number, ratePct: number, termYears: number) {
  const down = price * (downPct / 100);
  const principal = price - down;
  const am = amortizedPayment(principal, ratePct, termYears * 12);
  const annualIncome = monthlyRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const annualDebt = am.payment * 12;
  const netOperating = annualIncome - annualExpenses;
  const cashFlow = netOperating - annualDebt;
  const capRate = (netOperating / Math.max(1, price)) * 100;
  const cashOnCash = down > 0 ? (cashFlow / down) * 100 : 0;
  return { monthlyPayment: am.payment, annualCashFlow: round2(cashFlow), monthlyCashFlow: round2(cashFlow / 12), capRate: round2(capRate), cashOnCash: round2(cashOnCash) };
}

/** Mortgage escrow: monthly property tax + insurance escrow. */
export function escrowEstimate(homePrice: number, downPct: number, propTaxRatePct: number, annualInsurance: number) {
  const loan = homePrice * (1 - downPct / 100);
  const propTax = homePrice * (propTaxRatePct / 100);
  return { monthlyEscrow: round2((propTax + annualInsurance) / 12), annualPropertyTax: round2(propTax), annualInsurance: round2(annualInsurance) };
}

/** Real estate commission. */
export function commissionCalc(salePrice: number, ratePct: number) {
  const commission = salePrice * (ratePct / 100);
  return { commission: round2(commission), netToSeller: round2(salePrice - commission) };
}

/** RMD: required minimum distribution using IRS uniform lifetime table (approx factors). */
export function rmdEstimate(balance: number, age: number) {
  const factors: Record<number, number> = { 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4 };
  const factor = factors[Math.min(100, Math.max(72, age))] ?? 27.4;
  return { rmd: round2(balance / factor), factor };
}

/** Savings bond estimate: face value growth at fixed rate, compounded semi-annually. */
export function savingsBondValue(faceValue: number, ratePct: number, years: number) {
  const value = faceValue * Math.pow(1 + ratePct / 100 / 2, years * 2);
  return { value: round2(value), gain: round2(value - faceValue) };
}
