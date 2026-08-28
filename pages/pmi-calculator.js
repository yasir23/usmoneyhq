import { useState } from "react";
import Head from "next/head";
import AdSlot from "../components/AdSlot";
import { pmiCalculator, money } from "../lib/calc";

export default function PMICalculator() {
  const [price, setPrice] = useState(400000);
  const [down, setDown] = useState(10);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const r = pmiCalculator(price, down, rate, years);

  return (
    <>
      <Head>
        <title>PMI Calculator 2026 — Private Mortgage Insurance Cost | US Calc Tools</title>
        <meta name="description" content="Free US PMI calculator: estimate your private mortgage insurance cost, when it cancels, and total PMI paid on a home loan." />
        <meta property="og:title" content="PMI Calculator — Private Mortgage Insurance" />
      </Head>

      <main className="container">
        <h1>PMI Calculator</h1>
        <p className="sub">Estimate private mortgage insurance — what you pay with a down payment under 20%.</p>

        <AdSlot id="pmi-top" />

        <div className="grid">
          <div className="card">
            <label>Home price (USD)</label>
            <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
            <label>Down payment (%)</label>
            <input type="number" value={down} onChange={(e) => setDown(+e.target.value)} />
            <label>Interest rate (annual %)</label>
            <input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} />
            <label>Loan term (years)</label>
            <select value={years} onChange={(e) => setYears(+e.target.value)}>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>

          <div className="card results">
            <h2>Your PMI Picture</h2>
            <div className="row"><span>Loan amount</span><b>{money(r.loanAmount)}</b></div>
            <div className="row highlight"><span>Monthly PMI</span><b>{r.hasPMI ? money(r.pmiMonthly) : "$0 — no PMI"}</b></div>
            <div className="row"><span>Base payment (P&I)</span><b>{money(r.basePayment)}</b></div>
            {r.hasPMI && (
              <>
                <div className="row"><span>PMI cancels at month</span><b>{r.monthsUntilCancel}</b></div>
                <div className="row"><span>Total PMI paid</span><b>{money(r.totalPMI)}</b></div>
              </>
            )}
            <p className="note">Uses a 0.5% annual PMI rate (typical range 0.3-1.0%).</p>
          </div>
        </div>

        <AdSlot id="pmi-mid" />

        <div className="seo">
          <h2>How to use this PMI calculator</h2>
          <p>PMI applies when your down payment is under 20%. This calculator estimates the monthly PMI cost and when it automatically cancels (at 78% loan-to-value on a conventional loan).</p>
          <h3>Is PMI worth avoiding?</h3>
          <p>With 20% down you skip PMI entirely, but you also delay buying. Compare the PMI cost against rent and expected home appreciation — sometimes paying PMI for a few years is the better financial move.</p>
          <h3>Can I remove PMI early?</h3>
          <p>Yes — on a conventional loan, request cancellation once you reach 80% LTV based on current home value (appraisal may be required).</p>
        </div>
      </main>
    </>
  );
}
