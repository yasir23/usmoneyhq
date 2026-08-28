import Head from "next/head";
import Link from "next/link";
import AdSlot from "./AdSlot";
import ToolClient from "./ToolClient";
import { getTool, SITE_URL, SITE_NAME, TOOLS } from "../lib/tools";
import { getState, STATES, STATE_AWARE_TOOLS, type StateData } from "../lib/states";

/**
 * ToolPageShell — shared page shell for every calculator (pages router).
 * Centralizes SEO (title/meta/canonical/OG/JSON-LD), breadcrumbs, ad slots,
 * the tool UI, FAQ, and related links. New tools = new registry entry only.
 * Optional stateSlug renders a state-variant page (programmatic SEO).
 */
export default function ToolPageShell({ slug, stateSlug }: { slug: string; stateSlug?: string }) {
  const tool = getTool(slug);
  const state: StateData | undefined = stateSlug ? getState(stateSlug) : undefined;

  // state variants only allowed for state-aware tools
  if (stateSlug && !STATE_AWARE_TOOLS.includes(slug)) {
    return <NotFoundShell />;
  }

  if (!tool || (stateSlug && !state)) {
    return <NotFoundShell />;
  }

  const url = state ? `${SITE_URL}/${tool.slug}/${state.slug}` : `${SITE_URL}/${tool.slug}`;
  const pageTitle = state
    ? `${state.name} ${tool.shortTitle.replace(" Calculator", "")} Calculator 2026 | US Money HQ`
    : tool.title;
  const pageDesc = state
    ? `${tool.description} ${state.incomeTaxNote}. Average property tax ${state.propTaxPct}%.`
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
          ...(state ? [{ "@type": "ListItem", position: 3, name: state.name, item: url }] : []),
        ],
      },
    ],
  };

  const initialValues = state ? { state: state.abbr } : undefined;

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <main className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/${tool.slug}`}>{tool.shortTitle}</Link>
          {state && (<><span aria-hidden="true">›</span><span>{state.name}</span></>)}
        </nav>

        <h1>{state ? `${state.name} ${tool.h1}` : tool.h1}</h1>
        <p className="sub">{tool.sub}</p>

        <AdSlot id={`${tool.slug}-${state?.slug || "top"}`} />

        {state && (
          <div className="state-facts card">
            <h2>{state.name} Facts</h2>
            <div className="row"><span>Income tax</span><b>{state.incomeTaxNote}</b></div>
            <div className="row"><span>Avg. property tax rate</span><b>{state.propTaxPct}% of home value</b></div>
            <div className="row"><span>Avg. combined sales tax</span><b>{state.salesTax}%</b></div>
            <p className="note">Averages — verify current rates with your county assessor.</p>
          </div>
        )}

        <ToolClient tool={tool} initialValues={initialValues} />

        <AdSlot id={`${tool.slug}-${state?.slug || "mid"}`} />

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
