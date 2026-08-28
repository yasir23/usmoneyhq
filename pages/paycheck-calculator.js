import { useState } from "react";
import Head from "next/head";
import AdSlot from "../components/AdSlot";
import { paycheckBreakdown, money } from "../lib/calc";

const STATES = ["TX","FL","NV","WA","WY","SD","TN","NH","AK","CA","NY","NJ","MA","IL","PA","OH","GA","NC","MI","OR","CO","AZ","VA","MD","MN","WI","MO","IN"];

export default function PaycheckCalculator() {
  const [salary, setSalary] = useState(75000);
  const [state, setState] = useState("TX");
  const [filing, setFiling] = useState("single");
  const [periods, setPeriods] = useState(26);

  const r = paycheckBreakdown(salary, state, filing, periods);

  return (
    <>
      <Head>
        <title>Paycheck Calculator 2026 — Take-Home Pay per Paycheck | US Calc Tools</title>
        <meta name="description" content="Free US paycheck calculator: estimate your federal, FICA, and state deductions and net pay per paycheck. Weekly, biweekly, semimonthly, monthly." />
        <meta property="og:title" content="Paycheck Calculator — Take-Home Pay per Paycheck" />
      </Head>

      <main className="container">
        <h1>Paycheck Calculator</h1>
        <p className="sub">Estimate your take-home pay per paycheck after federal, FICA, and state taxes.</p>

        <AdSlot id="paycheck-top" />

        <div className="grid">
          <div className="card">
            <label>Annual salary (USD)</label>
            <input type="number" value={salary} onChange={(e) => setSalary(+e.target.value)} />
            <label>State</label>
            <select value={state} onChange={(e) => setState(e.target.value)}>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label>Filing status</label>
            <select value={filing} onChange={(e) => setFiling(e.target.value)}>
              <option value="single">Single</option>
              <option value="married">Married filing jointly</option>
            </select>
            <label>Pay frequency</label>
            <select value={periods} onChange={(e) => setPeriods(+e.target.value)}>
              <option value={52}>Weekly (52/year)</option>
              <option value={26}>Biweekly (26/year)</option>
              <option value={24}>Semimonthly (24/year)</option>
              <option value={12}>Monthly (12/year)</option>
            </select>
          </div>

          <div className="card results">
            <h2>Your Paycheck</h2>
            <div className="row highlight"><span>Net pay</span><b>{money(r.net)}</b></div>
            <div className="row"><span>Gross pay</span><b>{money(r.gross)}</b></div>
            <div className="row"><span>Federal income tax</span><b>{money(r.federal)}</b></div>
            <div className="row"><span>Social Security + Medicare</span><b>{money(r.fica)}</b></div>
            <div className="row"><span>State tax ({state})</span><b>{money(r.state)}</b></div>
            <p className="note">Estimate only. 401(k), insurance, and credits not included.</p>
          </div>
        </div>

        <AdSlot id="paycheck-mid" />

        <div className="seo">
          <h2>How to use this paycheck calculator</h2>
          <p>Enter your annual salary, state, filing status, and pay frequency to see estimated deductions and net pay per paycheck. Uses 2025 federal brackets, FICA, and a state tax estimate.</p>
          <h3>Why is my paycheck different from this estimate?</h3>
          <p>Employers deduct pre-tax benefits like 401(k), health insurance, and HSA/FSA contributions. Your W-4 withholding choices also affect each check.</p>
        </div>
      </main>
    </>
  );
}
