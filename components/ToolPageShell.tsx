import Head from "next/head";
import Link from "next/link";
import AdSlot from "./AdSlot";
import ToolClient from "./ToolClient";
import { getTool, SITE_URL, SITE_NAME, TOOLS } from "../lib/tools";
import { getState, getComparisonPair, STATES, STATE_AWARE_TOOLS, type StateData } from "../lib/states";
import { SALARY_AMOUNTS, SALARY_TOOL_SLUGS, fmtAmount, amountFromSlug } from "../lib/amounts";

/**
 * ToolPageShell — shared page shell for every calculator (pages router).
 * Centralizes SEO (title/meta/canonical/OG/JSON-LD), breadcrumbs, ad slots,
 * the tool UI, FAQ, and related links. New tools = new registry entry only.
 * Optional stateSlug renders a state-variant page; "stateA-vs-stateB" renders
 * a side-by-side comparison; amountSlug renders a salary-amount scenario page
 * (programmatic SEO — real computed numbers per variant).
 */
export default function ToolPageShell({ slug, stateSlug, amountSlug }: { slug: string; stateSlug?: string; amountSlug?: string }) {
  const tool = getTool(slug);
  const pair: [StateData, StateData] | null = stateSlug && stateSlug.includes("-vs-") ? getComparisonPair(stateSlug) : null;
  const state: StateData | undefined = stateSlug && !pair ? getState(stateSlug) : undefined;
  const amount: number | undefined = amountSlug ? amountFromSlug(amountSlug) : undefined;
  const validAmount = amount !== undefined && !isNaN(amount) && SALARY_AMOUNTS.includes(amount);

  // state variants only allowed for state-aware tools
  if (stateSlug && !STATE_AWARE_TOOLS.includes(slug)) {
    return <NotFoundShell />;
  }
  // amount variants only allowed for salary tools with a known amount
  if (amountSlug && (!validAmount || !SALARY_TOOL_SLUGS.includes(slug))) {
    return <NotFoundShell />;
  }

  if (!tool || (stateSlug && !pair && !state)) {
    return <NotFoundShell />;
  }

  const url = pair
    ? `${SITE_URL}/${tool.slug}/${pair[0].slug}-vs-${pair[1].slug}`
    : state
    ? amount
      ? `${SITE_URL}/${tool.slug}/${amountSlug}/${state.slug}`
      : `${SITE_URL}/${tool.slug}/${state.slug}`
    : amount
    ? `${SITE_URL}/${tool.slug}/${amountSlug}`
    : `${SITE_URL}/${tool.slug}`;
  const pageTitle = pair
    ? `${pair[0].name} vs ${pair[1].name} ${tool.shortTitle.replace(" Calculator", "")} Calculator 2026 | US Money HQ`
    : state && amount
    ? `${state.name} Take-Home on a ${fmtAmount(amount)} Salary (2026) | US Money HQ`
    : state
    ? `${state.name} ${tool.shortTitle.replace(" Calculator", "")} Calculator 2026 | US Money HQ`
    : amount
    ? `${fmtAmount(amount)} Salary After Tax: Take-Home Pay in 2026 | US Money HQ`
    : tool.title;
  const pageDesc = pair
    ? `Compare ${pair[0].name} vs ${pair[1].name} ${tool.shortTitle.toLowerCase()} 2026: income tax, property tax, sales tax, and take-home math side by side.`
    : state && amount
    ? `${fmtAmount(amount)} salary in ${state.name} after federal and state taxes in 2026. ${state.incomeTaxNote}.`
    : state
    ? `${tool.description} ${state.incomeTaxNote}. Average property tax ${state.propTaxPct}%.`
    : amount
    ? `Your take-home pay on a ${fmtAmount(amount)} salary in 2026: federal tax, FICA, and what lands in your bank account each month.`
    : tool.description;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: pageTitle,
        url,
        description: pageDesc,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: tool.shortTitle, item: `${SITE_URL}/${tool.slug}` },
          ...(pair ? [{ "@type": "ListItem", position: 3, name: `${pair[0].name} vs ${pair[1].name}`, item: url }] : []),
          ...(state && !pair && !amount ? [{ "@type": "ListItem", position: 3, name: state.name, item: url }] : []),
          ...(amount && !state ? [{ "@type": "ListItem", position: 3, name: fmtAmount(amount), item: url }] : []),
          ...(state && amount ? [{ "@type": "ListItem", position: 3, name: fmtAmount(amount), item: `${SITE_URL}/${tool.slug}/${amountSlug}` }, { "@type": "ListItem", position: 4, name: state.name, item: url }] : []),
        ],
      },
    ],
  };

  const initialValues = state && amount ? { salary: amount, state: state.abbr } : amount ? { salary: amount } : state ? { state: state.abbr } : pair ? { state: pair[0].abbr } : undefined;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <main className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/${tool.slug}`}>{tool.shortTitle}</Link>
          {pair && (<><span aria-hidden="true">›</span><span>{pair[0].name} vs {pair[1].name}</span></>)}
          {amount && !state && (<><span aria-hidden="true">›</span><span>{fmtAmount(amount)}</span></>)}
          {state && !pair && !amount && (<><span aria-hidden="true">›</span><span>{state.name}</span></>)}
          {amount && state && (<><span aria-hidden="true">›</span><Link href={`/${tool.slug}/${amountSlug}`}>{fmtAmount(amount)}</Link><span aria-hidden="true">›</span><span>{state.name}</span></>)}
        </nav>

        <h1>{pair ? `${pair[0].name} vs ${pair[1].name}: ${tool.h1}` : state && amount ? `${fmtAmount(amount)} Salary in ${state.name}: ${tool.h1}` : amount ? `${fmtAmount(amount)} Salary: ${tool.h1}` : state ? `${state.name} ${tool.h1}` : tool.h1}</h1>
        <p className="sub">{tool.sub}</p>

        <AdSlot id={`${tool.slug}-${pair ? "compare" : state?.slug || "top"}`} />

        {pair && (
          <div className="compare-grid">
            {[pair[0], pair[1]].map((s) => (
              <div key={s.slug} className="state-facts card">
                <h2>{s.name} Facts</h2>
                <div className="row"><span>Income tax</span><b>{s.incomeTaxNote}</b></div>
                <div className="row"><span>Avg. property tax rate</span><b>{s.propTaxPct}% of home value</b></div>
                <div className="row"><span>Avg. combined sales tax</span><b>{s.salesTax}%</b></div>
                <p className="note">Averages — verify current rates with your county assessor.</p>
              </div>
            ))}
            <div className="compare-table card">
              <h2>{pair[0].name} vs {pair[1].name} — Quick Comparison</h2>
              <div className="row"><span>Income tax type</span><b>{pair[0].incomeTax} vs {pair[1].incomeTax}</b></div>
              <div className="row"><span>Property tax rate</span><b>{pair[0].propTaxPct}% vs {pair[1].propTaxPct}%</b></div>
              <div className="row"><span>Sales tax rate</span><b>{pair[0].salesTax}% vs {pair[1].salesTax}%</b></div>
            </div>
          </div>
        )}

        {state && !pair && (
          <div className="state-facts card">
            <h2>{state.name} Facts</h2>
            <div className="row"><span>Income tax</span><b>{state.incomeTaxNote}</b></div>
            <div className="row"><span>Avg. property tax rate</span><b>{state.propTaxPct}% of home value</b></div>
            <div className="row"><span>Avg. combined sales tax</span><b>{state.salesTax}%</b></div>
            <p className="note">Averages — verify current rates with your county assessor.</p>
          </div>
        )}

        {!pair && <ToolClient tool={tool} initialValues={initialValues} />}

        {pair && (
          <div className="compare-grid">
            {[pair[0], pair[1]].map((s) => (
              <div key={s.slug}>
                <h2 className="compare-subhead">{s.name}</h2>
                <ToolClient tool={tool} initialValues={{ state: s.abbr }} />
              </div>
            ))}
          </div>
        )}

        <AdSlot id={`${tool.slug}-${pair ? "compare-mid" : state?.slug || "mid"}`} />

        {!state && STATE_AWARE_TOOLS.includes(slug) && (
          <div className="seo">
            <h2>Calculator by State</h2>
            <div className="state-links">
              {STATES.map((s) => (
                <Link key={s.slug} href={`/${slug}/${s.slug}`}>{s.name}</Link>
              ))}
            </div>
          </div>
        )}

        {state && (
          <div className="seo">
            <h2>{state.name}-specific notes for this calculator</h2>
            <p>{state.name} has {state.incomeTaxNote.toLowerCase()} and an average effective property tax rate of {state.propTaxPct}% of home value (combined sales tax ~{state.salesTax}%). Use the numbers above as a starting point — local county rates and exemptions can change the real figures.</p>
            <h3>More {state.name} calculators</h3>
            <div className="tool-grid">
              {STATE_AWARE_TOOLS.filter((t) => t !== slug).map((t) => {
                const tt = getTool(t);
                if (!tt) return null;
                return (
                  <Link key={t} href={`/${t}/${state.slug}`} className="tool-card">
                    <h3>{state.name} {tt.shortTitle}</h3>
                    <span className="cta">Open calculator →</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function NotFoundShell() {
  return (
    <>
      <Head><title>Not Found | {SITE_NAME}</title></Head>
      <main className="container">
        <h1>Tool not found</h1>
        <p><Link href="/">Browse all calculators</Link></p>
      </main>
    </>
  );
}
