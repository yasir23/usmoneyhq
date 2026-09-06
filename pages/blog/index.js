import Head from "next/head";
import Link from "next/link";
import { SITE_URL } from "../../lib/tools";
/** Blog index — US Money HQ guides + healthcare price transparency education */
export default function BlogIndex() {
  return (
    <>
      <Head>
        <title>Blog & Guides | US Money HQ</title>
        <meta name="description" content="US Money HQ blog: personal finance guides, calculators, and hospital price transparency education for owners and finance teams." />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>Blog</span></nav>
        <h1>US Money HQ Blog & Guides</h1>
        <p className="sub">Personal finance calculators, guides, and healthcare price-transparency education.</p>
        <div className="seo">
          <h2>Healthcare price transparency (SealOfAudit education)</h2>
          <ul>
            <li><Link href="/blog/cms-warns-500-hospitals-2026">CMS Just Warned 500+ Hospitals in 2026 — Is Yours on the List?</Link></li>
            <li><Link href="/blog/cms-enforcement-tracker-2026">The 2026 CMS Price Transparency Enforcement Tracker</Link></li>
            <li><Link href="/blog/no-more-grace-period-enforcement-2026">No More Grace Period: What the 2026 Enforcement Stance Means for Hospitals</Link></li>
            <li><Link href="/blog/from-warning-letter-to-fine-timeline">From Warning Letter to Fine: How Long Do Hospitals Actually Have?</Link></li>
            <li><Link href="/blog/pinnacle-hospital-fined-twice">How a Small Hospital Got Fined Twice in One Year — the Pinnacle Case</Link></li>
            <li><Link href="/blog/largest-cms-fine-northside">$883,180: Inside the Largest CMS Price Transparency Fine</Link></li>
            <li><Link href="/blog/real-cost-of-noncompliance">The Real Cost of Price Transparency Noncompliance: A Sliding Scale by Hospital Size</Link></li>
            <li><Link href="/blog/28-hospitals-fined-what-they-got-wrong">28 Hospitals Fined Since 2022 — What They All Got Wrong</Link></li>
            <li><Link href="/blog/fix-it-later-most-expensive-sentence">Why 'We'll Fix It Later' Is the Most Expensive Sentence in Hospital Compliance</Link></li>
            <li><Link href="/blog/most-warning-letters-formatting-errors">Most CMS Warning Letters Aren't About Hiding Prices — They're About Formatting</Link></li>
            <li><Link href="/blog/warning-letter-vs-cap-vs-fine">Warning Letter vs Corrective Action Plan vs Civil Monetary Penalty: The Stages Explained</Link></li>
            <li><Link href="/blog/escalation-rate-224-percent">2.24% of Warning Letters Escalate to Fines — Should That Relax You? (No)</Link></li>
            <li><Link href="/blog/what-is-machine-readable-file">What Is a Machine-Readable File, and Why Does CMS Care So Much?</Link></li>
            <li><Link href="/blog/allowed-amount-metrics-2026">The 2026 Requirement Nobody's Talking About: Allowed-Amount Metrics</Link></li>
            <li><Link href="/blog/compliance-attestation-signer">Who Has to Sign Your CMS Compliance Attestation — and What Happens If They Get It Wrong?</Link></li>
            <li><Link href="/blog/shoppable-services-101">Shoppable Services 101: What Patients Are Legally Entitled to See</Link></li>
            <li><Link href="/blog/5-technical-errors-trigger-warning-letters">5 Technical Errors That Trigger CMS Warning Letters (and How to Catch Them)</Link></li>
            <li><Link href="/blog/diy-vs-professional-mrf-audit">DIY Compliance Check vs Professional MRF Audit: What Actually Catches Problems?</Link></li>
            <li><Link href="/blog/what-to-ask-before-hiring-mrf-auditor">What to Ask Before Hiring Anyone to Audit Your Hospital's Price Transparency Files</Link></li>
            <li><Link href="/blog/corrective-action-plan-45-days">Corrective Action Plan Deadline Looming? What You Can Realistically Fix in 45 Days</Link></li>
          </ul>
          <h2>Free tools & services</h2>
          <ul>
            <li><Link href="/">Calculators & tools</Link></li>
            <li><a href="https://sealofaudit.com/">SealOfAudit — CMS MRF compliance for hospitals</a></li>
          </ul>
        </div>
      </main>
    </>
  );
}
