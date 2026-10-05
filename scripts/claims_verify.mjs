#!/usr/bin/env node
/**
 * scripts/claims_verify.mjs — one financial claim, stated in four places, must agree.
 *
 * WHY THIS EXISTS
 *
 * How state income tax is computed is described in four independent places, and
 * they had drifted into three different accounts:
 *
 *   pages/methodology.js    "progressive states use a representative effective rate"
 *   pages/about.js          "computes with that state's actual rules"
 *   components/ToolPageShell "interpolated across their marginal range ... does NOT
 *                             model bracket thresholds, deductions, credits"
 *   public/llms.txt         "interpolated between their own lowest and highest
 *                             marginal rates ... excludes deductions, credits"
 *
 * Two were wrong in OPPOSITE directions. "Representative effective rate" makes a
 * state-specific interpolation sound like a national stand-in; "computes with that
 * state's actual rules" claims bracket-level accuracy the calculator does not have.
 * The second is the serious one: it is an accuracy claim on a financial site.
 *
 * This is the same drift class as the publisher id in ads.txt and "Ad-free across
 * all 733 pages" — one fact, several copies, no single source. A phrase-level check
 * is the cheapest guard that catches it, because the failure is semantic and no
 * type system or build step notices that two paragraphs describe different methods.
 *
 * WHAT IT ENFORCES
 *   1. Every place that describes the state-tax method must say progressive states
 *      are INTERPOLATED. That is the mechanism; any description lacking it is either
 *      vaguer than the code or claims more than it.
 *   2. No file may contain the specific phrases that got this wrong before.
 *
 * Deliberately narrow. A guard that fires on legitimate prose gets switched off, so
 * it checks for the presence of the mechanism and the absence of two known-wrong
 * wordings, rather than trying to parse meaning.
 *
 * KNOWN LIMIT — it is FILE-level, not description-level. A file must name the
 * mechanism somewhere; if a file carries several descriptions and one of them
 * drifts while another still names it, this passes. ToolPageShell.tsx genuinely does
 * carry three, and the fault-injection test asserts removal of EVERY mention in a
 * file for exactly that reason. Catching a single drifted sentence among several
 * would need semantic comparison, which is a different and much larger tool. The
 * realistic failure — someone rewrites a description without the mechanism — is
 * caught.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Every file that describes how state income tax is calculated. */
const DESCRIBERS = [
  "pages/methodology.js",
  "pages/about.js",
  "components/ToolPageShell.tsx",
  "public/llms.txt",
];

/**
 * The mechanism every description must name. Matches "interpolated between",
 * "interpolated across", "interpolation" — the wording may vary, the concept may not.
 */
const REQUIRED = /interpolat/i;

/** Wordings that were live and wrong. Absence is asserted, not presence. */
const FORBIDDEN = [
  {
    re: /representative effective rate/i,
    why: "makes a state-specific interpolation sound like a national stand-in",
  },
  {
    re: /that state(?:'|&apos;|’)s actual rules/i,
    why: "claims bracket-level accuracy the calculator does not have",
  },
  {
    re: /progressive states use a (?:flat|single)\b/i,
    why: "describes progressive states as flat, which is the bug that was fixed",
  },
];

const failures = [];
const notes = [];

for (const rel of DESCRIBERS) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel} is missing — it is one of the places this claim is stated.`);
    continue;
  }
  const body = fs.readFileSync(abs, "utf8");

  if (!REQUIRED.test(body)) {
    failures.push(
      `${rel} describes the state-tax method without saying progressive states are ` +
        `interpolated. Either it omits the mechanism or it describes something else.`
    );
  } else {
    notes.push(`${rel} — names the interpolation mechanism`);
  }

  for (const { re, why } of FORBIDDEN) {
    if (re.test(body)) {
      failures.push(`${rel} contains a rejected wording (${re}): ${why}`);
    }
  }
}

const line = "─".repeat(70);
console.log(`\n${line}\nCross-file claim consistency — state income tax method\n${line}\n`);
for (const n of notes) console.log(`  ok    ${n}`);

if (failures.length) {
  console.log();
  for (const f of failures) console.log(`  FAIL  ${f}`);
  const n = failures.length;
  console.log(
    `\n${n} ${n === 1 ? "inconsistency" : "inconsistencies"} — refusing to build.\n` +
      `A financial site cannot describe one calculation three ways.\n`
  );
  process.exit(1);
}

console.log(
  `\n  0 inconsistencies. All ${DESCRIBERS.length} descriptions agree, and none uses a\n` +
    `  wording that was previously wrong.\n`
);
process.exit(0);
