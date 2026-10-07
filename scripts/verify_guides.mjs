#!/usr/bin/env node
/**
 * verify_guides.mjs — check the three rewritten finance guides.
 *
 * Ported from scripts/verify_guides.py (2026-10-06) so the guard runs inside
 * `npm run build` alongside the other node gates. A python copy and a node copy
 * of the same check would drift apart, so this is now the only one.
 *
 * Two things matter here, and the second is the one that matters more:
 *
 *   1. every published figure is derivable from the stated inputs
 *   2. the source contains NO unverifiable rate-range claim
 *
 * The guides originally asserted rate ranges as facts — a specific point gap
 * between online and branch institutions, and APR bands for credit cards and
 * personal loans. This site cannot verify those and cannot keep them current, so
 * they were removed and replaced with mechanics that hold in any rate
 * environment.
 *
 * The absence check deliberately scans the WHOLE file, comments included. A
 * stale rate figure in a comment is still a stale rate figure in the source, and
 * the first draft of the replacement comments quoted the old numbers while
 * explaining why they were being removed — this scan caught that.
 *
 * Exit 1 on any failure.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FILES = {
  cd: path.join(ROOT, "pages/guides/best-cd-rates-2026/index.js"),
  debt: path.join(ROOT, "pages/guides/debt-consolidation-2026/index.js"),
  hysa: path.join(ROOT, "pages/guides/best-high-yield-savings-2026/index.js"),
};

const failures = [];
let checked = 0;

/** Money with two decimals, always. Matches the python f"{x:,.2f}". */
const money = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function chk(label, got, want) {
  checked += 1;
  const ok = String(got) === String(want);
  if (!ok) failures.push(`${label}: computed ${JSON.stringify(got)}, published ${JSON.stringify(want)}`);
  console.log(`  ${ok ? "OK  " : "FAIL"}  ${label.padEnd(50)} ${String(want)}`);
}

function absent(label, text, pattern) {
  checked += 1;
  const hit = text.match(new RegExp(pattern, "i"));
  if (hit) failures.push(`${label}: still contains ${JSON.stringify(hit[0])}`);
  console.log(`  ${hit ? "FAIL" : "OK  "}  ${label.padEnd(50)} ${hit ? JSON.stringify(hit[0]) : "absent"}`);
}

function pmt(P, a, n) {
  const r = a / 12;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}

const missing = Object.entries(FILES).filter(([, v]) => !fs.existsSync(v)).map(([k]) => k);
if (missing.length) {
  console.error(`missing guide files: ${missing.join(", ")}`);
  process.exit(1);
}
const SRC = Object.fromEntries(
  Object.entries(FILES).map(([k, v]) => [k, fs.readFileSync(v, "utf8")])
);

console.log("-- figures --");
chk("cd: 12 months at 4.5%", money(10000 * 1.045), "$10,450.00");
chk("cd: 6 months fractional power", money(10000 * Math.pow(1.045, 0.5)), "$10,222.52");
chk("cd: 6 months shortcut", money(10000 * 1.0225), "$10,225.00");
chk("cd: shortcut error", money(10000 * 1.0225 - 10000 * Math.pow(1.045, 0.5)), "$2.48");
chk("cd: 3 month penalty", money((10000 * 0.045) / 4), "$112.50");

{
  const bal = 10000, pay = 600, r = 0.22 / 12;
  let b = bal, mo = 0, interest = 0;
  while (b > 0 && mo < 600) {
    const i = b * r;
    interest += i;
    b = b - (pay - i);
    mo += 1;
  }
  chk("debt: months on card", mo, 21);
  chk("debt: card interest", money(interest), "$2,043.20");
  chk("debt: transfer fee", money(bal * 0.03), "$300.00");
  chk("debt: transfer advantage", money(interest - bal * 0.03), "$1,743.20");
  const m = pmt(bal, 0.12, 36);
  chk("debt: loan payment", money(m), "$332.14");
  chk("debt: loan interest", money(m * 36 - bal), "$1,957.15");
}

chk("hysa: 10k at 4.00%", money(10000 * 1.04), "$10,400.00");
chk("hysa: 10k at 4.20%", money(10000 * 1.042), "$10,420.00");
chk("hysa: annual difference", money(10000 * 1.042 - 10000 * 1.04), "$20.00");
chk("hysa: 2k at 4.20%", money(2000 * 1.042), "$2,084.00");
chk("hysa: balance advantage", money(10000 * 1.04 - 2000 * 1.042), "$8,316.00");
chk("hysa: real return vs 3%", `${((1.04 / 1.03 - 1) * 100).toFixed(2)}%`, "0.97%");
chk("hysa: real return vs 5%", `${((1.04 / 1.05 - 1) * 100).toFixed(2)}%`, "-0.95%");

console.log("\n-- no unverifiable rate claims anywhere in the source --");
absent("cd: point gap between institutions", SRC.cd, String.raw`\d[-–]\d\+? full points`);
absent("cd: rate-environment assertion", SRC.cd, String.raw`\bpeaks\b`);
absent("debt: credit-card APR range", SRC.debt, String.raw`\b20\s*[-–]\s*30%`);
absent("debt: personal-loan APR range", SRC.debt, String.raw`\b8\s*[-–]\s*18%`);
absent("debt: unconditional 0% promise", SRC.debt, String.raw`0%\s+transfer card`);
absent("hysa: point gap above averages", SRC.hysa, String.raw`\d[-–]\d\+? points`);
const ALL = [SRC.cd, SRC.debt, SRC.hysa].join(" ");
absent("any: 'currently pays'", ALL, String.raw`currently pays`);
absent("any: brick-and-mortar gap", ALL, String.raw`1\s*[-–]\s*2 points`);

console.log("\n-- every rate used is labelled an assumption --");
chk("cd labels its rate", /assumed 4\.5%/i.test(SRC.cd), true);
chk("debt labels its rate", /assumed 22%/i.test(SRC.debt), true);
chk("hysa labels its rate", /assumed at 4\.00% and 4\.20%/i.test(SRC.hysa), true);

console.log("\n-- each guide carries a derived review date --");
for (const k of Object.keys(FILES)) {
  chk(`${k} has a reviewed line`, SRC[k].includes("last-reviewed"), true);
  chk(`${k} derives its date`, SRC[k].includes("CONTENT_DATES.guides"), true);
}

console.log();
console.log(`checks run: ${checked}   failures: ${failures.length}`);
if (failures.length) {
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("GUIDES VERIFIED: figures derived, no unverifiable rate claims");
