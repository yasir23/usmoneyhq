"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ToolDef } from "../lib/tools";

export default function ToolClient({ tool, initialValues }: { tool: ToolDef; initialValues?: Record<string, number | string> }) {
  const [values, setValues] = useState<Record<string, number | string>>(() => {
    const init: Record<string, number | string> = {};
    for (const f of tool.fields) init[f.key] = f.default;
    if (initialValues) {
      for (const [k, v] of Object.entries(initialValues)) {
        if (k in init) init[k] = v;
      }
    }
    return init;
  });

  const results = useMemo(() => tool.compute(values), [tool, values]);

  const set = (key: string, val: number | string) => setValues((p) => ({ ...p, [key]: val }));

  return (
    <>
      <div className="grid">
        <form className="card" onSubmit={(e) => e.preventDefault()} noValidate>
          {tool.fields.map((f) => (
            <div className="field" key={f.key}>
              <label htmlFor={`f-${f.key}`}>{f.label}</label>
              {f.type === "number" ? (
                <input
                  id={`f-${f.key}`}
                  type="number"
                  inputMode={f.inputMode ?? "decimal"}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={values[f.key] as number}
                  onChange={(e) => set(f.key, e.target.value === "" ? 0 : Number(e.target.value))}
                />
              ) : (
                <select id={`f-${f.key}`} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                  {f.options.map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </form>

        <div className="card results" aria-live="polite" aria-atomic="true">
          <h2>Your Results</h2>
          {results.map((r) => (
            <div className={r.highlight ? "row highlight" : "row"} key={r.label}>
              <span>{r.label}</span>
              <b>{r.value}</b>
            </div>
          ))}
          {tool.note && <p className="note">{tool.note}</p>}
        </div>
      </div>

      <div className="seo">
        {tool.faq.length > 0 && (
          <>
            <h2>Frequently Asked Questions</h2>
            {tool.faq.map((f) => (
              <div className="faq" key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </>
        )}
        {tool.related.length > 0 && (
          <>
            <h2>Related Calculators</h2>
            <div className="tool-grid">
              {tool.related.map((slug) => (
                <Link key={slug} href={`/${slug}`} className="tool-card">
                  <h3>{slug.replace(/-/g, " ")}</h3>
                  <span className="cta">Open calculator →</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
