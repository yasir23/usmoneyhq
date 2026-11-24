#!/usr/bin/env node
/**
 * scripts/build_premium_assets.mjs — builds the real deliverables behind the
 * paid tiers, from the statutory data already in lib/.
 *
 *   public/downloads/us-50-state-data-pack.csv
 *   public/downloads/us-50-state-data-pack.json
 *   public/downloads/DATA-DICTIONARY-SOURCES.txt
 *   public/downloads/WEBMASTER-EMBED-BUNDLE.json
 *   public/downloads/WEBMASTER-INSTALL.txt
 *
 * The source of truth is lib/states.ts (statutory notes per state) and
 * lib/stateRates.ts (generated from it, with numeric margins). Nothing is
 * invented here: every figure is copied out of those files, and the dictionary
 * records which file each column came from.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const statesSrc = read("lib/states.ts");
const ratesSrc = read("lib/stateRates.ts");

// abbr -> { low, high } from the generated rate table
const rates = {};
for (const m of ratesSrc.matchAll(/^\s{2}([A-Z]{2}):\s*\{\s*low:\s*([\d.]+),\s*high:\s*([\d.]+)\s*\}/gm)) {
  rates[m[1]] = { low: Number(m[2]), high: Number(m[3]) };
}

// each state object in STATES[] is a single line: { slug: "alabama", abbr: "AL", ... }
const states = [];
for (const line of statesSrc.split("\n")) {
  const t = line.trim();
  if (!t.startsWith("{ slug:")) continue;
  const obj = {};
  for (const f of t.matchAll(/([A-Za-z_]+):\s*"((?:[^"\\]|\\.)*)"/g)) {
    obj[f[1]] = f[2].replace(/\\"/g, '"');
  }
  for (const f of t.matchAll(/([A-Za-z_]+):\s*(-?[\d.]+)\b/g)) {
    obj[f[1]] = Number(f[2]);
  }
  if (obj.abbr && rates[obj.abbr]) {
    obj.income_tax_low_pct = rates[obj.abbr].low;
    obj.income_tax_high_pct = rates[obj.abbr].high;
  }
  states.push(obj);
}

const seen = new Set();
const rows = states.filter((s) => {
  const k = s.slug || "";
  if (!k || seen.has(k)) return false;
  seen.add(k);
  return true;
});
rows.sort((a, b) => String(a.name || a.slug).localeCompare(String(b.name || b.slug)));
const pub = rows.map(norm);

const cols = [
  "name", "slug", "abbr", "income_tax_type", "income_tax_note",
  "income_tax_low_pct", "income_tax_high_pct",
  "sales_tax_pct", "property_tax_pct",
];
function norm(r) {
  return {
    name: r.name, slug: r.slug, abbr: r.abbr,
    income_tax_type: r.incomeTax, income_tax_note: r.incomeTaxNote,
    income_tax_low_pct: r.income_tax_low_pct, income_tax_high_pct: r.income_tax_high_pct,
    sales_tax_pct: r.salesTax, property_tax_pct: r.propTaxPct,
  };
}

const cell = (v) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

const outDir = path.join(root, "public", "downloads");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, "us-50-state-data-pack.csv"),
  [cols.join(","), ...pub.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n") + "\n"
);

fs.writeFileSync(
  path.join(outDir, "us-50-state-data-pack.json"),
  JSON.stringify(
    {
      generated: new Date().toISOString().slice(0, 10),
      publisher: "US Money HQ — https://usmoneyhq.com",
      jurisdiction_count: rows.length,
      columns: cols,
      states: pub,
    },
    null,
    2
  )
);

const dict = `US MONEY HQ — 50-STATE + DC DATA PACK
DATA DICTIONARY AND SOURCES
Generated: ${new Date().toISOString().slice(0, 10)}

COLUMNS
  name ................ state name
  slug ................ lowercase identifier used in calculator URLs
  abbr ................ two-letter USPS abbreviation
  income_tax_type ..... none | flat | progressive
  income_tax_note ..... statutory note as published on the calculator pages
  income_tax_low_pct .. lowest marginal rate in the state schedule
  income_tax_high_pct . highest marginal rate in the state schedule
  sales_tax_pct ....... statewide base sales tax rate
  property_tax_pct .... effective property tax rate
  notes ............... additional statutory notes carried in the source file

SOURCES
  Every figure is copied programmatically from two files in the public
  repository:
    lib/states.ts ....... statutory notes and per-state descriptive fields
    lib/stateRates.ts .. numeric income-tax margins, itself generated from
                         lib/states.ts by scripts/gen_state_rates.py
  Update dates for each calculator page are in lib/content-dates.ts.

WHAT THIS PACK IS NOT
  Marginal rates, not effective rates. State income tax is computed on
  taxable income after that state's deductions and credits, which this pack
  does not model. Local and municipal taxes are excluded. Figures are
  provided for research and tooling; verify against the state revenue
  department before relying on them for filing.

LICENCE
  Single-user commercial licence. You may use the data in your own products
  and analyses. Redistribution as a standalone dataset is not permitted.
`;

fs.writeFileSync(path.join(outDir, "DATA-DICTIONARY-SOURCES.txt"), dict);

const bundle = {
  name: "US Money HQ Webmaster Calculator Bundle",
  version: "1.0.0",
  publisher: "https://usmoneyhq.com",
  embed_mode: "iframe",
  calculators: [
    { id: "mortgage", path: "/mortgage-calculator", title: "Mortgage Calculator" },
    { id: "loan", path: "/loan-calculator", title: "Loan Calculator" },
    { id: "auto-loan", path: "/auto-loan-calculator", title: "Auto Loan Calculator" },
    { id: "debt-payoff", path: "/debt-payoff-calculator", title: "Debt Payoff Calculator" },
    { id: "savings", path: "/savings-calculator", title: "Savings Calculator" },
  ],
  snippet: '<iframe src="https://usmoneyhq.com/mortgage-calculator?embed=1" width="100%" height="720" style="border:0;border-radius:8px" loading="lazy" title="Mortgage Calculator"></iframe>',
  licence: "Single-domain commercial licence. Remove this bundle from any domain you stop operating.",
};
fs.writeFileSync(path.join(outDir, "WEBMASTER-EMBED-BUNDLE.json"), JSON.stringify(bundle, null, 2));

const install = `WEBMASTER CALCULATOR BUNDLE — INSTALLATION
1. Copy the snippet below into any page where the calculator should appear.
2. Adjust width/height; the frame is responsive.
3. The licence covers one domain. For additional domains, buy the bundle again.

${bundle.snippet}

Available calculators:
${bundle.calculators.map((c) => `  ${c.title.padEnd(28)} https://usmoneyhq.com${c.path}`).join("\n")}

Support: hello@usmoneyhq.com
`;
fs.writeFileSync(path.join(outDir, "WEBMASTER-INSTALL.txt"), install);

console.log(`wrote ${rows.length} jurisdictions`);
for (const f of fs.readdirSync(outDir)) {
  console.log("  public/downloads/" + f + "  " + fs.statSync(path.join(outDir, f)).size + " bytes");
}
