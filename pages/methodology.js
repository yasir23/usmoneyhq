import Head from "next/head";
import { SITE_URL } from "../lib/tools";

/** /methodology — E-E-A-T layer: how every calculator works, data sources, update policy. */
export default function Methodology() {
  return (
    <>
      <Head>
        <title>Calculator Methodology & Data Sources | US Money HQ</title>
        <meta name="description" content="How US Money HQ calculators work: the exact formulas, tax data, and update policy behind every tool. Transparent math, standard methods, no black boxes." />
        <link rel="canonical" href={`${SITE_URL}/methodology`} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Methodology</span></nav>
        <h1>Calculator Methodology &amp; Data Sources</h1>
        <p className="sub">Every number on this site comes from a documented formula. This page is the full transparency record.</p>

        <div className="seo">
          <h2>Financial Calculators</h2>
          <p><strong>Loan payments (mortgage, auto, HELOC amortized):</strong> standard amortization formula M = P[r(1+r)^n] / [(1+r)^n − 1], where P is principal, r is monthly rate (annual rate / 12), and n is the number of monthly payments. Interest accrues monthly on the remaining balance.</p>
          <p><strong>Federal income tax:</strong> the current-year US federal marginal tax brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%) applied progressively to taxable income after the standard deduction, for both single and married-filing-jointly statuses.</p>
          <p><strong>FICA:</strong> Social Security at 6.2% up to the annual wage base and Medicare at 1.45% (no cap), matching 2025–2026 withholding rates.</p>
          <p><strong>State income tax:</strong> state-specific estimates using each state's tax type and typical rates — flat-tax states use their published flat rate; no-income-tax states (TX, FL, NV, etc.) return $0; progressive states use a representative effective rate. State figures are labeled ESTIMATES.</p>
          <p><strong>Property &amp; sales tax (state pages):</strong> average effective property tax rate and average combined state+local sales tax rate per state, sourced from public state data. Labeled as averages — actual rates vary by county/city.</p>
          <p><strong>PMI:</strong> standard annual premium of 0.5–1.0% of the loan amount when the down payment is under 20%, cancelling automatically at 78% LTV or on request at 80% LTV.</p>
          <p><strong>Retirement projection:</strong> compound growth of contributions at your assumed annual return, then the 4% rule for sustainable annual withdrawal.</p>

          <h2>Health &amp; Home Improvement Calculators</h2>
          <p><strong>TDEE:</strong> Mifflin-St Jeor equation for BMR (men: 10×kg + 6.25×cm − 5×age + 5; women: 10×kg + 6.25×cm − 5×age − 161), multiplied by an activity factor (1.2–1.9).</p>
          <p><strong>Body fat:</strong> US Navy circumference method using neck, waist, and hip measurements.</p>
          <p><strong>Sleep:</strong> 90-minute sleep cycles counted backward from your wake time (5–6 cycles recommended).</p>
          <p><strong>Water intake:</strong> base 30 ml per kg of body weight plus 350–500 ml per 30 minutes of exercise.</p>
          <p><strong>Concrete, paint, mulch:</strong> standard volume formulas (L×W×D for slabs; gallons per square foot for paint at 2 coats; cubic yards for mulch at target depth) plus average material costs.</p>

          <h2>Data Sources &amp; Update Policy</h2>
          <p>Tax brackets and FICA rates are updated when the IRS publishes new figures (typically January each year). State tax data is reviewed quarterly. Loan and savings calculators use no market data — you supply the rate, so results never go stale. When a source changes, we update the affected calculators in the same week and note it on the relevant page.</p>

          <h3>Primary sources</h3>
          <p>Every regulated figure on this site is taken from the agency that publishes it. These are the sources behind the calculators, with the body responsible for each.</p>
          <ul>
            <li><strong>Federal income tax brackets, standard deduction, and FICA rates</strong> — IRS <a href="https://www.irs.gov/publications/p15" rel="noopener nofollow" target="_blank">Publication 15 (Circular E), Employer&apos;s Tax Guide</a>.</li>
            <li><strong>Annual tax inflation adjustments</strong> — the IRS Revenue Procedure published each autumn for the following tax year, listed at the <a href="https://www.irs.gov/newsroom" rel="noopener nofollow" target="_blank">IRS Newsroom</a>.</li>
            <li><strong>Standard mileage rates</strong> — <a href="https://www.irs.gov/tax-professionals/standard-mileage-rates" rel="noopener nofollow" target="_blank">IRS standard mileage rates</a>, updated each January.</li>
            <li><strong>401(k) contribution limits</strong> — <a href="https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits" rel="noopener nofollow" target="_blank">IRS retirement plan contribution limits</a>.</li>
            <li><strong>Required minimum distributions</strong> — <a href="https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-required-minimum-distributions-rmds" rel="noopener nofollow" target="_blank">IRS RMD rules and Uniform Lifetime Table</a>.</li>
            <li><strong>Social Security wage base and COLA</strong> — the Social Security Administration&apos;s <a href="https://www.ssa.gov/oact/cola/cbb.html" rel="noopener nofollow" target="_blank">contribution and benefit base</a> and <a href="https://www.ssa.gov/oact/cola/colaseries.html" rel="noopener nofollow" target="_blank">COLA series</a>.</li>
            <li><strong>Inflation and average earnings</strong> — the Bureau of Labor Statistics <a href="https://www.bls.gov/cpi/" rel="noopener nofollow" target="_blank">Consumer Price Index</a> and <a href="https://www.bls.gov/oes/" rel="noopener nofollow" target="_blank">Occupational Employment and Wage Statistics</a>.</li>
            <li><strong>Mortgage and consumer credit guidance</strong> — the Consumer Financial Protection Bureau&apos;s <a href="https://www.consumerfinance.gov/owning-a-home/" rel="noopener nofollow" target="_blank">Owning a Home</a> resources.</li>
            <li><strong>Conforming loan limits</strong> — the Federal Housing Finance Agency&apos;s <a href="https://www.fhfa.gov/data/conforming-loan-limit" rel="noopener nofollow" target="_blank">loan limit data</a>; FHA limits and programs at <a href="https://www.hud.gov/" rel="noopener nofollow" target="_blank">HUD</a>.</li>
            <li><strong>Medicare premiums and deductibles</strong> — <a href="https://www.medicare.gov/basics/costs/medicare-costs" rel="noopener nofollow" target="_blank">Medicare.gov cost schedules</a> (CMS).</li>
            <li><strong>State income, property, and sales tax</strong> — each state&apos;s own revenue department, reachable via the Federation of Tax Administrators <a href="https://www.taxadmin.org/state-tax-agencies" rel="noopener nofollow" target="_blank">directory of state tax agencies</a>.</li>
            <li><strong>Population and household data</strong> — the US Census Bureau <a href="https://www.census.gov/programs-surveys/acs" rel="noopener nofollow" target="_blank">American Community Survey</a>.</li>
          </ul>

          <h3>How to read the numbers</h3>
          <p>Tax and benefit figures reflect the most recent tax year published by the IRS and SSA at the time of the last review below. Where a figure is an average rather than a statutory rate (state property tax, combined sales tax, typical material costs), the page says so and the result is labeled an estimate. Health and fitness formulas are published clinical equations, not agency data, and are named individually above.</p>

          <p className="muted"><strong>Last reviewed:</strong> 26 September 2026. Next scheduled review: January 2027, when the IRS publishes inflation adjustments for the new tax year.</p>

          <h2>Accuracy &amp; Limitations</h2>
          <p>Calculators are estimation tools for planning, not quotes or financial advice. Real loans, taxes, and premiums depend on lender-specific terms, county-level rates, and your personal situation. Always confirm with a licensed professional before making financial decisions. See our <a href="/terms">Terms of Use</a> for the full disclaimer.</p>

          <h2>Corrections</h2>
          <p>Spotted an error or a rate that needs updating? <a href="/contact">Tell us</a> — we fix formula and data issues within 48 hours.</p>
        </div>
      </main>
    </>
  );
}
