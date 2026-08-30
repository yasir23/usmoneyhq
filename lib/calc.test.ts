// lib/calc.test.ts — run with: node lib/calc.test.ts (Node 23.6+ type stripping)
import assert from "node:assert";
import {
  monthlyPayment,
  amortizationSchedule,
  federalTax,
  fica,
  stateTax,
  NO_INCOME_TAX_STATES,
  round2,
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
  daysBetween,
  timeDuration,
  mileageReimbursement,
  retirementAge,
  breakEven,
} from "./calc.ts";

// $300k @ 6.5% / 30yr (360 mo) -> ~$1,896.20/mo (known value)
const p = monthlyPayment(300000, 6.5, 360);
assert.ok(Math.abs(p - 1896.2) < 1, `mortgage payment ${p} != ~1896`);

// 0% rate -> simple division
assert.ok(Math.abs(monthlyPayment(12000, 0, 12) - 1000) < 0.01);

// amortization totals: principal paid == original
const sched = amortizationSchedule(100000, 5, 120);
assert.strictEqual(sched.length, 120);
const totalPrincipal = round2(sched.reduce((a, r) => a + r.principal, 0));
assert.ok(Math.abs(totalPrincipal - 100000) < 1, `principal ${totalPrincipal}`);

// federal tax: $0 -> $0; $75k single -> 8114
assert.strictEqual(federalTax(0).tax, 0);
const ft = federalTax(75000);
assert.ok(Math.abs(ft.tax - 8114) < 1, `federal ${ft.tax}`);

// FICA: $75k -> 5737.5
const f = fica(75000);
assert.ok(Math.abs(f.total - 5737.5) < 1, `fica ${f.total}`);

// state tax: TX = 0, CA ~ 5% of taxable
assert.strictEqual(stateTax(75000, "TX").tax, 0);
assert.ok(NO_INCOME_TAX_STATES.includes("TX"));
const ca = stateTax(75000, "CA");
assert.ok(ca.tax > 2900 && ca.tax < 3100, `CA ${ca.tax}`);

// paycheck: $75k single TX biweekly -> gross 2884.62; net in range
const pc = paycheckBreakdown(75000, "TX", "single", 26);
assert.ok(Math.abs(pc.gross - 2884.62) < 1, `gross ${pc.gross}`);
assert.ok(pc.net > 2200 && pc.net < 2800, `net ${pc.net}`);

// debt payoff: $10k @ 18% with $400/mo
const dp = debtPayoff(10000, 18, 400, 0);
assert.ok(dp.months > 28 && dp.months < 36, `months ${dp.months}`);
assert.ok(dp.totalInterest > 2200 && dp.totalInterest < 3000, `interest ${dp.totalInterest}`);

// dti: front 22.5%, back 31.25%
const dt = dti(8000, 1800, 700);
assert.ok(Math.abs(dt.frontRatio - 22.5) < 0.1, `front ${dt.frontRatio}`);
assert.ok(Math.abs(dt.backRatio - 31.25) < 0.1, `back ${dt.backRatio}`);

// pmi: $400k, 10% down -> PMI > 0, cancels in range; 20% down -> no PMI
const pmi = pmiCalculator(400000, 10, 6.5, 30);
assert.ok(Math.abs(pmi.loanAmount - 360000) < 1);
assert.ok(pmi.pmiMonthly > 100 && pmi.pmiMonthly < 200, `pmi ${pmi.pmiMonthly}`);
assert.ok(pmi.monthsUntilCancel != null && pmi.monthsUntilCancel > 100 && pmi.monthsUntilCancel < 180, `cancel ${pmi.monthsUntilCancel}`);
assert.strictEqual(pmiCalculator(400000, 20, 6.5, 30).hasPMI, false);

// heloc: $50k @ 7% interest-only -> 291.67/mo; amortized higher
const hl = helocPayment(50000, 7, 120, true);
assert.ok(Math.abs(hl.monthly - 291.67) < 0.5, `heloc ${hl.monthly}`);
const hla = helocPayment(50000, 7, 120, false);
assert.ok(hla.monthly > hl.monthly, `amortized ${hla.monthly}`);

