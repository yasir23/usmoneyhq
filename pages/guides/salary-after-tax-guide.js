import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";

/** Guide: salary after tax — cornerstone content with embedded calculator. */
export default function SalaryTaxGuide() {
  const tool = getTool("salary-after-tax-calculator");
  return (
    <>
      <Head>
        <title>Salary After Tax Guide 2026 — Take-Home Pay Explained | US Money HQ</title>
        <meta name="description" content="How much of your salary you actually keep: federal brackets, FICA, state taxes, and real take-home examples for every state." />
        <link rel="canonical" href={`${SITE_URL}/guides/salary-after-tax-guide`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "Salary After Tax Guide 2026", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" }, datePublished: "2026-08-29" }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Guides</span><span aria-hidden="true">›</span><span>Salary After Tax</span></nav>
        <h1>How Much of Your Salary You Actually Keep</h1>
        <p className="sub">Three deductions decide your take-home: federal, FICA, and state.</p>

        <AdSlot id="guide-salary-top" />

        <div className="seo">
          <h2>Federal income tax</h2>
          <p>Marginal brackets (10-37%) apply only to income within each band. After the $15,000 standard deduction (single), a $75k salary is taxed at 10-22% — an effective rate around 11%. A raise never pushes ALL your income into a higher bracket.</p>
          <h2>FICA: the 7.65% everyone pays</h2>
          <p>Social Security (6.2%) up to the wage base and Medicare (1.45%, no cap) come out of every paycheck regardless of bracket. Self-employed workers pay both halves (15.3%).</p>
          <h2>State tax: where you live matters most</h2>
          <p>Nine states (TX, FL, NV, NH, SD, TN, WA, WY, AK) charge no income tax. California tops out near 13.3%; most states sit between 3-7%. A $75k salary can differ by $5,000+/year in take-home between best and worst states.</p>
          <h2>Your take-home, by state</h2>
        </div>

        {tool && <ToolClient tool={tool} />}

        <div className="seo">
          <h2>Related tools</h2>
          <ul>
            <li><Link href="/tax-bracket-calculator">Tax Bracket Calculator</Link> — your marginal and effective rate</li>
            <li><Link href="/paycheck-calculator">Paycheck Calculator</Link> — per-paycheck view</li>
            <li><Link href="/tax-refund-calculator">Tax Refund Calculator</Link> — refund or owed?</li>
            <li><Link href="/salary-after-tax-calculator/california-vs-texas">California vs Texas take-home comparison</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
