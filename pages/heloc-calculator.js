import { useState } from "react";
import Head from "next/head";
import AdSlot from "../components/AdSlot";
import { helocPayment, money } from "../lib/calc";

export default function HELOCCalculator() {
  const [homeValue, setHomeValue] = useState(500000);
  const [mortgage, setMortgage] = useState(250000);
  const [drawn, setDrawn] = useState(50000);
  const [rate, setRate] = useState(7.5);
  const [interestOnly, setInterestOnly] = useState(true);

  const equity = Math.max(0, homeValue - mortgage);
  const avail = equity * 0.85; // typical HELOC max = 85% CLTV
  const r = helocPayment(drawn, rate, 120, interestOnly);

  return (
    <>
      <Head>
        <title>HELOC Calculator 2026 — Home Equity Line of Credit Payments | US Calc Tools</title>
        <meta name="description" content="Free US HELOC calculator: estimate your monthly home equity line of credit payment, interest-only vs amortized, and available equity." />
        <meta property="og:title" content="HELOC Calculator — Home Equity Payments" />
      </Head>

      <main className="container">
        <h1>HELOC Calculator</h1>
        <p className="sub">Estimate your home equity line of credit payment and how much equity you can tap.</p>

        <AdSlot id="heloc-top" />

        <div className="grid">
          <div className="card">
            <label>Home value (USD)</label>
            <input type="number" value={homeValue} onChange={(e) => setHomeValue(+e.target.value)} />
            <label>Outstanding mortgage (USD)</label>
            <input type="number" value={mortgage} onChange={(e) => setMortgage(+e.target.value)} />
            <label>Amount drawn (USD)</label>
            <input type="number" value={drawn} onChange={(e) => setDrawn(+e.target.value)} />
            <label>HELOC rate (annual %)</label>
            <input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} />
            <label>Payment mode</label>
            <select value={interestOnly ? "io" : "am"} onChange={(e) => setInterestOnly(e.target.value === "io")}>
              <option value="io">Interest-only (draw period)</option>
              <option value="am">Amortized (10-year repayment)</option>
            </select>
          </div>

          <div className="card results">
            <h2>Your HELOC</h2>
            <div className="row"><span>Home equity</span><b>{money(equity)}</b></div>
            <div className="row"><span>Approx. available (85%)</span><b>{money(Math.max(0, avail))}</b></div>
            <div className="row highlight"><span>Monthly payment</span><b>{money(r.monthly)}</b></div>
            <div className="row"><span>Mode</span><b>{r.mode}</b></div>
            <p className="note">Estimate only. Rates are variable; actual limits depend on lender CLTV policy.</p>
          </div>
        </div>

        <AdSlot id="heloc-mid" />

        <div className="seo">
          <h2>How to use this HELOC calculator</h2>
          <p>Enter your home value, outstanding mortgage, and the amount you plan to draw. The calculator shows your equity and estimated monthly payment in interest-only (draw period) or amortized (repayment) mode.</p>
          <h3>Interest-only vs amortized HELOC payments</h3>
          <p>Most HELOCs let you pay interest only during the draw period (typically 10 years), then payments rise in the repayment phase. Amortizing from the start avoids a payment shock later.</p>
          <h3>How much can I borrow?</h3>
          <p>Lenders typically cap combined loan-to-value at 80-90%. This calculator uses 85% as a common default — your lender may differ.</p>
        </div>
      </main>
    </>
  );
}
