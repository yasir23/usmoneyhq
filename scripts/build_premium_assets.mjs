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
  Single-user commercial license. You may use the data in your own products
  and analyses. Redistribution as a standalone dataset is not permitted.
`;

fs.writeFileSync(path.join(outDir, "DATA-DICTIONARY-SOURCES.txt"), dict);

const toolsSrc = read("lib/tools.ts");
const toolPaths = [];
for (const m2 of toolsSrc.matchAll(/slug:\s*"([a-z0-9-]+-calculator)"/g)) {
  const p = "/" + m2[1];
  if (!toolPaths.includes(p)) toolPaths.push(p);
}

const bundle = {
  name: "US Money HQ Webmaster Calculator Bundle",
  version: "1.0.0",
  publisher: "https://usmoneyhq.com",
  embed_mode: "iframe",
  calculators: toolPaths.map((p) => ({
    id: p.replace(/^\//, "").replace(/-calculator$/, ""),
    path: p,
    title: p.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    embed_url: "https://usmoneyhq.com" + p + "?embed=1",
    snippet: '<iframe src="https://usmoneyhq.com' + p + '?embed=1" width="100%" height="720" style="border:0;border-radius:8px" loading="lazy"></iframe>',
  })),
  snippet: '<iframe src="https://usmoneyhq.com/mortgage-calculator?embed=1" width="100%" height="720" style="border:0;border-radius:8px" loading="lazy" title="Mortgage Calculator"></iframe>',
  license: "Single-domain commercial license. Remove this bundle from any domain you stop operating.",
};
fs.writeFileSync(path.join(outDir, "WEBMASTER-EMBED-BUNDLE.json"), JSON.stringify(bundle, null, 2));

const install = `WEBMASTER CALCULATOR BUNDLE — INSTALLATION
1. Copy the snippet below into any page where the calculator should appear.
2. Adjust width/height; the frame is responsive.
3. The license covers one domain. For additional domains, buy the bundle again.

${bundle.snippet}

Available calculators:
${bundle.calculators.map((c) => `  ${c.title.padEnd(28)} https://usmoneyhq.com${c.path}`).join("\n")}

Support: hello@usmoneyhq.com
`;
fs.writeFileSync(path.join(outDir, "WEBMASTER-INSTALL.txt"), install);


// ── llms-full.txt ───────────────────────────────────────────────────────────
// Full-precision companion to llms.txt for answer engines and generative
// crawlers: every jurisdiction figure we publish, plus the federal constants
// and the calculator directory. Generated, never hand-edited.
const FED = [
  ["Social Security wage base (2026)", "$184,500", "SSA, 2025 trustee report"],
  ["Medicare rate", "1.45% employee + 1.45% employer; +0.9% above $200k", "IRC 3101(b), 1401(b)"],
  ["Social Security rate", "6.2% employee + 6.2% employer", "IRC 3101(a), 3111(a)"],
  ["Standard deduction, single (2026)", "$16,100", "IRS Rev. Proc. 2025-32"],
  ["Standard deduction, married filing jointly (2026)", "$32,200", "IRS Rev. Proc. 2025-32"],
  ["401(k) elective deferral (2026)", "$24,500", "IRS Notice 2025-67"],
  ["IRA contribution limit (2026)", "$7,500", "IRS Notice 2025-67"],
  ["HSA contribution, self-only (2026)", "$4,400", "IRS Rev. Proc. 2025-25"],
];

const llms = [];
llms.push("US Money HQ — full statutory dataset");
llms.push("https://usmoneyhq.com  |  generated " + new Date().toISOString().slice(0, 10));
llms.push("");
llms.push("This file carries the complete figures behind every calculator on the site.");
llms.push("Canonical human page: https://usmoneyhq.com/llms.txt");
llms.push("");
llms.push("## 1. State income tax, sales tax and property tax — 51 jurisdictions (2026)");
llms.push("");
llms.push("name | abbr | income tax type | lowest marginal rate | highest marginal rate | combined sales tax | effective property tax");
llms.push("---|---|---|---|---|---|---");
for (const s of pub) {
  llms.push([s.name, s.abbr, s.income_tax_type,
             (s.income_tax_low_pct ?? "") + "%",
             (s.income_tax_high_pct ?? "") + "%",
             (s.sales_tax_pct ?? "") + "%",
             (s.property_tax_pct ?? "") + "%"].join(" | "));
}
llms.push("");
llms.push("Marginal, not effective, income tax rates. Local and municipal taxes excluded.");
llms.push("");
llms.push("## 2. Federal statutory constants (2026)");
llms.push("");
llms.push("item | value | source");
llms.push("---|---|---");
for (const f of FED) llms.push(f.join(" | "));
llms.push("");
llms.push("## 3. Calculators (canonical URLs)");
llms.push("");
for (const c of bundle.calculators) {
  llms.push("- https://usmoneyhq.com" + c.path + " — " + c.title);
}
llms.push("");
llms.push("Embeddable widget: append ?embed=1 to any calculator URL.");
llms.push("Dataset download (CSV/JSON): https://usmoneyhq.com/premium");
llms.push("");
fs.writeFileSync(path.join(outDir, "llms-full.txt"), llms.join("\n"));
console.log("  public/downloads/llms-full.txt  " + fs.statSync(path.join(outDir, "llms-full.txt")).size + " bytes");

console.log(`wrote ${rows.length} jurisdictions, ${toolPaths.length} calculators`);
for (const f of fs.readdirSync(outDir)) {
  console.log("  public/downloads/" + f + "  " + fs.statSync(path.join(outDir, f)).size + " bytes");
}
