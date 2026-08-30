import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TOOLS, SITE_URL, SITE_NAME, SITE_DESC } from "../lib/tools";
import { CATEGORIES } from "../lib/categories";

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

  const categorize = (slug) => {
    for (const c of CATEGORIES) {
      if (c.match.some((k) => slug.includes(k))) return c.name;
    }
    return "Everyday & Business";
  };

  const grouped = CATEGORIES.map((c) => ({
    ...c,
    tools: filtered.filter((t) => categorize(t.slug) === c.name),
  })).filter((c) => c.tools.length > 0);

  return (
    <>
      <Head>
        <title>US Money HQ — Free Financial Calculators & Money Tools (2026)</title>
        <meta name="description" content={SITE_DESC} />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="US Money HQ — Free Financial Calculators & Money Tools" />
        <meta property="og:description" content={SITE_DESC} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <main className="container">
        <h1>Free US Financial Calculators</h1>
        <p className="sub">Fast, accurate, no sign-up. {TOOLS.length} tools updated for 2026.</p>

        <div className="search-bar">
          <input
            type="search"
            placeholder="Search 96 calculators — try 'mortgage', 'tax', 'bmi'…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search calculators"
          />
          {q && <p className="search-count">{filtered.length} of {TOOLS.length} tools match "{query.trim()}"</p>}
        </div>

        <nav className="cat-jump" aria-label="Categories">
          {grouped.map((c) => (
            <section key={c.name} id={c.name.toLowerCase().replace(/[^a-z]+/g, "-")} className="cat-section">
              <h2 className="cat-title">{c.name}</h2>
              <div className="tool-grid">
                {c.tools.map((t) => (
                  <Link key={t.slug} href={`/${t.slug}`} className="tool-card">
                    <h3>{t.shortTitle}</h3>
                    <p>{t.description.split(".")[0]}.</p>
                    <span className="cta">Open calculator →</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="seo">
          <h2>Why use our calculators?</h2>
          <p>Every calculator runs instantly in your browser — no page reloads, no sign-up, no data collected. Formulas use standard US amortization, current federal tax brackets, and state-specific tax data. Full transparency: see our <a href="/methodology">methodology page</a> for the exact formulas and data sources.</p>
          <h2>State-specific tools</h2>
          <p>Salary, paycheck, income tax, mortgage, sales tax, property tax, and home affordability calculators are available for all 50 states — for example <a href="/salary-after-tax-calculator/texas">Texas</a>, <a href="/salary-after-tax-calculator/california">California</a>, <a href="/salary-after-tax-calculator/florida">Florida</a>, and <a href="/salary-after-tax-calculator/new-york">New York</a>.</p>
          <h2>Embed our calculators free</h2>
          <p>Webmasters and bloggers: add accurate financial calculators to any site with one line of code. See the <a href="/widgets">free embeddable widgets</a> page.</p>
        </div>
      </main>
    </>
  );
}
