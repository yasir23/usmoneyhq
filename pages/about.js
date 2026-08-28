import Head from "next/head";

export default function About() {
  return (
    <>
      <Head>
        <title>About Us | US Calc Tools</title>
        <meta name="description" content="About US Calc Tools — free, fast, accurate US financial and everyday calculators with no sign-up and no data collection." />
        <link rel="canonical" href="https://uscalctools.com/about" />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>About</span></nav>
        <h1>About US Calc Tools</h1>

        <div className="seo">
          <h2>What We Do</h2>
          <p>US Calc Tools provides free, fast, accurate online calculators for mortgages, auto loans, salaries, taxes, debt payoff, health, home improvement, and more. Every tool runs instantly in your browser — no sign-up, no account, no personal data stored.</p>

          <h2>Why We Built This</h2>
          <p>Financial decisions deserve clear numbers. Most calculators hide behind sign-ups, clutter, or outdated formulas. We built a clean, fast alternative covering the questions Americans actually search for — from "how much house can I afford" to "how much water should I drink."</p>

          <h2>Our Standards</h2>
          <p>Formulas use standard, publicly documented methods: standard amortization for loans, 2025 federal tax brackets, Mifflin-St Jeor for TDEE, the US Navy body fat formula, and Naegele's rule for due dates. Every calculator is labeled with what it includes and what it doesn't.</p>

          <h2>Monetization</h2>
          <p>The site is free and supported by advertising. We do not sell data, and we do not require accounts.</p>

          <h2>Contact</h2>
          <p>Questions or corrections? See the <a href="/contact">contact page</a>.</p>
        </div>
      </main>
    </>
  );
}
