import { useState } from "react";
import Head from "next/head";
import AdSlot from "../components/AdSlot";
import { federalTax, fica, stateTax, NO_INCOME_TAX_STATES, money } from "../lib/calc";

export default function SalaryCalculator() {
  const [salary, setSalary] = useState(75000);
  const [state, setState] = useState("TX");
  const [filing, setFiling] = useState("single");

  const fed = federalTax(salary, filing);
  const f = fica(salary, filing);
  const st = stateTax(salary, state, filing);
  const totalTax = fed.tax + f.total + st.tax;
  const takeHome = salary - totalTax;

  return (
    <>
      <Head>
        <title>Salary After Tax Calculator 2026 — Take-Home Pay by State | US Calc Tools</title>
        <meta name="description" content="Free US salary calculator: estimate federal, FICA, and state taxes and your monthly take-home pay. 2026 tax year, all 50 states." />
        <meta property="og:title" content="Salary After Tax Calculator — Take-Home Pay by State" />
      </Head>

      <main className="container">
        <h1>Salary After Tax Calculator</h1>
        <p className="sub">Estimate your federal, FICA, and state taxes and monthly take-home pay.</p>

        <AdSlot id="salary-top" />

        <div className="grid">
          <div className="card">
            <label>Annual salary (USD)</label>
            <input type="number" value={salary} onChange={(e) => setSalary(+e.target.value)} />
            <label>State</label>
            <select value={state} onChange={(e) => setState(e.target.value)}>
              {[
                "TX","FL","NV","WA","WY","SD","TN","NH","AK","CA","NY","NJ","MA","IL","PA","OH","GA","NC","MI","WA","OR","CO","AZ","VA","MD","MN","WI","MO","IN","TN",
              ].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label>Filing status</label>
            <select value={filing} onChange={(e) => setFiling(e.target.value)}>
              <option value="single">Single</option>
              <option value="married">Married filing jointly</option>
            </select>
          </div>

          <div className="card results">
            <h2>Your Take-Home Pay</h2>
            <div className="row highlight"><span>Take-home (annual)</span><b>{money(takeHome)}</b></div>
            <div className="row"><span>Per month</span><b>{money(takeHome / 12)}</b></div>
            <div className="row"><span>Per bi-weekly paycheck</span><b>{money(takeHome / 26)}</b></div>
            <div className="row"><span>Federal income tax</span><b>{money(fed.tax)}</b></div>
            <div className="row"><span>Social Security + Medicare</span><b>{money(f.total)}</b></div>
            <div className="row"><span>State tax ({state})</span><b>{money(st.tax)}</b></div>
            <p className="note">{st.note}. Estimate only — does not include 401(k), insurance, or credits.</p>
          </div>
        </div>

        <AdSlot id="salary-mid" />

        <div className="seo">
          <h2>How to use this salary calculator</h2>
          <p>Enter your annual gross salary, state, and filing status to estimate your take-home pay after federal income tax, Social Security, Medicare, and state income tax. Based on 2025 tax brackets and standard deductions.</p>
          <h3>Which states have no income tax?</h3>
          <p>Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming do not impose a state income tax.</p>
          <h3>Why does my actual paycheck differ?</h3>
          <p>Employers also deduct 401(k) contributions, health insurance premiums, and other benefits. This calculator shows a clean estimate before those deductions.</p>
        </div>
      </main>
    </>
  );
}
