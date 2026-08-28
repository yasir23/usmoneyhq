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

          <h2>Accuracy &amp; Limitations</h2>
          <p>Calculators are estimation tools for planning, not quotes or financial advice. Real loans, taxes, and premiums depend on lender-specific terms, county-level rates, and your personal situation. Always confirm with a licensed professional before making financial decisions. See our <a href="/terms">Terms of Use</a> for the full disclaimer.</p>

          <h2>Corrections</h2>
          <p>Spotted an error or a rate that needs updating? <a href="/contact">Tell us</a> — we fix formula and data issues within 48 hours.</p>
        </div>
      </main>
    </>
  );
}
