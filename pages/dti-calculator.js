import { useState } from "react";
import Head from "next/head";
import AdSlot from "../components/AdSlot";
import { dti, money } from "../lib/calc";

export default function DTICalculator() {
  const [income, setIncome] = useState(8000);
  const [housing, setHousing] = useState(1800);
  const [other, setOther] = useState(700);

  const r = dti(income, housing, other);

  return (
    <>
      <Head>
        <title>Debt-to-Income Ratio Calculator 2026 | US Calc Tools</title>
        <meta name="description" content="Free US debt-to-income (DTI) calculator: see your front-end and back-end ratios and whether you qualify for a mortgage. 28/36 rule explained." />
        <meta property="og:title" content="Debt-to-Income Ratio Calculator" />
      </Head>

      <main className="container">
        <h1>Debt-to-Income Ratio Calculator</h1>
        <p className="sub">Check your front-end and back-end DTI — the two numbers lenders use to approve mortgages.</p>

        <AdSlot id="dti-top" />

        <div className="grid">
          <div className="card">
            <label>Monthly gross income (USD)</label>
            <input type="number" value={income} onChange={(e) => setIncome(+e.target.value)} />
            <label>Monthly housing payment (USD)</label>
            <input type="number" value={housing} onChange={(e) => setHousing(+e.target.value)} />
            <label>Other monthly debt (USD)</label>
            <input type="number" value={other} onChange={(e) => setOther(+e.target.value)} />
          </div>

          <div className="card results">
            <h2>Your Ratios</h2>
            <div className="row highlight"><span>Back-end DTI</span><b>{r.backRatio}%</b></div>
            <div className="row"><span>Front-end DTI</span><b>{r.frontRatio}%</b></div>
            <div className="row">
              <span>Mortgage qualification</span>
              <b>{r.backRatio <= 43 ? "Likely ✓" : r.backRatio <= 50 ? "Borderline" : "Unlikely ✗"}</b>
            </div>
            <p className="note">Lenders prefer back-end DTI at or below 43% (28/36 guideline).</p>
          </div>
        </div>

        <AdSlot id="dti-mid" />

        <div className="seo">
          <h2>How to use this DTI calculator</h2>
          <p>Enter your monthly gross income, your housing payment (mortgage PITI or rent), and all other monthly debt (credit cards, auto loans, student loans). The calculator shows your front-end ratio (housing only) and back-end ratio (all debt).</p>
          <h3>What is a good DTI ratio?</h3>
          <p>Conventional loans generally want a back-end DTI under 43%; FHA loans allow up to 50% in some cases. Lower DTI also means better interest rates.</p>
          <h3>How can I lower my DTI?</h3>
          <p>Pay down credit card balances, extend loan terms to lower monthly payments, or increase income. Even a small balance payoff can push you under the threshold.</p>
        </div>
      </main>
    </>
  );
}
