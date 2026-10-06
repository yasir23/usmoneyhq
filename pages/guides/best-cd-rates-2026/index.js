import Head from "next/head";
import Link from "next/link";
import AdSlot from "../../../components/AdSlot";
import { SITE_URL } from "../../../lib/tools";
import { CONTENT_DATES } from "../../../lib/content-dates";

/**
 * Guide: Best CD Rates 2026. Targets cd-calculator + savings traffic.
 *
 * REWRITTEN 2026-10-06. The previous version opened with an assertion about the
 * rate environment being below earlier highs, and a specific point gap between
 * online and branch institutions. Both are rate claims this site cannot verify
 * and cannot keep current, and a stale rate claim on a finance page is the exact
 * liability this project treats as worse than no claim. This version states only
 * mechanics that hold in any rate environment, and defers every rate to the
 * reader's own inputs in the calculator.
 *
 * The old figures are deliberately NOT reproduced here. A stale rate number is
 * a stale rate number wherever it sits, and scripts/verify_guides.py scans this
 * file for them — it caught the first draft of this very comment.
 */

const REVIEWED_ON = (() => {
  const [y, m, d] = CONTENT_DATES.guides.split("-").map(Number);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  return `${d} ${MONTHS[m - 1]} ${y}`;
})();

export default function BestCdRates() {
  return (
    <>
      <Head>
        <title>Best CD Rates 2026: Where to Lock a High Rate | US Money HQ</title>
        <meta name="description" content="Best certificate of deposit rates in 2026 compared — term by term. See the real maturity math with the free CD calculator before you lock." />
        <link rel="canonical" href={`${SITE_URL}/guides/best-cd-rates-2026`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "Best CD Rates 2026: Where to Lock a High Rate", description: "CD rate comparison with maturity math.", url: `https://usmoneyhq.com/guides/best-cd-rates-2026`, datePublished: "2026-09-08", dateModified: CONTENT_DATES.guides, author: { "@type": "Organization", name: "US Money HQ" } }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/guides">Guides</Link><span aria-hidden="true">›</span><span>Best CD Rates 2026</span></nav>
        <h1>Best CD Rates 2026: Where to Lock a High Rate</h1>
        <p className="sub">The term-by-term rate picture, and the maturity math to run before you lock.</p>
        <AdSlot id="cd-rates-top" />
        <div className="seo">
          <h2>Why this page does not print a rate table</h2>
          <p>CD rates change weekly and vary by institution, term, balance and whether the account is new money. A table published here would be out of date before it was useful, and a stale rate on a finance page is worse than no rate at all. What is stable is the arithmetic of a CD — and that arithmetic is what decides whether a rate is actually good. Run your own numbers in the <Link href="/cd-calculator">CD calculator</Link>.</p>

          <h2>The APY already contains the compounding</h2>
          <p>An annual percentage yield is the total return over a year with compounding folded in. So a year at 4.5% APY grows a deposit by exactly 1.045 — no monthly step is needed, because the monthly step is what produced the 4.5% in the first place. Take 4.5%, divide by twelve, compound for twelve months, and you have applied compounding twice: once when the institution calculated the yield, and once in your own arithmetic.</p>

          <h2>Part-year terms use a fractional power</h2>
          <p>A six-month term at 4.5% APY does not earn half of 4.5%. It earns 1.045^0.5 - 1, about 2.23%, because the yield is a compounded annual figure and half a year is half a year of compounded growth. On $10,000 the shortcut gives $10,225 and the correct answer is $10,222.52 — a $2.48 difference. Small, but it always runs in the same direction and it scales with the deposit.</p>

          <h2>Early withdrawal is where a good rate goes bad</h2>
          <p>Most CDs charge a penalty of several months of interest if you withdraw before maturity. On $10,000 at 4.5%, three months of interest is $112.50. That penalty is why the comparison is not between two rates but between two rates <em>and</em> the probability you will need the money. A slightly lower rate on a term you can actually hold beats a higher rate you have to break.</p>

          <h2>What a ladder does, and what it does not</h2>
          <p>Splitting $30,000 into three $10,000 CDs maturing at six, twelve and twenty-four months means one rung matures every six months. That gives you something a single CD does not: a regular decision point, where you can reinvest at whatever is then available or take the cash. It does not raise your average rate on its own — it trades a small amount of yield for the option to change your mind. Whether that trade is worth it depends on where you think rates are going, which is a forecast, not a calculation.</p>

          <h2>What to compare besides the rate</h2>
          <ul>
            <li><strong>Term, matched to when you need the money.</strong> The rate is only usable if the term fits.</li>
            <li><strong>The early-withdrawal penalty</strong>, expressed in months of interest.</li>
            <li><strong>Minimum deposit</strong>, and whether the advertised rate applies to the balance you actually have.</li>
            <li><strong>Automatic renewal</strong>, and at what rate — a maturing CD often rolls into whatever is then offered.</li>
            <li><strong>Insurance</strong>. Confirm the institution is federally insured before moving money.</li>
          </ul>
        </div>

        <div className="seo">
          <h2>Worked example: $10,000 at an assumed 4.5% APY</h2>
          <p>Rate assumed at 4.5% to make the arithmetic checkable. It is an assumption, not a quote, and not a claim about what any institution pays.</p>
          <ul>
            <li>Full year at 4.5% APY — $10,450.00, which is one multiplication: 10,000 x 1.045</li>
            <li>Six months at the same APY — $10,222.52, from 10,000 x 1.045^0.5</li>
            <li>Six months using the shortcut — $10,225.00, from 10,000 x 1.0225</li>
            <li>Cost of the shortcut — $2.48, and it is always an overstatement</li>
            <li>Three months of interest, the typical penalty — $112.50, from 10,000 x 0.045 / 4</li>
          </ul>
          <p>The whole calculation is one multiplication, because the compounding is already inside the APY. The only real decision on this page is the term, and that is a question about when you need the money rather than about arithmetic.</p>
          <p className="note last-reviewed">Last reviewed {REVIEWED_ON} against its sources. Formulas, sources and known exclusions are on the <Link href="/methodology">methodology page</Link>, and corrections can be sent through the <Link href="/contact">contact page</Link>.</p>
        </div>

        <div className="seo">
          <h2>Run the maturity math first</h2>
          <p>See your exact CD maturity value before you lock a rate: <Link href="/cd-calculator">open the CD calculator</Link>. Compare a part-year term against holding cash in <Link href="/guides/best-high-yield-savings-2026">a savings account</Link>, and check the blended return of a ladder with the <Link href="/savings-goal-calculator">savings goal calculator</Link>.</p>
          <p style={{ fontSize: 13, color: "#666" }}>Educational content — US Money HQ is not a bank or financial advisor. Rates change; verify current terms with the institution.</p>
        </div>
      </main>
    </>
  );
}
