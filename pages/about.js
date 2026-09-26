import Head from "next/head";

export default function About() {
  return (
    <>
      <Head>
        <title>About Us | US Money HQ</title>
        <meta name="description" content="About US Money HQ — free, fast, accurate US financial and everyday calculators with no sign-up and no data collection." />
        <link rel="canonical" href="https://usmoneyhq.com/about" />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>About</span></nav>
        <h1>About US Money HQ</h1>

        <div className="seo">
          <h2>What We Do</h2>
          <p>US Money HQ provides free, fast, accurate online calculators and money tools for mortgages, auto loans, salaries, taxes, debt payoff, health, home improvement, and more. Every tool runs instantly in your browser — no sign-up, no account, no personal data stored.</p>

          <h2>Why We Built This</h2>
          <p>Financial decisions deserve clear numbers. Most calculators hide behind sign-ups, clutter, or outdated formulas. We built a clean, fast alternative covering the questions Americans actually search for — from "how much house can I afford" to "how much water should I drink."</p>

          <h2>Our Standards</h2>
          <p>Formulas use standard, publicly documented methods: standard amortization for loans, current federal tax brackets, Mifflin-St Jeor for TDEE, the US Navy body fat formula, and Naegele&apos;s rule for due dates. Every calculator is labeled with what it includes and what it doesn&apos;t. See the full <a href="/methodology">methodology and data sources</a> page.</p>

          <h2>Editorial Standards</h2>
          <p>Regulated figures — tax brackets, FICA rates, contribution limits, the Social Security wage base, Medicare costs, loan limits — are taken from the agency that publishes them, listed by name on our <a href="/methodology">methodology page</a>. We do not estimate a regulated number, and we do not present an average as a statutory rate: where a figure is an average (state property tax, combined sales tax, typical material costs), the page says so and the result is labeled an estimate.</p>
          <p>Calculators are reviewed against their sources when those sources change — annually each January for IRS inflation adjustments, and quarterly for state tax data. Every tool is also checked automatically each day for results that contradict the page they appear on, and for pages that have drifted below the depth we hold ourselves to.</p>

          <h2>Corrections</h2>
          <p>When we find a material error we fix it and record it here rather than quietly editing the page.</p>
          <ul>
            <li><strong>September 2026</strong> — State salary calculators were using a single flat national estimate for state income tax. Replaced with each state&apos;s own published rate schedule, so a state page now computes with that state&apos;s actual rules rather than a national average.</li>
            <li><strong>September 2026</strong> — Automatically generated city and metro permutations of calculator pages were removed from the search index. They differed from their parent page by a few words and added no information.</li>
            <li><strong>September 2026</strong> — Removed a site-wide indexing directive that conflicted with the per-page rules, which had caused some pages to carry contradictory instructions to search engines.</li>
          </ul>

          <p className="muted"><strong>Last reviewed:</strong> 26 September 2026.</p>

          <h2>Monetization</h2>
          <p>The site is free and supported by advertising. Advertisers do not influence calculator results or page content, and no calculator output is changed for commercial reasons. We do not sell data, and we do not require accounts.</p>

          <h2>Contact</h2>
          <p>Questions or corrections? See the <a href="/contact">contact page</a>. We aim to fix formula and data errors within 48 hours of being told about them.</p>
        </div>
      </main>
    </>
  );
}
