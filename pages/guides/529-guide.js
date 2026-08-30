import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";

/** Guide: 529 college savings — cornerstone content with embedded calculator. */
export default function College529Guide() {
  const tool = getTool("529-calculator");
  return (
    <>
      <Head>
        <title>529 College Savings Guide 2026 — Plans & Deductions | US Money HQ</title>
        <meta name="description" content="529 plans explained: state tax deductions, investment growth, qualified expenses, and what college actually costs in 2026." />
        <link rel="canonical" href={`${SITE_URL}/guides/529-guide`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "529 College Savings Guide 2026", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-30" }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>529 Plans</span></nav>
        <h1>The 529 Plan Guide: College Savings Done Right</h1>
        <p className="sub">Tax-free growth, state deductions, and the real cost of college.</p>

        <AdSlot id="guide-529-top" />

        <div className="seo">
          <h2>The tax trifecta</h2>
          <p>Contributions grow tax-free, withdrawals for qualified education are tax-free, and 30+ states offer a tax deduction on contributions. That's a rare triple — no other account structure does all three.</p>
          <h2>What counts as qualified</h2>
          <p>Tuition, room and board, books, computers, and now up to $10,000/year for K-12 tuition. Since 2024, unused 529 funds can also roll into a Roth IRA (up to $35,000 lifetime, after 15 years).</p>
          <h2>The state deduction fine print</h2>
          <p>Most states deduct contributions to THEIR plan — check before investing out of state. A few states (CA, NJ) offer no deduction at all, so any state's plan works there.</p>
          <h2>Your savings plan</h2>
        </div>

        {tool && <ToolClient tool={tool} />}

        <div className="seo">
          <h2>Related tools</h2>
          <ul>
            <li><Link href="/investment-calculator">Investment Calculator</Link></li>
            <li><Link href="/compound-interest-calculator">Compound Interest Calculator</Link></li>
            <li><Link href="/guides/investing-basics-guide">Investing Basics Guide</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