// refinance: $300k, 7% -> 5.5%, 25yr, $6k closing -> savings > 0, break-even finite
const rf = refinanceAnalysis(300000, 7.0, 5.5, 300, 6000);
assert.ok(rf.currentPayment > rf.newPayment, `cur ${rf.currentPayment} vs new ${rf.newPayment}`);
assert.ok(rf.monthlySavings > 150 && rf.monthlySavings < 400, `savings ${rf.monthlySavings}`);
assert.ok(rf.breakEvenMonths > 10 && rf.breakEvenMonths < 40, `be ${rf.breakEvenMonths}`);
assert.ok(rf.interestSaved > 0);

// retirement: 30 -> 65, $25k now, $500/mo, 7% -> balance well above contributions
const rr = retirementProjection(30, 65, 25000, 500, 7);
assert.ok(rr.years === 35);
assert.ok(rr.balanceAtRetirement > rr.totalContributions, `bal ${rr.balanceAtRetirement} vs contrib ${rr.totalContributions}`);
assert.ok(rr.monthlyIncome4pct > 1000, `income ${rr.monthlyIncome4pct}`);

// credit card minimum: $8k @ 22% -> decades at minimum
const cc = creditCardMinPayment(8000, 22);
assert.ok(cc.months > 200, `min months ${cc.months}`);
assert.ok(cc.totalInterest > 10000, `min interest ${cc.totalInterest}`);

// child support: $5k/mo NCP, 2 kids -> 25% = $1,250
const cs = childSupportEstimate(5000, 3000, 2);
assert.ok(Math.abs(cs.monthly - 1250) < 1, `cs ${cs.monthly}`);

// concrete: 20x10x4in -> 66.7 ft³ = 2.47 yd³, ~148 60lb bags, ~$370 cost
const cc2 = concreteNeeds(20, 10, 4, 150);
assert.ok(Math.abs(cc2.cubicYards - 2.47) < 0.1, `yds ${cc2.cubicYards}`);
assert.ok(cc2.bags60 > 130 && cc2.bags60 < 170, `bags60 ${cc2.bags60}`);
assert.ok(Math.abs(cc2.cost - 370) < 20, `cost ${cc2.cost}`);

// tdee: 30y male, 5'10" (177.8cm), 180lb (81.6kg), moderate -> tdee ~2700-2900
const td = tdee(30, "male", 177.8, 81.6, 1.55);
assert.ok(td.bmr > 1700 && td.bmr < 1900, `bmr ${td.bmr}`);
assert.ok(td.tdee > 2600 && td.tdee < 3000, `tdee ${td.tdee}`);
assert.ok(td.cut === td.tdee - 500 && td.bulk === td.tdee + 300);

// water: 180lb (81.6kg), 30 min -> ~104 oz
const w = waterIntake(81.6, 30);
assert.ok(w.ounces > 90 && w.ounces < 120, `oz ${w.ounces}`);

// sleep: wake 6:30 AM -> 5 cycles (7.5h) = 11:00 PM bedtime
const sl = sleepCycles(6, 30);
assert.ok(sl.length === 3);
assert.ok(sl[1].cycles === 5 && sl[1].bedtime.includes("11:00"), `bed ${sl[1].bedtime}`);

// body fat (male): 70in, 34in waist, 15in neck -> ~15-25%
const bf = bodyFat("male", 177.8, 86.36, 38.1, 0);
assert.ok(bf.pct > 10 && bf.pct < 30, `bf ${bf.pct}`);
assert.ok(typeof bf.category === "string");

// paint: 14x12x8, 2 coats, 1 door, 2 windows -> ~2 gallons
const pt = paintNeeds(14, 12, 8, 2, 1, 2, 40);
assert.ok(pt.gallons >= 1 && pt.gallons <= 3, `gal ${pt.gallons}`);

// mulch: 20x10x3in -> 1.85 yd³, ~25 bags
const ml = mulchNeeds(20, 10, 3, 35);
assert.ok(Math.abs(ml.cubicYards - 1.85) < 0.1, `yds ${ml.cubicYards}`);
assert.ok(ml.bags > 20 && ml.bags < 30, `bags ${ml.bags}`);

