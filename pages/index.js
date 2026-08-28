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
          <p>Every calculator runs instantly in your browser — no page reloads, no sign-up, no data collected. Formulas use standard US amortization and 2025 federal tax brackets.</p>
          <h2>More tools coming soon</h2>
          <p>TDEE, water intake, body fat, sleep, paint, and mulch calculators are in the pipeline.</p>
        </div>
      </main>
    </>
  );
}
