import { useState } from "react";
import Head from "next/head";
import AdSlot from "../components/AdSlot";
import { monthlyPayment, amortizationSchedule, money } from "../lib/calc";

export default function MortgageCalculator() {
  const [amount, setAmount] = useState(400000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [down, setDown] = useState(20);

  const principal = Math.max(0, amount - (amount * down) / 100);
  const termMonths = years * 12;
  const payment = monthlyPayment(principal, rate, termMonths);
  const schedule = amortizationSchedule(principal, rate, termMonths);
  const totalInterest = schedule.reduce((a, r) => a + r.interest, 0);
  const totalPaid = principal + totalInterest;

  return (
    <>
      <Head>
        <title>Mortgage Calculator 2026 — Monthly Payment & Amortization | US Calc Tools</title>
        <meta name="description" content="Free US mortgage calculator: estimate your monthly payment, total interest, and full amortization schedule. Updated for 2026 rates." />
        <meta property="og:title" content="Mortgage Calculator — Monthly Payment & Amortization" />
      </Head>

      <main className="container">
        <h1>Mortgage Calculator</h1>
        <p className="sub">Estimate your monthly payment, total interest, and amortization schedule for a US home loan.</p>

        <AdSlot id="mortgage-top" />

        <div className="grid">
          <div className="card">
            <label>Home price (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} />
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
            <h2>Your Results</h2>
            <div className="row"><span>Loan amount</span><b>{money(principal)}</b></div>
            <div className="row highlight"><span>Monthly payment</span><b>{money(payment)}</b></div>
            <div className="row"><span>Total interest</span><b>{money(totalInterest)}</b></div>
            <div className="row"><span>Total paid</span><b>{money(totalPaid)}</b></div>
            <p className="note">Estimate only. Does not include taxes, insurance, or PMI.</p>
          </div>
        </div>

        <AdSlot id="mortgage-mid" />

        <h2>Amortization Schedule (first 24 months)</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Month</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead>
            <tbody>
              {schedule.slice(0, 24).map((r) => (
                <tr key={r.month}>
                  <td>{r.month}</td><td>{money(r.payment)}</td><td>{money(r.interest)}</td><td>{money(r.principal)}</td><td>{money(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="seo">
          <h2>How to use this mortgage calculator</h2>
          <p>Enter the home price, down payment percentage, interest rate, and loan term to see your estimated monthly principal and interest payment. The full amortization schedule shows how much of each payment goes to interest versus principal over time.</p>
          <h3>What is a good mortgage rate in 2026?</h3>
          <p>Rates vary with the economy and your credit profile. Compare offers from at least three lenders and consider whether a 15-year or 30-year term fits your budget.</p>
          <h3>Does this include property tax and insurance?</h3>
          <p>No. Your full monthly payment (PITI) also includes property taxes, homeowners insurance, and possibly PMI if your down payment is under 20%.</p>
        </div>
      </main>
    </>
  );
}
