import Head from "next/head";
import Link from "next/link";
import { TOOLS, SITE_URL, SITE_NAME, getTool } from "../lib/tools";
import { STATES, STATE_AWARE_TOOLS, getComparisonPairs } from "../lib/states";

/**
 * /states — the state hub.
 *
 * WHY THIS PAGE EXISTS: llms.txt advertised https://usmoneyhq.com/states as a
 * "50-state list" while no such route existed, so the promise 404'd. The 357
 * `/{tool}/{state}` pages were reachable (verified 357/357 by crawl) but had no
 * browseable parent — every one of them was reached only through a tool root.
 * A hub gives the state cluster a single deliberate entry point.
 *
 * Anything advertised in llms.txt must resolve. If this page is ever removed,
 * remove the llms.txt reference in the same commit.
 */

/** The primary state intent — salary in a state is the highest-volume state query. */
const PRIMARY_TOOL = "salary-after-tax-calculator";

export default function StatesHub() {
  const primary = getTool(PRIMARY_TOOL);
  const otherTools = STATE_AWARE_TOOLS.filter((s) => s !== PRIMARY_TOOL);
  const comparisons = getComparisonPairs().slice(0, 12);

  const noTax = STATES.filter((s) => s.incomeTax === "none");
  const flat = STATES.filter((s) => s.incomeTax === "flat");
  const progressive = STATES.filter((s) => s.incomeTax === "progressive");

  return (
    <>
      <Head>
        <title>State-by-State Tax &amp; Cost Calculators (All 50 States, 2026) | US Money HQ</title>
        <meta
          name="description"
          content="Every US state in one place: income tax structure, average property tax rate, and combined sales tax, with a free take-home pay calculator for each state."
        />
        <link rel="canonical" href={`${SITE_URL}/states`} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>States</span>
        </nav>

        <h1>State-by-state tax and cost calculators</h1>
        <p className="sub">
          Pick your state to estimate take-home pay, then switch to any of the{" "}
          {STATE_AWARE_TOOLS.length} state-aware calculators. Each page carries that state&apos;s
          income tax structure, average property tax rate, and combined sales tax —
          and every calculator shows its assumptions.
        </p>

        <div className="seo">
          <h2>How state income tax breaks down</h2>
          <p>
            {noTax.length} states have no income tax ({noTax.map((s) => s.abbr).join(", ")}),{" "}
            {flat.length} tax a single flat rate, and {progressive.length} use graduated brackets.
            That difference is the largest single swing in take-home pay between two people on
            identical salaries — often a few thousand dollars a year.
          </p>
        </div>

        <h2>All {STATES.length} states</h2>
        <div className="tool-grid">
          {STATES.map((s) => (
            <Link
              key={s.slug}
              href={`/${PRIMARY_TOOL}/${s.slug}`}
              className="tool-card"
            >
              <h3>{s.name}</h3>
              <p>{s.incomeTaxNote}</p>
              <p>
                Property tax {s.propTaxPct}% · Sales tax {s.salesTax}%
              </p>
              <span className="cta">Take-home pay in {s.name} →</span>
            </Link>
          ))}
        </div>

        <div className="seo">
          <h2>Every state-aware calculator</h2>
          <p>
            Each of these tools has a page for all {STATES.length} states. Open one and the state
            links are listed on the page.
          </p>
          <div className="tool-grid">
            {[PRIMARY_TOOL, ...otherTools].map((slug) => {
              const t = getTool(slug);
              if (!t) return null;
              return (
                <Link key={slug} href={`/${slug}`} className="tool-card">
                  <h3>{t.shortTitle}</h3>
                  <p>{t.description.split(".")[0]}.</p>
                  <span className="cta">{STATES.length} state pages →</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="seo">
          <h2>Compare two states</h2>
          <p>
            Moving, or deciding where to live? These side-by-side pages show the take-home
            difference between two states at the same salary.
          </p>
          <ul>
            {comparisons.map(([a, b]) => (
              <li key={`${a.slug}-${b.slug}`}>
                <Link href={`/${PRIMARY_TOOL}/${a.slug}-vs-${b.slug}`}>
                  {a.name} vs {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="seo">
          <h2>How these estimates are calculated</h2>
          <p>
            Federal tax uses 2026 brackets and the standard deduction; FICA uses the 2026 Social
            Security wage base. The state income tax line is a <strong>flat 5% national
            estimate</strong> for states with an income tax and 0 in the {noTax.length} states
            without one — it does not model individual state bracket schedules, so treat state
            figures as a starting point. Property tax and sales tax figures are statewide
            averages. See <Link href="/methodology">our methodology</Link> for the full model, or
            read the assumptions panel on any calculator.
          </p>
          <p>
            This is an estimate, not tax advice. Confirm figures with your state revenue
            authority before making a decision.
          </p>
        </div>
      </main>
    </>
  );
}
