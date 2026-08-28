// lib/calc.test.js — run with: node lib/calc.test.js
const assert = require("assert");
const {
  monthlyPayment,
  amortizationSchedule,
  federalTax,
  fica,
  stateTax,
  NO_INCOME_TAX_STATES,
  round2,
} = require("./calc.js");

// $300k @ 6.5% / 30yr (360 mo) -> ~$1,896.20/mo (known value)
const p = monthlyPayment(300000, 6.5, 360);
assert.ok(Math.abs(p - 1896.2) < 1, `mortgage payment ${p} != ~1896`);

// 0% rate -> simple division
assert.ok(Math.abs(monthlyPayment(12000, 0, 12) - 1000) < 0.01);

// amortization totals: principal paid == original, interest > 0
const sched = amortizationSchedule(100000, 5, 120);
assert.strictEqual(sched.length, 120);
const totalPrincipal = round2(sched.reduce((a, r) => a + r.principal, 0));
assert.ok(Math.abs(totalPrincipal - 100000) < 1, `principal ${totalPrincipal}`);

// federal tax sanity: $0 income -> $0 tax
assert.strictEqual(federalTax(0).tax, 0);
// $75k single: taxable 60k -> 10%*11925 + 12%*(48475-11925) + 22%*(60000-48475) = 8114
const ft = federalTax(75000);
assert.ok(Math.abs(ft.tax - 8114) < 1, `federal ${ft.tax}`);

// FICA: $75k -> SS 4650 + MC 1087.5 = 5737.5
const f = fica(75000);
assert.ok(Math.abs(f.total - 5737.5) < 1, `fica ${f.total}`);

// state tax: TX = 0, CA = 5% of taxable
assert.strictEqual(stateTax(75000, "TX").tax, 0);
assert.ok(NO_INCOME_TAX_STATES.includes("TX"));
const ca = stateTax(75000, "CA");
assert.ok(ca.tax > 2900 && ca.tax < 3100, `CA ${ca.tax}`);

console.log("ALL CALC TESTS PASS");