// salary percentile: $50k -> ~50th; $150k -> ~95th
assert.ok(salaryPercentile(50000).percentile >= 45 && salaryPercentile(50000).percentile <= 55);
assert.ok(salaryPercentile(150000).percentile >= 93 && salaryPercentile(150000).percentile <= 97);

// home affordability: $120k income, $500 debt, $40k down, 6.5%, 30yr -> price > $400k
const ha = homeAffordability(120000, 500, 40000, 6.5, 30);
assert.ok(ha.maxPrice > 350000 && ha.maxPrice < 550000, `price ${ha.maxPrice}`);
assert.ok(ha.housingBudget > 2000 && ha.housingBudget < 3200, `budget ${ha.housingBudget}`);

// gpa: 3 credits A + 3 credits B -> 3.5
const gpa = gpaCalculate([{ credits: 3, points: GRADE_POINTS.A }, { credits: 3, points: GRADE_POINTS.B }]);
assert.ok(Math.abs(gpa.gpa - 3.5) < 0.01, `gpa ${gpa.gpa}`);

// due date: LMP Jan 15 2026, 28-day cycle -> due ~Oct 22 2026
const dd = dueDate(1, 15, 2026, 28);
assert.ok(dd.dueDate.includes("October"), `due ${dd.dueDate}`);
assert.ok(dd.trimester === "First" || dd.trimester === "Second" || dd.trimester === "Third");

// final grade: 82 current, 90 target, 30% weight -> need ~108.7 (impossible)
const eg = examScoreNeeded(82, 90, 30);
assert.ok(eg.needed > 100 && eg.possible === false, `needed ${eg.needed}`);
// 82 current, 90 target, 50% weight -> need 98
const eg2 = examScoreNeeded(82, 90, 50);
assert.ok(Math.abs(eg2.needed - 98) < 0.1 && eg2.possible === true, `needed2 ${eg2.needed}`);

// percentage: 15% of 200 = 30; 30 is 15% of 200; change 100->150 = +50%
assert.ok(Math.abs(percentageCalc("of", 15, 200).value - 30) < 0.01);
assert.ok(Math.abs(percentageCalc("iswhat", 30, 200).value - 15) < 0.01);
assert.ok(Math.abs(percentageCalc("change", 100, 150).value - 50) < 0.01);

// compound interest: $10k @ 7% / 20y monthly compounding, $200/mo -> ~$144.5k
const ci = compoundInterest(10000, 7, 20, 12, 200);
assert.ok(ci.futureValue > 130000 && ci.futureValue < 160000, `ci ${ci.futureValue}`);
assert.ok(ci.interestEarned > 0);

// cd: $25k @ 4.5% 12mo -> ~$26,148
const cd = cdMaturity(25000, 4.5, 12, 12);
assert.ok(cd.maturity > 25500 && cd.maturity < 27000, `cd ${cd.maturity}`);

// overtime: $25/hr, 40 reg + 5 at 1.5x -> regular 1000, ot 187.5, total 1187.5
const ot = overtimePay(25, 40, 5, 0);
assert.ok(Math.abs(ot.regular - 1000) < 0.01 && Math.abs(ot.overtime - 187.5) < 0.01 && Math.abs(ot.total - 1187.5) < 0.01);

// tip: $85.50 @ 18% split 2 -> tip 15.39, per person ~50.45
const tp = tipCalc(85.5, 18, 2);
assert.ok(Math.abs(tp.tip - 15.39) < 0.1, `tip ${tp.tip}`);
assert.ok(Math.abs(tp.perPerson - 50.45) < 0.1, `pp ${tp.perPerson}`);

console.log("ALL CALC TESTS PASS");

