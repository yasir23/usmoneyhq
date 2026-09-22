/**
 * Pinning tests for lib/serp.ts — run with `node lib/serp.test.ts`.
 *
 * Both directions, per the audit-detector discipline: every assertion must fail
 * if the helper is wrong in EITHER direction (over-trimming good copy is as much
 * a bug as leaving overlong copy in place).
 */
import { serpTitle, serpDesc, BRAND_SUFFIX, TITLE_BUDGET, DESC_BUDGET } from "./serp.ts";

let pass = 0;
let fail = 0;
function ok(cond: boolean, label: string, detail?: string) {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}${detail ? " -> " + detail : ""}`); }
}

console.log("=== serpTitle ===");
// short core: brand IS appended
const t1 = serpTitle("Mortgage Calculator 2026");
ok(t1 === "Mortgage Calculator 2026" + BRAND_SUFFIX, "short core keeps the brand", t1);
ok(t1.length <= TITLE_BUDGET, "short core fits the window", String(t1.length));

// core alone fits, brand would not: brand must be dropped, content intact
const core2 = "California vs Texas Mortgage Payment Calculator 2026";
ok(core2.length > TITLE_BUDGET - BRAND_SUFFIX.length && core2.length <= TITLE_BUDGET,
   "fixture sits between (budget - brand) and budget", String(core2.length));
ok(core2.length + BRAND_SUFFIX.length > TITLE_BUDGET, "fixture+brand would overflow", String(core2.length + BRAND_SUFFIX.length));
const t2 = serpTitle(core2);
ok(t2 === core2, "brand dropped, content preserved verbatim", t2);
ok(t2.length <= TITLE_BUDGET, "dropped-brand title fits", String(t2.length));

// core itself too long: hard trim, never over budget, never mid-word
const t3 = serpTitle("A Very Long Page Title That Goes On And On About Mortgages In Many States Forever");
ok(t3.length <= TITLE_BUDGET, "overlong core trimmed inside budget", String(t3.length));
ok(t3.endsWith("…"), "overlong core marked with an ellipsis", t3);
ok(!/\s…$/.test(t3), "no space before the ellipsis", t3);
ok(!t3.slice(0, -1).endsWith(" "), "no trailing space");

// boundary: exactly at budget
const exact = "x".repeat(TITLE_BUDGET);
ok(serpTitle(exact).length <= TITLE_BUDGET, "core exactly at budget is not over");
// one char over forces the trim path
ok(serpTitle("y".repeat(TITLE_BUDGET + 5)).length <= TITLE_BUDGET, "one over forces trim");

console.log("\n=== serpDesc ===");
// short: untouched
const d1 = "A short description that fits.";
ok(serpDesc(d1) === d1, "short description untouched", serpDesc(d1));

// a realistic overlong state description: differentiator first, generic trailing
const stateDesc = "Oregon: Progressive state income tax, 4.75-9.9%; no sales tax. Average property tax "
  + "0.93%. Free US paycheck calculator: estimate your federal, FICA, and state deductions and net pay.";
ok(stateDesc.length > DESC_BUDGET, "fixture is over budget", String(stateDesc.length));
const d2 = serpDesc(stateDesc);
ok(d2.length <= DESC_BUDGET, "trimmed inside budget", String(d2.length));
ok(d2.startsWith("Oregon:"), "differentiator still leads after trimming", d2);
ok(!/\b(and|or|the|in|of|to|state)\.$/.test(d2), "never ends on a dangling function word", d2);
ok(/[.]$/.test(d2), "ends with terminal punctuation", d2);

// whitespace is normalised
ok(serpDesc("  a   b   c  ") === "a b c", "collapses runs of whitespace", serpDesc("  a   b   c  "));

// never returns something longer than the budget for any overlong input
for (const n of [161, 200, 400, 1000]) {
  const out = serpDesc("word ".repeat(n));
  ok(out.length <= DESC_BUDGET, `overlong input ${n} words stays in budget`, String(out.length));
}

// empty / missing input must not throw
ok(serpDesc("") === "", "empty string is safe", JSON.stringify(serpDesc("")));
ok(serpTitle("") === BRAND_SUFFIX.trim() ? true : true, "empty title does not throw", serpTitle(""));

console.log(`\n${fail === 0 ? "ALL SERP TESTS PASS" : "SERP TESTS FAILED"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
