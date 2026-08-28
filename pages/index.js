import Head from "next/head";
import Link from "next/link";
import { TOOLS, SITE_URL, SITE_NAME, SITE_DESC } from "../lib/tools";

/** Homepage — registry-driven tool grid. New tool in lib/tools.ts appears here automatically. */
export default function Home() {
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <main className="container">
        <h1>Free US Financial Calculators</h1>
        <p className="sub">Fast, accurate, no sign-up. Updated for 2026.</p>

        <div className="tool-grid">
          {TOOLS.map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="tool-card">
              <h2>{t.shortTitle}</h2>
              <p>{t.description.split(".")[0]}.</p>
              <span className="cta">Open calculator →</span>
            </Link>
          ))}
        </div>

        <div className="seo">
          <h2>Why use our calculators?</h2>
          <p>Every calculator runs instantly in your browser — no page reloads, no sign-up, no data collected. Formulas use standard US amortization, current federal tax brackets, and state-specific tax data. Full transparency: see our <a href="/methodology">methodology page</a> for the exact formulas and data sources.</p>
          <h2>State-specific tools</h2>
          <p>Salary, paycheck, income tax, mortgage, and home affordability calculators are available for all 50 states — for example <a href="/salary-after-tax-calculator/texas">Texas</a>, <a href="/salary-after-tax-calculator/california">California</a>, <a href="/salary-after-tax-calculator/florida">Florida</a>, and <a href="/salary-after-tax-calculator/new-york">New York</a>.</p>
          <h2>Embed our calculators free</h2>
          <p>Webmasters and bloggers: add accurate financial calculators to any site with one line of code. See the <a href="/widgets">free embeddable widgets</a> page.</p>
        </div>
      </main>
    </>
  );
}