// === New tool batch (Phase 2): student loan, loan, savings goal, net worth, hourly, gas, sqft, electric, bmi, simple interest, budget ===
{
  const r = amortizedPayment(20000, 7.5, 60);
  assert.ok(r.payment > 380 && r.payment < 420, "loan 20k@7.5% 60mo payment ~$400");
  assert.ok(r.totalInterest > 3600 && r.totalInterest < 4600, "loan total interest ~$4,010");
  const z = amortizedPayment(10000, 0, 12);
  assert.strictEqual(z.payment, 833.33, "0% loan splits principal evenly");
}
{
  const r = savingsGoal(10000, 1000, 300, 4);
  assert.ok(r.months > 24 && r.months < 36, "goal ~29 months");
  assert.ok(r.finalBalance >= 10000, "final balance reaches goal");
  const slow = savingsGoal(50000, 0, 100, 0);
  assert.strictEqual(slow.months, 500, "zero-interest goal is pure math");
}
{
  const r = netWorth(150000, 60000);
  assert.strictEqual(r.netWorth, 90000);
  const neg = netWorth(5000, 12000);
  assert.strictEqual(neg.netWorth, -7000);
}
{
  const r = hourlyToSalary(22, 40, 52);
  assert.strictEqual(r.annual, 45760);
  assert.strictEqual(r.weekly, 880);
}
{
  const r = gasCost(250, 25, 4);
  assert.strictEqual(r.gallons, 10);
  assert.strictEqual(r.cost, 40);
}
{
  const r = squareFootage(15, 12);
  assert.strictEqual(r.squareFeet, 180);
  assert.strictEqual(r.squareYards, 20);
}
{
  const r = electricityCost(1500, 4, 30, 0.17);
  assert.strictEqual(r.kwh, 180);
  assert.strictEqual(r.cost, 30.6);
}
{
  const r = bmiCalc(170, 69);
  assert.ok(r.bmi > 24.9 && r.bmi < 25.2, "5'9 170lb BMI ~25.1");
  assert.ok(r.category === "Overweight" || r.category === "Normal weight", "category sanity");
  const under = bmiCalc(120, 70);
  assert.ok(under.category === "Underweight", "low BMI category");
}
{
  const r = simpleInterest(5000, 5, 3);
  assert.strictEqual(r.interest, 750);
  assert.strictEqual(r.total, 5750);
}
{
  const r = budgetSplit(4200);
  assert.strictEqual(r.needs, 2100);
  assert.strictEqual(r.wants, 1260);
  assert.strictEqual(r.savings, 840);
}

console.log("ALL PHASE 2 CALC TESTS PASS");

// === New tool batch (Phase 2): student loan, loan, savings goal, net worth, hourly, gas, sqft, electric, bmi, simple interest, budget ===
{
  const r = amortizedPayment(20000, 7.5, 60);
  assert.ok(r.payment > 380 && r.payment < 420, "loan 20k@7.5% 60mo payment ~$400");
  assert.ok(r.totalInterest > 3600 && r.totalInterest < 4600, "loan total interest ~$4,010");
  const z = amortizedPayment(10000, 0, 12);
  assert.strictEqual(z.payment, 833.33, "0% loan splits principal evenly");
}
{
  const r = savingsGoal(10000, 1000, 300, 4);
  assert.ok(r.months > 24 && r.months < 36, "goal ~29 months");
  assert.ok(r.finalBalance >= 10000, "final balance reaches goal");
  const slow = savingsGoal(50000, 0, 100, 0);
  assert.strictEqual(slow.months, 500, "zero-interest goal is pure math");
}
{
  const r = netWorth(150000, 60000);
  assert.strictEqual(r.netWorth, 90000);
  const neg = netWorth(5000, 12000);
  assert.strictEqual(neg.netWorth, -7000);
}
{
  const r = hourlyToSalary(22, 40, 52);
  assert.strictEqual(r.annual, 45760);
  assert.strictEqual(r.weekly, 880);
}
{
  const r = gasCost(250, 25, 4);
  assert.strictEqual(r.gallons, 10);
  assert.strictEqual(r.cost, 40);
}
{
  const r = squareFootage(15, 12);
  assert.strictEqual(r.squareFeet, 180);
  assert.strictEqual(r.squareYards, 20);
}
{
  const r = electricityCost(1500, 4, 30, 0.17);
  assert.strictEqual(r.kwh, 180);
  assert.strictEqual(r.cost, 30.6);
}
{
  const r = bmiCalc(170, 69);
  assert.ok(r.bmi > 24.9 && r.bmi < 25.2, "5'9 170lb BMI ~25.1");
  const under = bmiCalc(120, 70);
  assert.ok(under.category === "Underweight", "low BMI category");
}
{
  const r = simpleInterest(5000, 5, 3);
  assert.strictEqual(r.interest, 750);
  assert.strictEqual(r.total, 5750);
}
{
  const r = budgetSplit(4200);
  assert.strictEqual(r.needs, 2100);
  assert.strictEqual(r.wants, 1260);
  assert.strictEqual(r.savings, 840);
}

