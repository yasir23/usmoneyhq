/**
 * dump_tool_examples.ts — print a tool's fields and its real computed output.
 *
 * WHY: lib/toolContent.ts publishes worked examples with checkable arithmetic.
 * Writing one by hand means guessing the engine's output, and a wrong published
 * figure on a financial page is the exact defect class that got the site
 * rejected. This prints the engine's actual answer so the prose is derived from
 * the calculator instead of approximating it.
 *
 *   node scripts/dump_tool_examples.ts 401k-calculator roi-calculator
 *   node scripts/dump_tool_examples.ts                  # every tool
 */
import { TOOLS } from "../lib/tools.ts";

type Field = { key: string; label: string; default?: unknown };
type Row = { label: string; value: string; note?: string };

const want = process.argv.slice(2);

for (const t of TOOLS as unknown as Array<{
  slug: string;
  h1?: string;
  fields: Field[];
  compute: (v: Record<string, unknown>) => Row[];
}>) {
  if (want.length && !want.includes(t.slug)) continue;

  const defaults: Record<string, unknown> = {};
  for (const f of t.fields) defaults[f.key] = f.default;

  console.log(`\n=== ${t.slug}  —  ${t.h1 ?? ""} ===`);
  console.log("fields: " + t.fields.map((f) => `${f.key}=${f.default}`).join("  "));

  let rows: Row[];
  try {
    rows = t.compute(defaults);
  } catch (e) {
    console.log(`  compute() threw: ${e}`);
    continue;
  }
  for (const r of rows) {
    console.log(`   ${r.label}: ${r.value}${r.note ? `   [${r.note}]` : ""}`);
  }
}
