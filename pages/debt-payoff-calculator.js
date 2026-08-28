import { useState } from "react";
import Head from "next/head";
import AdSlot from "../components/AdSlot";
import { debtPayoff, money } from "../lib/calc";

export default function DebtPayoffCalculator() {
  const [balance, setBalance] = useState(10000);
  const [apr, setApr] = useState(18);
  const [payment, setPayment] = useState(400);
  const [extra, setExtra] = useState(0);

  const r = debtPayoff(balance, apr, payment, extra);
  const base = debtPayoff(balance, apr, payment, 0);

  return (
    <>
      <Head>
        <title>Debt Payoff Calculator 2026 — How Long to Pay Off Debt | US Calc Tools</title>
        <meta name="description" content="Free US debt payoff calculator: see how long it takes to pay off credit card debt, total interest, and how extra payments speed things up." />
        <meta property="og:title" content="Debt Payoff Calculator — Time & Interest" />
      </Head>

      <main className="container">
        <h1>Debt Payoff Calculator</h1>
        <p className="sub">See how long it takes to clear your debt and how much extra payments save you.</p>

        <AdSlot id="debt-top" />

        <div className="grid">
          <div className="card">
            <label>Current balance (USD)</label>
            <input type="number" value={balance} onChange={(e) => setBalance(+e.target.value)} />
            <label>APR (%)</label>
            <input type="number" step="0.01" value={apr} onChange={(e) => setApr(+e.target.value)} />
            <label>Monthly payment (USD)</label>
            <input type="number" value={payment} onChange={(e) => setPayment(+e.target.value)} />
            <label>Extra payment per month (USD)</label>
            <input type="number" value={extra} onChange={(e) => setExtra(+e.target.value)} />
          </div>

          <div className="card results">
            <h2>Your Payoff Plan</h2>
            <div className="row highlight"><span>Time to payoff</span><b>{r.months} months ({Math.floor(r.months / 12)}y {r.months % 12}m)</b></div>
            <div className="row"><span>Total interest</span><b>{money(r.totalInterest)}</b></div>
            <div className="row"><span>Total paid</span><b>{money(r.totalPaid)}</b></div>
            <div className="row"><span>Interest saved with extra</span><b>{money(base.totalInterest - r.totalInterest)}</b></div>
            <div className="row"><span>Months saved</span><b>{base.months - r.months}</b></div>
            <p className="note">Assumes consistent payments and a fixed APR.</p>
          </div>
        </div>

        <AdSlot id="debt-mid" />

        <h2>Payoff Schedule (first 12 months)</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Month</th><th>Payment</th><th>Interest</th><th>Balance</th></tr></thead>
            <tbody>
              {r.schedule.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td><td>{money(row.payment)}</td><td>{money(row.interest)}</td><td>{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="seo">
          <h2>How to use this debt payoff calculator</h2>
          <p>Enter your balance, APR, and monthly payment to see how long payoff takes. Add an extra payment to see the interest and months saved — even $50/month makes a large difference on high-APR debt.</p>
          <h3>Should I pay off debt or invest?</h3>
          <p>As a rule of thumb, pay off debt above ~7-8% APR before investing, since guaranteed debt interest savings usually beat expected market returns after taxes.</p>
        </div>
      </main>
    </>
  );
}
