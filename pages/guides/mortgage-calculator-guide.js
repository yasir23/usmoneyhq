import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import GuideFaq from "../../components/GuideFaq";
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
        
          <h2>What a $400,000 mortgage actually costs</h2>
          <p>
            Rate shopping sounds like a fraction of a percent. On a $400,000 loan over 30 years it
            is tens of thousands of dollars. The table below is arithmetic, not an estimate: the
            standard amortising payment formula at three rates a borrower was plausibly offered
            in the same month.
          </p>
          <table>
            <thead>
              <tr><th>Rate</th><th>Monthly principal &amp; interest</th><th>Total paid over 30 years</th><th>Of which interest</th></tr>
            </thead>
            <tbody>
              <tr><td>6.0%</td><td>$2,398</td><td>$863,353</td><td>$463,353</td></tr>
              <tr><td>6.5%</td><td>$2,528</td><td>$910,178</td><td>$510,178</td></tr>
              <tr><td>7.0%</td><td>$2,661</td><td>$958,036</td><td>$558,036</td></tr>
            </tbody>
          </table>
          <p>
            A full percentage point — 6.0% to 7.0% — moves the payment by about $270 a month and the
            lifetime cost by roughly $96,000. That is the entire argument for getting more than one
            quote, and it is why the <Link href="/mortgage-calculator">mortgage calculator</Link> asks
            for the rate rather than assuming one.
          </p>

          <h2>Why the balance barely moves at first</h2>
          <p>
            In month one of a 6.5% loan, about $2,167 of a $2,528 payment is interest. The balance
            falls by roughly $360. This is not a trick of the lender; it is what a percentage of a
            large number does. The table shows the balance on the same $400,000 loan at 6.5%.
          </p>
          <table>
            <thead>
              <tr><th>After</th><th>Remaining balance</th><th>Principal repaid</th></tr>
            </thead>
            <tbody>
              <tr><td>5 years</td><td>$374,444</td><td>$25,556</td></tr>
              <tr><td>10 years</td><td>$339,105</td><td>$60,895</td></tr>
              <tr><td>15 years</td><td>$290,237</td><td>$109,763</td></tr>
              <tr><td>20 years</td><td>$222,661</td><td>$177,339</td></tr>
            </tbody>
          </table>
          <p>
            Ten years of payments — over $300,000 handed over — retires about a fifth of the loan.
            This is the arithmetic that makes extra principal payments disproportionately powerful
            early on, and it is why the difference between a 30-year and a 15-year term is much
            larger than the payment difference suggests.
          </p>

          <h2>What is not in the payment</h2>
          <p>
            Principal and interest are two of four parts. Property tax, homeowners insurance and,
            below 20% down, mortgage insurance are escrowed on top and vary by county and credit
            profile. Two houses with identical loans in different counties can differ by hundreds a
            month. Any calculator that returns one number without asking for a county is quoting the
            easy half.
          </p>
          <p>
            Mortgage insurance is the part borrowers most often forget: it is charged on the loan
            balance, it is not tax deductible at every income level, and it usually ends
            automatically once the balance reaches 78% of the original value. If you put 10% down,
            plan for it and plan for when it stops.
          </p>

          <h2>Fixed or adjustable</h2>
          <p>
            A fixed rate prices certainty. An adjustable rate prices the first years cheaply and
            moves the risk to the borrower after the initial period. The comparison is only
            meaningful with a holding period attached: if you will sell or refinance inside the
            fixed period of the ARM, the ARM can win on total cost; if you will still be there
            afterwards, you have bought a cheaper payment for a few years and an unknown one after.
          </p>
          <p>
            Model both in the <Link href="/refinance-calculator">refinance calculator</Link> before
            deciding — the break-even month is the only number that matters, and it depends on
            closing costs you should ask for in writing.
          </p>

          <h2>What loan size does to the payment</h2>
          <p>
            Payment scales linearly with the loan and interest does not, because a larger balance
            spends more months at a larger interest charge. At the same 6.5% rate across 30 years:
          </p>
          <table>
            <thead>
              <tr><th>Loan amount</th><th>Monthly principal &amp; interest</th><th>Interest over 30 years</th></tr>
            </thead>
            <tbody>
              <tr><td>$250,000</td><td>$1,580</td><td>$318,861</td></tr>
              <tr><td>$400,000</td><td>$2,528</td><td>$510,178</td></tr>
              <tr><td>$600,000</td><td>$3,792</td><td>$765,267</td></tr>
            </tbody>
          </table>
          <p>
            Doubling the loan from $250,000 to $500,000 does not double the interest — it more than
            doubles it, because the early months are almost entirely interest and there are twice as
            many dollars accruing it. This is the mechanism behind the affordability squeeze in
            expensive metros, and it is measurable rather than rhetorical: our
            <Link href="/guides/home-price-to-income-by-metro-2026">metro affordability study</Link>
            shows owner-occupied households in Los Angeles paying over six times their income for a
            median home.
          </p>

          <h2>Discount points, and when they pay for themselves</h2>
          <p>
            A point costs 1% of the loan at closing and typically buys about a quarter point off the
            rate. On a $400,000 loan at 6.5%, one point costs $4,000 and drops the payment by
            about $65 a month, from $2,528 to $2,463. Break-even is roughly
            61 months — just under 5.1 years.
          </p>
          <p>
            That single number decides the question. If you expect to sell or refinance before
            61 months, the point is a loss; after it, a gain. Lenders rarely volunteer it,
            and it is not a judgement call — it is division.
          </p>
          <p>
            The same arithmetic governs whether a buydown is worth taking from a seller: a temporary
            rate buydown lowers the payment for one to three years and leaves you with the full
            payment afterwards, so it only helps if your income will have risen by then.
          </p>

          <h2>What to ask before you sign</h2>
          <p>
            Four questions, in the order that matters: what is the rate on the Loan Estimate, what is
            the APR including fees, does the payment include escrow for tax and insurance, and when
            does mortgage insurance fall off. A quote that answers three of those is a quote for a
            different loan than the one you are comparing it to.
          </p>

          <h2>The one number to remember</h2>
          <p>
            Every paragraph above reduces to a single ratio: the payment per thousand borrowed. At
            6.5% over 30 years it is about $6.32 per $1,000, so a $400,000 loan costs roughly $2,528
            before tax and insurance. Learn that multiplier and you can price any house in your head
            before opening a calculator — and you can spot a quote that is off by a full point
            immediately, because a full point is about $0.68 per thousand, or $272 a month on this
            loan.
          </p>
          <p>
            Use the <Link href="/home-affordability-calculator">home affordability calculator</Link>
            to turn a payment you can carry into a price you can offer, and the
            <Link href="/pmi-calculator">PMI calculator</Link> to see what the gap below a 20% down
            payment actually costs each month.
          </p>
</div>

        {tool && <ToolClient tool={tool} showFaq={false} excludeRelated={["mortgage-points-calculator", "escrow-calculator", "refinance-calculator"]} />}

        <GuideFaq slug="mortgage-calculator-guide" />

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
