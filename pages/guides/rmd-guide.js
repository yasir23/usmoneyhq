import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";

/** Guide: RMD basics — cornerstone content with embedded calculator. */
export default function RmdGuide() {
  const tool = getTool("rmd-calculator");
  return (
    <>
      <Head>
        <title>RMD Guide 2026 — Required Minimum Distributions Explained | US Money HQ</title>
        <meta name="description" content="RMDs explained: when they start, the IRS life-expectancy math, the 25% penalty, and strategies to manage them." />
        <link rel="canonical" href={`${SITE_URL}/guides/rmd-guide`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "RMD Guide 2026", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-30" }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>RMD Basics</span></nav>
        <h1>Required Minimum Distributions, Explained</h1>
        <p className="sub">The IRS eventually takes back the tax break — here's the rule.</p>

        <AdSlot id="guide-rmd-top" />

        <div className="seo">
          <h2>When RMDs start</h2>
          <p>Age 73 if you were born between 1951-1959; age 75 if born 1960 or later. Your first distribution can slide to April 1 of the year after you hit the RMD age — after that, take one every year by December 31.</p>
          <h2>The math</h2>
          <p>Divide your December 31 balance by the IRS life-expectancy factor for your age. At 73 the factor is 26.5 — a $500k IRA requires about $18,868 that year. The factor shrinks as you age, so the percentage rises.</p>
          <h2>The penalty is brutal</h2>
          <p>Missing an RMD costs 25% of the amount you should have withdrawn (10% if corrected quickly). It's the most expensive retirement mistake to make — set a calendar reminder.</p>
          <h2>Your distribution</h2>
        </div>

        {tool && <ToolClient tool={tool} />}

        <div className="seo">
          <h2>Related tools</h2>
          <ul>
            <li><Link href="/retirement-calculator">Retirement Calculator</Link></li>
            <li><Link href="/401k-calculator">401k Calculator</Link></li>
            <li><Link href="/social-security-calculator">Social Security Calculator</Link></li>
            <li><Link href="/guides/401k-guide">The 401k Guide</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
