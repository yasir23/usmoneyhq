import { useState } from "react";
import Head from "next/head";
import AdSlot from "../components/AdSlot";
import { monthlyPayment, money } from "../lib/calc";

export default function AutoLoanCalculator() {
  const [price, setPrice] = useState(35000);
  const [down, setDown] = useState(5000);
  const [rate, setRate] = useState(7.2);
  const [term, setTerm] = useState(60);
  const [tradeIn, setTradeIn] = useState(0);

  const principal = Math.max(0, price - down - tradeIn);
  const payment = monthlyPayment(principal, rate, term);
  const totalPaid = payment * term;
  const totalInterest = totalPaid - principal;

  return (
    <>
      <Head>
        <title>Auto Loan Calculator 2026 — Car Payment Estimator | US Calc Tools</title>
        <meta name="description" content="Free US auto loan calculator: estimate your monthly car payment, total interest, and total cost. Updated for 2026." />
        <meta property="og:title" content="Auto Loan Calculator — Car Payment Estimator" />
      </Head>

      <main className="container">
        <h1>Auto Loan Calculator</h1>
        <p className="sub">Estimate your monthly car payment and total loan cost for a US auto purchase.</p>

        <AdSlot id="auto-top" />

        <div className="grid">
          <div className="card">
            <label>Vehicle price (USD)</label>
            <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
            <label>Down payment (USD)</label>
            <input type="number" value={down} onChange={(e) => setDown(+e.target.value)} />
            <label>Trade-in value (USD)</label>
            <input type="number" value={tradeIn} onChange={(e) => setTradeIn(+e.target.value)} />
            <label>Interest rate (annual %)</label>
            <input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} />
            <label>Loan term (months)</label>
            <select value={term} onChange={(e) => setTerm(+e.target.value)}>
              <option value={36}>36</option>
              <option value={48}>48</option>
              <option value={60}>60</option>
              <option value={72}>72</option>
              <option value={84}>84</option>
            </select>
          </div>

          <div className="card results">
            <h2>Your Results</h2>
            <div className="row"><span>Loan amount</span><b>{money(principal)}</b></div>
            <div className="row highlight"><span>Monthly payment</span><b>{money(payment)}</b></div>
            <div className="row"><span>Total interest</span><b>{money(totalInterest)}</b></div>
            <div className="row"><span>Total cost</span><b>{money(totalPaid + down + tradeIn)}</b></div>
            <p className="note">Estimate only. Fees, taxes, and dealer add-ons not included.</p>
          </div>
        </div>

        <AdSlot id="auto-mid" />

        <div className="seo">
          <h2>How to use this auto loan calculator</h2>
          <p>Enter the vehicle price, your down payment, trade-in value, interest rate, and loan term to see your estimated monthly payment and total interest. Longer terms lower the payment but cost more in interest.</p>
          <h3>Should I choose a 60-month or 72-month car loan?</h3>
          <p>Shorter terms (48-60 months) typically have lower rates and cost less overall. 72-84 month terms lower the monthly payment but increase total interest and the risk of being upside-down on the loan.</p>
          <h3>What is a good auto loan rate in 2026?</h3>
          <p>Rates depend on your credit score, the lender, and whether the loan is new or used. Pre-qualify with multiple lenders before visiting the dealership.</p>
        </div>
      </main>
    </>
  );
}
