import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";

/** Guide: investing basics — cornerstone content with embedded calculator. */
export default function InvestingGuide() {
  const tool = getTool("investment-calculator");
  return (
    <>
      <Head>
        <title>Investing Basics Guide 2026 — Compound Growth Explained | US Money HQ</title>
        <meta name="description" content="Investing basics in 2026: compound interest, index funds, dollar-cost averaging, and what your money can become." />
        <link rel="canonical" href={`${SITE_URL}/guides/investing-basics-guide`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "Investing Basics Guide 2026", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-30" }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>Investing Basics</span></nav>
        <h1>Investing Basics: What Your Money Can Become</h1>
        <p className="sub">Compound growth is the quiet engine behind every retirement plan.</p>

        <AdSlot id="guide-invest-top" />

        <div className="seo">
          <h2>The math that matters</h2>
          <p>At 7% average annual return (about the long-run stock market average after inflation), money doubles roughly every 10 years. $10,000 invested at 25 becomes $150,000+ by 65 — without adding another dollar.</p>
          <h2>Index funds beat most experts</h2>
          <p>Over 90% of actively managed funds underperform their index over 15 years. A low-cost S&P 500 index fund (expense ratio under 0.10%) captures the market's growth without the guesswork.</p>
          <h2>Time in the market beats timing the market</h2>
          <p>Dollar-cost averaging — investing a fixed amount every month regardless of price — smooths volatility and removes emotion. Missing the market's 10 best days in a decade can halve your returns.</p>
          <h2>Your growth, modeled</h2>
        </div>

        {tool && <ToolClient tool={tool} />}

        <div className="seo">
          <h2>Related tools</h2>
          <ul>
            <li><Link href="/compound-interest-calculator">Compound Interest Calculator</Link></li>
            <li><Link href="/rule-of-72-calculator">Rule of 72 Calculator</Link> — years to double</li>
            <li><Link href="/dividend-calculator">Dividend Calculator</Link></li>
            <li><Link href="/guides/401k-guide">401k Guide</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
