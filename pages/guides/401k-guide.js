import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";

/** Guide: 401k basics — cornerstone content with embedded calculator. */
export default function Guide401k() {
  const tool = getTool("401k-calculator");
  return (
    <>
      <Head>
        <title>401k Guide 2026 — Match, Limits & Growth | US Money HQ</title>
        <meta name="description" content="How 401k plans work in 2026: employer match, contribution limits, Roth vs traditional, and what $500/month grows to." />
        <link rel="canonical" href={`${SITE_URL}/guides/401k-guide`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "401k Guide 2026", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-30" }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>401k Basics</span></nav>
        <h1>The 401k Guide: Match, Limits, and Growth</h1>
        <p className="sub">The single best retirement account most Americans have — here's how to use it.</p>

        <AdSlot id="guide-401k-top" />

        <div className="seo">
          <h2>The free money rule</h2>
          <p>An employer match is a guaranteed 50-100% return on day one. If your company matches 50% up to 6% of salary, contribute at least 6% — skipping it is leaving free money on the table.</p>
          <h2>2026 limits</h2>
          <p>The employee contribution limit is $23,500 for 2026 (catch-up of $7,500 for those 50+). Employer match does not count toward your limit, but total contributions cap around $70,000.</p>
          <h2>Roth or traditional?</h2>
          <p>Traditional lowers your tax bill today and taxes withdrawals later. Roth taxes now but grows tax-free forever. Most young earners benefit from Roth; most high earners benefit from traditional. A mix hedges against future tax changes.</p>
          <h2>What your contributions grow to</h2>
        </div>

        {tool && <ToolClient tool={tool} />}

        <div className="seo">
          <h2>Related tools</h2>
          <ul>
            <li><Link href="/retirement-calculator">Retirement Calculator</Link> — are you on track?</li>
            <li><Link href="/rmd-calculator">RMD Calculator</Link> — what the IRS forces out later</li>
            <li><Link href="/investment-calculator">Investment Calculator</Link> — model the growth</li>
            <li><Link href="/guides/investing-basics-guide">Investing Basics Guide</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
