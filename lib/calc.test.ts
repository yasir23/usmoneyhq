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

console.log("ALL CALC TESTS PASS");
