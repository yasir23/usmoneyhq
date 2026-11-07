import Head from "next/head";
import Link from "next/link";
import ToolClient from "../../components/ToolClient";
import GuideFaq from "../../components/GuideFaq";
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
        
          <h2>What lenders actually compute</h2>
          <p>
            Affordability is not a feeling; it is two ratios. Front-end DTI is housing cost divided
            by gross monthly income — conventionally capped at 28%. Back-end DTI adds every other
            debt payment and is conventionally capped at 36%. The table applies both to four incomes,
            then converts the front-end payment into a loan at 6.5% over 30 years, reserving 22% of
            the payment for tax, insurance and mortgage insurance.
          </p>
          <table>
            <thead>
              <tr><th>Gross income</th><th>28% front-end payment</th><th>36% back-end ceiling</th><th>Implied loan</th></tr>
            </thead>
            <tbody>
              <tr><td>$60,000</td><td>$1,400</td><td>$1,800</td><td>$172,766</td></tr>
              <tr><td>$90,000</td><td>$2,100</td><td>$2,700</td><td>$259,149</td></tr>
              <tr><td>$120,000</td><td>$2,800</td><td>$3,600</td><td>$345,532</td></tr>
              <tr><td>$160,000</td><td>$3,733</td><td>$4,800</td><td>$460,710</td></tr>
            </tbody>
          </table>
          <p>
            Households routinely qualify above 28/36 — automated underwriting allows higher ratios
            with compensating factors — but the number that matters is not what you can borrow. It is
            what remains after the payment. Two households on $120,000 can carry very different
            payments depending on whether they have a car loan and a student loan inside that 36%.
          </p>

          <h2>Why the same loan costs different amounts in different counties</h2>
          <p>
            On a $400,000 purchase with 10% down, the loan is $360,000 and principal and interest at
            6.5% is $2,275 a month. Mortgage insurance at 0.6% of the balance adds about $180 on
            top, and property tax in a high-rate county can add more than the insurance does. Flush
            the down payment to 20% and the mortgage insurance disappears entirely — worth
            $2,160 a year, which is why the last few percent of a down payment are worth more than
            their face value.
          </p>
          <p>
            This is where the metro study earns its keep: our
            <Link href="/guides/home-price-to-income-by-metro-2026">49-metro affordability analysis</Link>
            compares median home value to owner-occupied household income from the same ACS release,
            so it is a like-for-like ratio rather than two different populations divided by each
            other. It shows Los Angeles at 6.82 times income and Detroit at 1.54 — the same rule,
            radically different outcomes.
          </p>

          <h2>What to do with the result</h2>
          <p>
            Take the 36% back-end ceiling, subtract your existing debt payments, and you have the
            housing payment a lender will likely approve. Subtract tax, insurance and mortgage
            insurance from that, and you have principal and interest. Feed that into the
            <Link href="/home-affordability-calculator">home affordability calculator</Link> to get a
            price, and check the
            <Link href="/mortgage-calculator">mortgage calculator</Link> for the payment at your
            actual quoted rate — the difference between 6.0% and 7.0% is about $270 a month on a
            $400,000 loan.
          </p>

          <h2>Down payment, and what the last 10% buys</h2>
          <p>
            On a $400,000 house, 10% down means a $360,000 loan and mortgage insurance; 20% down
            removes the insurance entirely. At 0.6% of the loan balance that is roughly $2,160 a
            year, or $180 a month, for a policy that protects the lender and not the borrower.
          </p>
          <table>
            <thead><tr><th>Down payment</th><th>Loan amount</th><th>Mortgage insurance</th><th>Monthly P&amp;I at 6.5%</th></tr></thead>
            <tbody>
              <tr><td>10% ($40,000)</td><td>$360,000</td><td>Yes, ~$180/mo</td><td>$2,275</td></tr>
              <tr><td>20% ($80,000)</td><td>$320,000</td><td>None</td><td>$2,023</td></tr>
            </tbody>
          </table>
          <p>
            The extra $40,000 up front removes about $2,160 a year in insurance and drops the
            payment by $433 a month. Viewed as a return on that $40,000 the insurance saving
            alone is a few percent, which is why the down payment decision is mostly about the
            payment you can carry rather than the return on capital.
          </p>

          <h2>The rent-versus-buy threshold</h2>
          <p>
            Buying beats renting when the unrecoverable costs of owning — interest in the early years,
            property tax, insurance, maintenance and transaction costs — are below the rent for
            comparable housing. On a $400,000 purchase at 6.5%, year-one interest alone is about
            $23,400; add tax and insurance and the carrying cost is well above most rents for the
            same property. That is not an argument against buying; it is an argument against buying
            for a short holding period, because the transaction costs need years of appreciation to
            overcome.
          </p>

          <h2>What the lender will ask for</h2>
          <p>
            Underwriting is a documentation exercise. Expect recent pay stubs covering a month, two
            years of tax returns if self-employed, two months of statements for every asset account
            used for the down payment, and explanations for any large deposit that is not payroll.
            Gift funds need a letter; borrowed down payments disqualify most programmes outright.
          </p>
          <p>
            The back-end ratio is computed from credit report data, not from what you say you owe.
            An instalment loan with three payments left still counts until it reports as closed.
            That single detail has killed more pre-approvals than any other, and it is why a credit
            pull two months before house-hunting is worth doing — it lets you pay down or pay off
            the small accounts that distort the ratio before anyone underwrites you.
          </p>
          <p>
            Finally, the number in the pre-approval letter is a ceiling, not a recommendation. It is
            the most a lender will risk, computed on gross income before tax, childcare or savings.
            The payment you can actually carry is a different calculation, and it is the one that
            decides whether year three is comfortable or a squeeze.
          </p>

          <h2>Property tax is the number nobody models</h2>
          <p>
            Two counties can differ by more than a full percentage point of assessed value. On a
            $400,000 house that is over $4,000 a year, or roughly $330 a month, before insurance.
            Because tax is escrowed with the payment, it raises what the lender counts toward your
            DTI without changing the loan at all — a house you can afford at a 1% rate can fail
            underwriting at 2.2%.
          </p>
          <p>
            Check the county assessor's rate and the assessment ratio rather than the advertised
            millage, and ask whether the current owner's assessment is capped: a homestead cap
            transfers away at sale, so the tax can jump in year two even though the price did not
            change.
          </p>
</div>

        {tool && <ToolClient tool={tool} showFaq={false} excludeRelated={["mortgage-calculator", "dti-calculator", "pmi-calculator"]} />}

        <GuideFaq slug="how-much-house-can-i-afford" />

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
