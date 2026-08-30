import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";

/** Guide: debt snowball — cornerstone content with embedded calculator. */
export default function DebtSnowballGuide() {
  const tool = getTool("debt-snowball-calculator");
  return (
    <>
      <Head>
        <title>Debt Snowball Guide 2026 — Debt-Free Date & Method | US Money HQ</title>
        <meta name="description" content="Snowball vs avalanche across multiple debts: the exact order, the debt-free date, and the math that keeps you motivated." />
        <link rel="canonical" href={`${SITE_URL}/guides/debt-snowball-guide`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "Debt Snowball Guide 2026", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-30" }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>Debt Snowball</span></nav>
        <h1>Multiple Debts? Run the Snowball.</h1>
        <p className="sub">One payment strategy for every balance you owe.</p>

        <AdSlot id="guide-snowball-top" />

        <div className="seo">
          <h2>How the snowball works</h2>
          <p>Pay minimums on everything. Put every extra dollar toward the SMALLEST balance first. When it's gone, roll its payment into the next smallest. The wins come fast — that's the point: momentum keeps you in the game.</p>
          <h2>Avalanche is cheaper, snowball is stickier</h2>
          <p>Avalanche (highest APR first) saves the most interest. Snowball (smallest first) finishes more accounts sooner. Studies show people stick with snowball longer — and the best method is the one you don't quit.</p>
          <h2>The debt-free date is the real target</h2>
          <p>Set a monthly budget for debt, add it to the calculator, and you'll get the exact month you're free. Write that date down. It beats any motivation app.</p>
          <h2>Your plan, calculated</h2>
        </div>

        {tool && <ToolClient tool={tool} />}

        <div className="seo">
          <h2>Related tools</h2>
          <ul>
            <li><Link href="/debt-payoff-calculator">Debt Payoff Calculator</Link> — single-debt plan</li>
            <li><Link href="/credit-card-payoff-calculator">Credit Card Payoff Calculator</Link></li>
            <li><Link href="/budget-calculator">Budget Calculator</Link> — free up the extra payment</li>
            <li><Link href="/guides/debt-payoff-guide">The Fastest Way to Pay Off Debt</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
