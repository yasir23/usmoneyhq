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