console.log("ALL PHASE 2 CALC TESTS PASS");

// === Phase 2b: discount, sales tax, inflation, mpg, rent-vs-buy, 401k, emergency fund, closing costs, car affordability, dividends ===
{
  const r = discountPrice(120, 25);
  assert.strictEqual(r.savings, 30);
  assert.strictEqual(r.finalPrice, 90);
}
{
  const r = salesTaxAmount(499, 8.82);
  assert.ok(r.tax > 43 && r.tax < 45, "CA ~8.82% on $499 = $44.01");
  assert.strictEqual(r.total, 543.01);
  const zero = salesTaxAmount(100, 0);
  assert.strictEqual(zero.total, 100);
}
{
  const r = inflationValue(10000, 3, 10);
  assert.ok(r.futureValue > 13400 && r.futureValue < 13450, "$10k at 3% for 10y = ~$13,439");
  assert.ok(r.lossPct > 25 && r.lossPct < 26, "purchasing power loss ~25.6%");
}
{
  const r = mpgCalc(320, 11.4);
  assert.ok(r.mpg > 28 && r.mpg < 28.1, "320/11.4 = 28.07 mpg");
}
{
  const r = rentVsBuy(1800, 350000, 20, 6.5, 10, 3, 3);
  assert.ok(r.buyMonthly > 2200 && r.buyMonthly < 3200, "buy monthly ~$2,700 incl tax/maint");
  assert.ok(r.rentTotal > 240000 && r.rentTotal < 260000, "10y rent ~$248k with growth");
  assert.ok(r.homeValue > 450000 && r.homeValue < 480000, "$350k at 3% for 10y = ~$470k");
}
{
  const r = retirement401k(25000, 500, 100, 6, 85000, 7, 25);
  assert.strictEqual(r.monthlyMatch, 425, "match capped at 6% of $85k / 12 = $425");
  assert.strictEqual(r.monthlyTotal, 925);
  assert.ok(r.balance > 700000 && r.balance < 900000, "25y at 7% with $925/mo + $25k start ~$800k");
  const noMatch = retirement401k(0, 500, 0, 0, 0, 0, 1);
  assert.strictEqual(noMatch.balance, 6000);
}
{
  const r = emergencyFund(3500, 6);
  assert.strictEqual(r.target, 21000);
}
{
  const r = closingCosts(350000, 3);
  assert.strictEqual(r.costs, 10500);
  assert.strictEqual(r.totalCash, 360500);
}
{
  const r = carAffordability(450, 7, 60, 3000);
  assert.ok(r.loanAmount > 22000 && r.loanAmount < 24000, "$450 @ 7% 60mo = ~$22.7k loan");
  assert.ok(r.carPrice > 25000 && r.carPrice < 27000, "car price ~$25.7k");
}
{
  const r = dividendIncome(50000, 3.5, 10, true);
  assert.strictEqual(r.annualIncome, 1750);
  assert.strictEqual(r.monthlyIncome, 145.83);
  assert.ok(r.balanceAfterYears > 70000 && r.balanceAfterYears < 71000, "DRIP 10y ~$70.5k");
  const cash = dividendIncome(50000, 3.5, 10, false);
  assert.strictEqual(cash.balanceAfterYears, 50000);
}

console.log("ALL PHASE 2B CALC TESTS PASS");

