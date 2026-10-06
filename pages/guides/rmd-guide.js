import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import GuideFaq from "../../components/GuideFaq";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";
import { CONTENT_DATES } from "../../lib/content-dates";

/**
 * Guide: RMD basics — cornerstone content with embedded calculator.
 *
 * DEEPENED 2026-10-06. Search Console showed this page carrying the largest
 * guide-level impression count in the export (821 impressions) at an average
 * position of 90.6 — the widest gap on the site between demand and rank. It was
 * also 552 words, which is thin for a guide competing on a tax-mechanics query.
 *
 * Every figure below is derived from the SAME factor table the calculator uses
 * (rmdEstimate in lib/calc.ts), so the guide and the tool cannot disagree. A
 * guide that quotes a divisor the tool does not use is a defect, not a rounding
 * difference.
 */

/** Renders the material-change date for the guides group. Derived, not typed. */
const REVIEWED_ON = (() => {
  const [y, m, d] = CONTENT_DATES.guides.split("-").map(Number);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  return `${d} ${MONTHS[m - 1]} ${y}`;
})();

export default function RmdGuide() {
  const tool = getTool("rmd-calculator");
  return (
    <>
      <Head>
        <title>RMD Guide 2026 — Required Minimum Distributions Explained | US Money HQ</title>
        <meta name="description" content="RMDs explained: when they start, the IRS life-expectancy math, the 25% penalty, and strategies to manage them." />
        <link rel="canonical" href={`${SITE_URL}/guides/rmd-guide`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "RMD Guide 2026", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-30", dateModified: CONTENT_DATES.guides }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>RMD Basics</span></nav>
        <h1>Required Minimum Distributions, Explained</h1>
        <p className="sub">The IRS eventually takes back the tax break — here's the rule.</p>

        <AdSlot id="guide-rmd-top" />

        <div className="seo">
          <h2>When RMDs start</h2>
          <p>Age 73 if you were born between 1951-1959; age 75 if born 1960 or later. Your first distribution can slide to April 1 of the year after you hit the RMD age — after that, take one every year by December 31.</p>
          <p>The April 1 date is a one-time option, and it is the most commonly misread rule here. It moves the <em>deadline</em>, not the tax year: a distribution taken by April 1 of the following year still counts as income for the year you deferred it into. Use it and you take two distributions in one calendar year, which can push you into a higher bracket or trigger higher Medicare premiums on the same money.</p>
          <p>The age that applies is set by statute and depends on your birth year, so the calculator asks for the year you were born rather than assuming a single retirement age.</p>
        </div>

        <div className="seo">
          <h2>Which accounts are affected</h2>
          <p>RMDs apply to traditional IRAs, 401(k)s, 403(b)s and most other employer retirement plans. They do not apply to a Roth IRA during the owner's lifetime, and Roth 401(k)s are no longer subject to them either.</p>
          <p>The balance used is the one on December 31 of the <em>previous</em> year — not the balance on the day you take the distribution. A market drop in the year you withdraw does not reduce the amount you were required to take, because the requirement was fixed by a balance that no longer exists.</p>
        </div>

        <AdSlot id="guide-rmd-mid" />

        <div className="seo">
          <h2>The math</h2>
          <p>Divide your December 31 balance by the IRS life-expectancy factor for your age. At 73 the factor is 26.5 — a $500k IRA requires about $18,868 that year. The factor shrinks as you age, so the percentage rises.</p>
          <p>The factor comes from the IRS Uniform Lifetime Table, a fixed schedule rather than a prediction about you personally. Because the divisor falls every year, the required <em>percentage</em> rises every year, which is the part people are surprised by: the withdrawal is not a flat share of the account.</p>
          <ul>
            <li>Age 73 — factor 26.5 — 3.77% required — $18,868 on a $500,000 balance</li>
            <li>Age 75 — factor 24.6 — 4.07% required — $20,325</li>
            <li>Age 80 — factor 20.2 — 4.95% required — $24,752</li>
            <li>Age 85 — factor 16.0 — 6.25% required — $31,250</li>
            <li>Age 90 — factor 12.2 — 8.20% required — $40,984</li>
            <li>Age 95 — factor 8.9 — 11.24% required — $56,180</li>
          </ul>
          <p>These are the same factors the calculator applies, so the numbers you see in the tool and the numbers in this table will agree.</p>
        </div>

        <div className="seo">
          <h2>Worked example: two distributions in one year</h2>
          <p>Assume a $500,000 balance held level, and a first RMD deferred to April 1 of the following year as the rule allows.</p>
          <ul>
            <li>Age-73 requirement, taken by April 1 — $18,868</li>
            <li>Age-74 requirement, taken by December 31 of that same year — $19,608</li>
            <li>Taxable in that single calendar year — $38,476</li>
          </ul>
          <p>Nothing was done wrong. The deferral is permitted, and the two distributions simply land in one tax year. On a balance this size the second one is what makes the year expensive, and the tax on $38,476 is not the tax on $18,868 — the marginal rate on the upper slice is what matters, along with any income-tested Medicare premium surcharge that year.</p>
        </div>

        <div className="seo">
          <h2>The penalty is brutal</h2>
          <p>Missing an RMD costs 25% of the amount you should have withdrawn (10% if corrected quickly). It's the most expensive retirement mistake to make — set a calendar reminder.</p>
          <p>On a missed $19,608 distribution the excise tax is $4,902, and it falls to $1,961 when the shortfall is corrected inside the correction window. Note what the penalty is charged on: the amount you <em>failed</em> to take, not the whole account. A partial withdrawal reduces the penalty in proportion to the amount you did take, which is why correcting late is still much better than not correcting.</p>
        </div>

        <div className="seo">
          <h2>Your distribution</h2>
        </div>

        {tool && <ToolClient tool={tool} showFaq={false} excludeRelated={["retirement-calculator", "401k-calculator", "social-security-calculator"]} />}

        <GuideFaq slug="rmd-guide" />

        <div className="seo">
          <h2>What this calculator does not model</h2>
          <ul>
            <li><strong>Inherited accounts.</strong> A retirement account you inherit follows a different set of rules, including the requirement for most non-spouse beneficiaries to empty it within a defined period. The calculator models an owner's own RMD, not this case.</li>
            <li><strong>Aggregation across accounts.</strong> If you hold several IRAs, the requirement is calculated on the total and may be satisfied from any one of them or any combination. Employer plans do not work this way — a 401(k) requirement has to be met from that plan, so two 401(k)s cannot be covered by one withdrawal.</li>
            <li><strong>Qualified charitable distributions.</strong> A transfer made directly from an IRA to a qualifying charity can count toward the requirement, and the amount is excluded from income rather than deducted. Whether this applies, and up to what limit, depends on current rules.</li>
            <li><strong>Conversions.</strong> An RMD cannot be converted to a Roth or rolled over. It has to come out as a distribution first, and only then can anything remaining be converted.</li>
            <li><strong>State tax.</strong> This is a federal calculation. Whether your state taxes the withdrawal, and whether it exempts retirement income, is a separate question with its own rules.</li>
          </ul>
        </div>

        <div className="seo">
          <h2>Where the figures come from</h2>
          <p>The factor table is the IRS Uniform Lifetime Table. The starting ages and the April 1 deadline come from the same statute. Tax rates, bracket boundaries and the Medicare surcharge thresholds change and are deliberately not quoted here — the calculator defers to the current year's figures rather than printing a number that quietly goes stale.</p>
          <p className="note last-reviewed">Last reviewed {REVIEWED_ON} against its sources. Formulas, sources and known exclusions are on the <Link href="/methodology">methodology page</Link>, and corrections can be sent through the <Link href="/contact">contact page</Link>.</p>
        </div>

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
