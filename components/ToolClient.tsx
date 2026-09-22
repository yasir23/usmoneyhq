"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ToolDef } from "../lib/tools";

/**
 * Fire a one-per-pageview "calc_complete" event.
 *
 * WHAT COUNTS AS A COMPLETION HERE, and why it is defined this narrowly:
 * tool.compute() runs in a useMemo on every render, so a result is already on
 * screen the moment the page loads. Counting "a result rendered" would just be
 * a second pageview counter and would make the scorecard's calc_completions
 * column meaningless. A completion is therefore the first time the visitor
 * CHANGES an input — that is the first moment they ran the calculator on their
 * own numbers rather than reading the defaults.
 *
 * Fires at most once per mount, so one visitor who edits six fields counts once.
 * sendBeacon because it survives navigation; wrapped because measurement must
 * never break a calculation.
 */
function reportCompletion() {
  try {
    if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
    const payload = JSON.stringify({
      kind: "view",
      event: "calc_complete",
      path: window.location.pathname,
      ref: document.referrer || "",
    });
    navigator.sendBeacon("/api/px", new Blob([payload], { type: "application/json" }));
  } catch {
    /* never throw from a measurement path */
  }
}

export default function ToolClient({ tool, initialValues, showFaq = true, showRelated = true, excludeRelated = [] }: { tool: ToolDef; initialValues?: Record<string, number | string>; showFaq?: boolean; showRelated?: boolean; excludeRelated?: string[] }) {
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
  const completed = useRef(false);

  const set = (key: string, val: number | string) => {
    setValues((p) => ({ ...p, [key]: val }));
    if (!completed.current) {
      completed.current = true;
      reportCompletion();
    }
  };

  // Guides link their own curated tool list in anchor text, so they pass those
  // slugs in excludeRelated — one href per URL, and the remaining tool.related
  // cards still get rendered instead of the whole grid being dropped.
  const relatedShown = tool.related.filter((s) => !excludeRelated.includes(s));

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
        {showFaq && tool.faq.length > 0 && (
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
        {showRelated && relatedShown.length > 0 && (
          <>
            <h2>Related Calculators</h2>
            <div className="tool-grid">
              {relatedShown.map((slug) => (
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