// === Phase 2c: property tax, capital gains, salary-to-hourly ===
{
  const r = propertyTax(350000, 1.8);
  assert.strictEqual(r.annual, 6300);
  assert.strictEqual(r.monthly, 525);
  const z = propertyTax(250000, 0.5);
  assert.strictEqual(z.annual, 1250);
}
{
  const r = capitalGains(20000, 60000, "long");
  assert.strictEqual(r.tax, 3000, "long-term 15% bracket on $20k gain");
  assert.strictEqual(r.net, 17000);
  assert.strictEqual(r.effectiveRate, 15);
  const z = capitalGains(10000, 30000, "long");
  assert.strictEqual(z.tax, 0, "0% long-term bracket");
  const s = capitalGains(10000, 60000, "short");
  assert.ok(s.tax > 0 && s.tax < 3000, "short-term taxed as ordinary income");
}
{
  const r = salaryToHourly(65000, 40, 52);
  assert.strictEqual(r.hourly, 31.25);
  assert.strictEqual(r.weekly, 1250);
  assert.strictEqual(r.monthly, 5416.67);
}

console.log("ALL PHASE 2C CALC TESTS PASS");

// === Phase 3: amortization summary, ROI, markup, margin, 529, home equity, tax bracket, investment, rule of 72, raise ===
{
  const r = amortizationSummary(250000, 6.5, 30);
  assert.ok(r.payment > 1570 && r.payment < 1590, "250k@6.5% 30y = $1,580.17");
  assert.ok(r.totalInterest > 318000 && r.totalInterest < 320000, "total interest ~$318,861");
  assert.strictEqual(r.years, 30);
}
{
  const r = roiCalc(10000, 2500, 3);
  assert.strictEqual(r.roi, 25);
  assert.ok(r.annualized > 7 && r.annualized < 8, "annualized ~7.7%");
}
{
  const r = markupCalc(50, 40);
  assert.strictEqual(r.profit, 20);
  assert.strictEqual(r.price, 70);
}
{
  const r = marginCalc(50, 33);
  assert.ok(r.price > 74 && r.price < 75, "50/0.67 = $74.63");
  assert.ok(r.profit > 24 && r.profit < 25);
}
{
  const r = college529(10000, 250, 6, 10, 120000);
  assert.ok(r.balance > 58000 && r.balance < 60000, "~$59.2k projected");
  assert.ok(r.shortfall > 60000 && r.shortfall < 62000, "shortfall vs $120k");
}
{
  const r = homeEquity(400000, 280000);
  assert.strictEqual(r.equity, 120000);
  assert.strictEqual(r.ltv, 70);
}
{
  const r = taxBracketCalc(85000, "single");
  assert.strictEqual(r.marginal, 22);
  assert.ok(r.tax > 10000 && r.tax < 11000, "$85k single federal ~$10,314");
  assert.ok(r.effective > 12 && r.effective < 13, "effective ~12.1%");
}
{
  const r = investmentReturn(10000, 300, 7, 20);
  assert.ok(r.balance > 190000 && r.balance < 210000, "~$196.7k after 20y");
  assert.strictEqual(r.invested, 82000);
}
{
  const r = ruleOf72(8);
  assert.strictEqual(r.years, 9);
}
{
  const r = salaryRaise(65000, 5);
  assert.strictEqual(r.newSalary, 68250);
  assert.strictEqual(r.monthlyDelta, 270.83);
}

console.log("ALL PHASE 3 CALC TESTS PASS");

// === Keyword-implementation tests: extra payments ===
{
  const r = loanWithExtra(30000, 7, 60, 50);
  assert.ok(r.payment > 590 && r.payment < 600, "base payment ~$594");
  assert.ok(r.months < 60 && r.months > 50, "extra payments shorten term");
  assert.ok(r.interestSaved > 400 && r.interestSaved < 700, "saves ~$533 in interest");
  const z = loanWithExtra(10000, 0, 12, 0);
  assert.strictEqual(z.months, 12, "0% loan with no extra = full term");
}

console.log("ALL KEYWORD-IMPL TESTS PASS");

