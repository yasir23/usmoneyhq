import Head from "next/head";
import Link from "next/link";

const TOOLS = [
  { href: "/mortgage-calculator", title: "Mortgage Calculator", desc: "Monthly payment + full amortization schedule" },
  { href: "/auto-loan-calculator", title: "Auto Loan Calculator", desc: "Car payment, total interest, total cost" },
  { href: "/salary-after-tax-calculator", title: "Salary After Tax Calculator", desc: "Take-home pay by state (all 50 states)" },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>US Calc Tools — Free Financial Calculators (2026)</title>
        <meta name="description" content="Free, fast US financial calculators: mortgage, auto loan, salary after tax. No sign-up, works on any device." />
        <meta property="og:title" content="US Calc Tools — Free Financial Calculators" />
      </Head>

      <main className="container">
        <h1>Free US Financial Calculators</h1>
        <p className="sub">Fast, accurate, no sign-up. Updated for 2026.</p>

        <div className="tool-grid">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="tool-card">
              <h2>{t.title}</h2>
              <p>{t.desc}</p>
              <span className="cta">Open calculator →</span>
            </Link>
          ))}
        </div>

        <div className="seo">
          <h2>Why use our calculators?</h2>
          <p>Every calculator runs instantly in your browser — no page reloads, no sign-up, no data collected. Formulas use standard US amortization and 2025 federal tax brackets.</p>
          <h2>More tools coming soon</h2>
          <p>HELOC, refinance, retirement, and debt payoff calculators are in the pipeline.</p>
        </div>
      </main>
    </>
  );
}
