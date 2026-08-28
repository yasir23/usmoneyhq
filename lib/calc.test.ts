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