// === Phase 4: social security, snowball, lease-vs-buy, points, price/sqft, construction, deficit, loan compare, savings rate, refund ===
{
  const r = socialSecurityEstimate(45, 67, 75000);
  assert.ok(r.monthly > 2500 && r.monthly < 2800, "$75k income PIA ~$2,681");
  const early = socialSecurityEstimate(45, 62, 75000);
  assert.ok(early.monthly < r.monthly, "claiming early reduces benefit");
}
{
  const r = debtSnowball([{ name: "A", balance: 1500, apr: 22, min: 60 }, { name: "B", balance: 5000, apr: 18, min: 150 }, { name: "C", balance: 12000, apr: 7, min: 250 }], 700, "snowball");
  assert.ok(r.months > 20 && r.months < 40, "snowball ~27 months");
  const av = debtSnowball([{ name: "A", balance: 1500, apr: 22, min: 60 }, { name: "B", balance: 5000, apr: 18, min: 150 }, { name: "C", balance: 12000, apr: 7, min: 250 }], 700, "avalanche");
  assert.ok(av.totalInterest <= r.totalInterest + 1, "avalanche <= snowball interest");
}
{
  const r = leaseVsBuy(35000, 36, 420, 55, 7, 60, 3000);
  assert.strictEqual(r.leaseTotal, 18120);
  assert.ok(r.buyPayment > 630 && r.buyPayment < 640, "buy payment ~$634");
}
{
  const r = mortgagePoints(300000, 6.5, 1, 30);
  assert.strictEqual(r.pointCost, 3000);
  assert.strictEqual(r.reducedRate, 6.25);
  assert.ok(r.monthlySavings > 40 && r.monthlySavings < 60, "~$49/mo saved");
  assert.ok(r.breakevenMonths > 50 && r.breakevenMonths < 70, "break-even ~61 months");
}
{
  const r = pricePerSqft(350000, 1800);
  assert.ok(r.pricePerSqft > 194 && r.pricePerSqft < 195, "~$194.44/sqft");
}
{
  const r = constructionCost(2000, 200);
  assert.strictEqual(r.total, 400000);
}
{
  const r = calorieDeficit(2400, 1900, 15);
  assert.strictEqual(r.deficit, 500);
  assert.ok(r.weeks > 14 && r.weeks < 16, "15lb at 500 cal/day = 15 weeks");
}
{
  const r = loanCompare({ amount: 20000, rate: 8, months: 60 }, { amount: 20000, rate: 6, months: 48 });
  assert.ok(r.a.payment > 400 && r.a.payment < 410, "A ~$405");
  assert.ok(r.b.payment > 465 && r.b.payment < 475, "B ~$470");
}
{
  const r = savingsRate(5000, 1000);
  assert.strictEqual(r.rate, 20);
}
{
  const r = taxRefundEstimate(75000, 9000, "single");
  assert.ok(r.tax > 8000 && r.tax < 8500, "$75k federal ~$8,114");
  assert.ok(r.refund > 500 && r.refund < 1000, "refund ~$886");
}

console.log("ALL PHASE 4 CALC TESTS PASS");

// === Phase 5: stock profit, investment property, escrow, commission, RMD, savings bonds ===
{
  const r = stockProfit(100, 50, 65, 0.5);
  assert.strictEqual(r.profit, 1442.5);
  assert.ok(r.roi > 28 && r.roi < 29, "ROI ~28.85%");
}
{
  const r = investmentProperty(250000, 20, 1800, 400, 7, 30);
  assert.ok(r.monthlyPayment > 1320 && r.monthlyPayment < 1340, "mortgage ~$1,330");
  assert.ok(r.capRate > 6.5 && r.capRate < 7.5, "cap rate ~7%");
}
{
  const r = escrowEstimate(350000, 20, 1.1, 1500);
  assert.ok(r.monthlyEscrow > 440 && r.monthlyEscrow < 460, "escrow ~$445/mo");
  assert.strictEqual(r.annualPropertyTax, 3850);
}
{
  const r = commissionCalc(400000, 5);
  assert.strictEqual(r.commission, 20000);
  assert.strictEqual(r.netToSeller, 380000);
}
{
  const r = rmdEstimate(500000, 73);
  assert.ok(r.rmd > 18000 && r.rmd < 19000, "RMD ~$18,868");
  assert.strictEqual(r.factor, 26.5);
}
{
  const r = savingsBondValue(1000, 2.5, 10);
  assert.ok(r.value > 1280 && r.value < 1290, "2.5% semiannual 10y = $1,282.43");
}

console.log("ALL PHASE 5 CALC TESTS PASS");

