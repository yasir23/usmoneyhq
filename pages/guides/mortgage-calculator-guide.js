import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";

/** Guide: mortgage basics — cornerstone content with embedded calculator. */
export default function MortgageGuide() {
  const tool = getTool("mortgage-calculator");
  return (
    <>
      <Head>
        <title>Mortgage Calculator Guide 2026 — Payments Explained | US Money HQ</title>
        <meta name="description" content="How mortgage payments work in 2026: principal, interest, taxes, insurance, PMI, and terms. Free calculator inside." />
        <link rel="canonical" href={`${SITE_URL}/guides/mortgage-calculator-guide`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "Mortgage Calculator Guide 2026", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-29" }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>Mortgage Basics</span></nav>
        <h1>How Mortgage Payments Work in 2026</h1>
        <p className="sub">Every part of your payment, explained — then calculated.</p>

        <AdSlot id="guide-mortgage-top" />

        <div className="seo">
          <h2>The four parts of a mortgage payment (PITI)</h2>
          <ul>
            <li><strong>Principal</strong> — the loan balance you're paying down</li>
            <li><strong>Interest</strong> — the cost of borrowing, front-loaded in early years</li>
            <li><strong>Taxes</strong> — property tax, collected monthly into escrow</li>
            <li><strong>Insurance</strong> — homeowners insurance (and PMI below 20% down)</li>
          </ul>
          <h2>15 vs 30 years</h2>
          <p>A 15-year term has a higher payment but roughly half the total interest. A 30-year term is more affordable monthly but costs far more over the life of the loan. The right choice depends on your cash flow and how long you'll stay.</p>
          <h2>Rates in 2026</h2>
          <p>Rates have settled lower than their 2023 peak but remain above the pandemic-era lows. Your rate depends on credit score, down payment, loan type, and lender — always compare at least three quotes and consider buying points (see the points calculator).</p>
          <h2>Your payment, calculated</h2>
        </div>

        {tool && <ToolClient tool={tool} />}

        <div className="seo">
          <h2>Related tools</h2>
          <ul>
            <li><Link href="/mortgage-points-calculator">Mortgage Points Calculator</Link> — should you buy down the rate?</li>
            <li><Link href="/escrow-calculator">Escrow Calculator</Link> — taxes and insurance in your payment</li>
            <li><Link href="/refinance-calculator">Refinance Calculator</Link> — worth refinancing?</li>
            <li><Link href="/guides/how-much-house-can-i-afford">How Much House Can I Afford?</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
