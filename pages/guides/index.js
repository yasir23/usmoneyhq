import Head from "next/head";
import Link from "next/link";
import { SITE_URL } from "../../lib/tools";

/** /guides — guides hub: cornerstone content pages with embedded calculators. */
export default function GuidesHub() {
  const guides = [
    { href: "/guides/how-much-house-can-i-afford", title: "How Much House Can I Afford in 2026?", desc: "The 28/36 rule, down payments, and real salary-to-price examples." },
    { href: "/guides/mortgage-calculator-guide", title: "How Mortgage Payments Work", desc: "PITI, 15 vs 30 years, and rates — the four parts of your payment." },
    { href: "/guides/salary-after-tax-guide", title: "How Much of Your Salary You Actually Keep", desc: "Federal brackets, FICA, and why your state matters most." },
    { href: "/guides/debt-payoff-guide", title: "The Fastest Way to Pay Off Debt", desc: "Snowball vs avalanche, and the power of extra payments." },
    { href: "/guides/debt-snowball-guide", title: "Multiple Debts? Run the Snowball", desc: "The debt-free date and the method that keeps you going." },
    { href: "/guides/401k-guide", title: "The 401k Guide", desc: "Match, limits, Roth vs traditional — the free money rule." },
    { href: "/guides/investing-basics-guide", title: "Investing Basics", desc: "Compound growth, index funds, and time in the market." },
    { href: "/guides/home-improvement-guide", title: "Home Improvement Budgeting", desc: "Remodel costs by room, the 10% materials rule, DIY vs pro." },
    { href: "/guides/health-fitness-guide", title: "Health & Fitness Numbers", desc: "TDEE, BMI, hydration, sleep — the boring wins first." },
  ];
  return (
    <>
      <Head>
        <title>Guides — US Money HQ</title>
        <meta name="description" content="Plain-English money guides with free calculators: house affordability, mortgages, take-home pay, and debt payoff." />
        <link rel="canonical" href={`${SITE_URL}/guides`} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Guides</span></nav>
        <h1>Money Guides, No Jargon</h1>
        <p className="sub">Four cornerstone guides with the calculators built in.</p>
        <div className="tool-grid">
          {guides.map((g) => (
            <Link key={g.href} href={g.href} className="tool-card">
              <h2>{g.title}</h2>
              <p>{g.desc}</p>
              <span className="cta">Read the guide →</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