// === Phase 6: tile, fence, gravel, topsoil, carpet, wallpaper, sod, drywall, heart rate ===
{
  const r = tileNeeds(200, 12, 10);
  assert.strictEqual(r.tiles, 220);
  assert.strictEqual(r.boxes, 22);
}
{
  const r = fenceNeeds(120, 8);
  assert.strictEqual(r.panels, 15);
}
{
  const r = gravelNeeds(30, 12, 4, 45);
  assert.ok(r.cubicYards > 4.4 && r.cubicYards < 4.5, "30x12x4in = 4.44 yd");
  assert.ok(r.cost > 195 && r.cost < 205, "cost ~$200");
}
{
  const r = carpetNeeds(14, 12, 3.5);
  assert.strictEqual(r.sqft, 168);
  assert.strictEqual(r.sqYards, 18.67);
  assert.strictEqual(r.cost, 588);
}
{
  const r = wallpaperNeeds(12, 10, 8, 56);
  assert.strictEqual(r.wallArea, 352);
  assert.ok(r.rolls > 6 && r.rolls < 8, "~7 rolls");
}
{
  const r = sodNeeds(40, 25, 250);
  assert.strictEqual(r.sqft, 1000);
  assert.strictEqual(r.pallets, 3);
  assert.strictEqual(r.cost, 750);
}
{
  const r = drywallNeeds(12, 10, 8, 60);
  assert.strictEqual(r.sheets, 13);
}
{
  const r = heartRate(35, 65);
  assert.strictEqual(r.max, 185);
  assert.ok(r.targetLow > 120 && r.targetLow < 130, "Karvonen low ~125");
  assert.ok(r.targetHigh > 160 && r.targetHigh < 170, "Karvonen high ~167");
}

console.log("ALL PHASE 6 CALC TESTS PASS");

// === Phase 7: percent change, money lasts, moving cost, life insurance, remodel cost ===
{
  const r = percentChange(100, 125);
  assert.strictEqual(r.change, 25);
  const d = percentChange(50, 40);
  assert.strictEqual(d.change, -20);
}
{
  const r = moneyLasts(500000, 2500, 5);
  assert.ok(r.years > 30 && r.years < 40, "lasts ~36 years at 5%");
  const z = moneyLasts(100000, 10000, 0);
  assert.strictEqual(z.months, 10);
}
{
  const r = movingCost(50, 4, 50, 150);
  assert.strictEqual(r.total, 625);
}
{
  const r = lifeInsuranceNeeds(75000, 20, 250000, 15000, 50000);
  assert.strictEqual(r.incomeReplacement, 1050000);
  assert.strictEqual(r.needs, 1265000);
}
{
  const r = remodelCost("kitchen", 200, "mid");
  assert.strictEqual(r.low, 30000);
  assert.strictEqual(r.high, 50000);
}

console.log("ALL PHASE 7 CALC TESTS PASS");

// === Phase 8: date + time duration ===
{
  const r = daysBetween(2026, 1, 1, 2026, 12, 31);
  assert.strictEqual(r.days, 364);
  const leap = daysBetween(2024, 1, 1, 2025, 1, 1);
  assert.strictEqual(leap.days, 366);
}
{
  const r = timeDuration(9, 0, 17, 30);
  assert.strictEqual(r.hours, 8);
  assert.strictEqual(r.remMinutes, 30);
  const night = timeDuration(22, 0, 6, 0);
  assert.strictEqual(night.hours, 8);
}

console.log("ALL PHASE 8 CALC TESTS PASS");

// === Phase 9: mileage, retirement age, break-even ===
{
  const r = mileageReimbursement(100, 70);
  assert.strictEqual(r.reimbursement, 70);
  const r2 = mileageReimbursement(250, 70);
  assert.strictEqual(r2.reimbursement, 175);
}
{
  const r = retirementAge(1980);
  assert.strictEqual(r.fraMonths, 804); // 67
  assert.strictEqual(r.reductionPct, 30);
  const r2 = retirementAge(1954);
  assert.strictEqual(r2.fraLabel, "66");
}
{
  const r = breakEven(50000, 25, 10);
  assert.strictEqual(r.units, 3334);
  assert.strictEqual(r.contributionPerUnit, 15);
}

console.log("ALL PHASE 9 CALC TESTS PASS");
