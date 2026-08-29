import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";

/** Guide: how much house can I afford — cornerstone content with embedded calculator. */
export default function HouseAffordabilityGuide() {
  const tool = getTool("home-affordability-calculator");
  return (
    <>
      <Head>
        <title>How Much House Can I Afford? 2026 Guide | US Money HQ</title>
        <meta name="description" content="How much house can I afford? The 28/36 rule, down payments, rates, and real examples for $60k-$200k salaries. Use the free calculator." />
        <link rel="canonical" href={`${SITE_URL}/guides/how-much-house-can-i-afford`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "How Much House Can I Afford? 2026 Guide", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-29" }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>How Much House Can I Afford</span></nav>
        <h1>How Much House Can I Afford in 2026?</h1>
        <p className="sub">The honest answer uses three numbers: income, debt, and down payment.</p>

        <AdSlot id="guide-afford-top" />

        <div className="seo">
          <h2>The 28/36 rule, demystified</h2>
          <p>Lenders want your housing payment under <strong>28% of gross income</strong> and total debt under 36%. That payment includes principal, interest, property tax, and insurance (PITI) — not just the mortgage itself.</p>
          <p><strong>Salary → affordable home (20% down, 6.5% rate, no other debt):</strong></p>
          <ul>
            <li>$60k salary → about $220k home</li>
            <li>$100k salary → about $370k home</li>
            <li>$150k salary → about $555k home</li>
            <li>$200k salary → about $740k home</li>
          </ul>
          <h2>Why the down payment changes everything</h2>
          <p>20% down avoids PMI and lowers your payment. 10% or less means private mortgage insurance — roughly 0.5-1% of the loan per year — added to every payment. A $20k down payment buys a very different home than $80k.</p>
          <h2>Debt is the silent disqualifier</h2>
          <p>Car loans, student loans, and credit card minimums all count against the 36% back-end ratio. Two buyers with the same salary qualify for different amounts based purely on existing debt.</p>
          <h2>Run your real numbers</h2>
        </div>

        {tool && <ToolClient tool={tool} />}

        <div className="seo">
          <h2>Related tools</h2>
          <ul>
            <li><Link href="/mortgage-calculator">Mortgage Calculator</Link> — your actual monthly payment</li>
            <li><Link href="/dti-calculator">DTI Ratio Calculator</Link> — do you pass the 36% test?</li>
            <li><Link href="/pmi-calculator">PMI Calculator</Link> — what under-20% down costs</li>
            <li><Link href="/guides/mortgage-calculator-guide">Mortgage Basics Guide</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
