import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TOOLS, SITE_URL, SITE_NAME, SITE_DESC } from "../lib/tools";
import { CATEGORIES, categorize } from "../lib/categories";

/**
 * The homepage's own description. Deliberately not SITE_DESC: that one describes the
 * site as a whole including the non-finance tools, and this page now leads with the
 * money product. A search result should promise what the page delivers.
 */
const HOMEPAGE_DESC =
  "Free US calculators for take-home pay, federal and state tax, mortgage payments, " +
  "debt payoff and retirement. State-specific, sourced from IRS, SSA and state " +
  "revenue figures, with the formula and exclusions shown beside every result.";

/** Homepage — registry-driven tool grid grouped into categories for crawl + UX. */

export default function Home() {
  const [query, setQuery] = useState("");
  useEffect(() => {
    // ?q= support (SearchAction schema): prefill + filter on load
    try {
      const q = new URLSearchParams(window.location.search).get("q") || "";
      if (q) setQuery(q);
    } catch (e) { /* ignore */ }
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return TOOLS;
    return TOOLS.filter((t) =>
      (t.title + " " + t.shortTitle + " " + t.description + " " + t.slug).toLowerCase().includes(q)
    );
  }, [q]);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  // One categorisation rule, shared with the hub pages.
  //
  // This used to hold a second copy that matched on the category NAME, so renaming
  // a category would silently empty its section here while the hub page kept
  // working. Matching on slug against the shared helper means a rename cannot
  // desynchronise the two.
  const grouped = CATEGORIES.map((c) => ({
    ...c,
    tools: filtered.filter((t) => categorize(t.slug).slug === c.slug),
  })).filter((c) => c.tools.length > 0);

  // Finance first. The rest is real and stays, but it is not why anyone should
  // trust this site with a salary figure, so it does not lead.
  const financeGroups = grouped.filter((c) => c.tier === "finance");
  const otherGroups = grouped.filter((c) => c.tier === "other");

  // One renderer for both groups, so the demoted set cannot drift visually or
  // structurally from the ones that lead.
  const renderSection = (c) => (
    <section key={c.slug} id={c.slug} className="cat-section">
      {/* h2 links the category landing page — those pages were orphaned
          (sitemap-only, no internal links) before this */}
      <h2 className="cat-title">
        <Link href={`/calculators/${c.slug}`}>{c.name}</Link>
      </h2>
      <div className="tool-grid">
        {c.tools.map((t) => (
          <Link key={t.slug} href={`/${t.slug}`} className="tool-card">
            <h3>{t.shortTitle}</h3>
            <p>{t.description.split(".")[0]}.</p>
            <span className="cta">Open calculator &rarr;</span>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <>
      <Head>
        <title>US Money HQ — Pay, Tax, Mortgage &amp; Retirement Calculators (2026)</title>
        <meta name="description" content={HOMEPAGE_DESC} />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="US Money HQ — Pay, Tax, Mortgage & Retirement Calculators" />
        <meta property="og:description" content={HOMEPAGE_DESC} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <main className="container">
        <h1>Pay, tax, mortgage and retirement calculators</h1>
        <p className="sub">
          Free US money calculators — take-home pay, federal and state tax, mortgage
          payments, debt payoff and retirement. Every formula and source shown, no
          sign-up, nothing collected.
        </p>

        <div className="search-bar">
          <input
            type="search"
            placeholder={`Search ${TOOLS.length} calculators — try 'mortgage', 'tax', 'bmi'…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search calculators"
          />
          {q && <p className="search-count">{filtered.length} of {TOOLS.length} tools match "{query.trim()}"</p>}
        </div>

        <nav className="cat-jump" aria-label="Money calculators">
          {financeGroups.map(renderSection)}
        </nav>

        {otherGroups.length > 0 && (
          <section className="other-tools" aria-labelledby="other-tools-heading">
            <h2 id="other-tools-heading">Other calculators</h2>
            <p className="note">
              Not part of the money focus above. Kept because they are used and they
              work — the same sourcing standard applies, and no claim is made beyond
              what each one computes.
            </p>
            {otherGroups.map(renderSection)}
          </section>
        )}

        <div className="seo">
          <h2>Popular salary scenarios</h2>
          <p>See exactly what different salaries take home in every state:</p>
          <p><a href="/salary-after-tax-calculator/75000">$75,000 salary</a> · <a href="/salary-after-tax-calculator/100000">$100,000 salary</a> · <a href="/salary-after-tax-calculator/150000">$150,000 salary</a> · <a href="/salary-after-tax-calculator/100000/california">$100k in California</a> · <a href="/salary-after-tax-calculator/100000/texas">$100k in Texas</a> · <a href="/salary-after-tax-calculator/100000/new-york">$100k in New York</a></p>
          <h2>For developers &amp; AI agents</h2>
          <p>
            <Link href="/developers">Connect all 105 calculators to AI agents</Link> via MCP, llms.txt,
            and the REST API — free, no key.
          </p>
          <h2>Popular home scenarios</h2>
          <p><a href="/home-affordability-calculator/100000">House on $100k</a> · <a href="/home-affordability-calculator/150000">House on $150k</a> · <a href="/mortgage-calculator/300000">$300k mortgage</a> · <a href="/mortgage-calculator/500000">$500k mortgage</a> · <a href="/mortgage-calculator/houston-texas">Houston mortgage</a> · <a href="/mortgage-calculator/new-york-new-york">NYC mortgage</a></p>
          <h2>Why use our calculators?</h2>
          <p>Every calculator runs instantly in your browser — no page reloads, no sign-up, no data collected. Formulas use standard US amortization, current federal tax brackets, and state-specific tax data. Full transparency: see our <a href="/methodology">methodology page</a> for the exact formulas and data sources.</p>
          <h2>State-specific tools</h2>
          <p>Salary, paycheck, income tax, mortgage, sales tax, property tax, and home affordability calculators are available for all 50 states — for example <a href="/salary-after-tax-calculator/texas">Texas</a>, <a href="/salary-after-tax-calculator/california">California</a>, <a href="/salary-after-tax-calculator/florida">Florida</a>, and <a href="/salary-after-tax-calculator/new-york">New York</a>. See the <a href="/states">full state list</a> for every state&apos;s tax structure, or compare two states side by side.</p>
          <h2>Embed our calculators free</h2>
          <p>Webmasters and bloggers: add accurate financial calculators to any site with one line of code. See the <a href="/widgets">free embeddable widgets</a> page.</p>
        </div>
      </main>
    </>
  );
}
