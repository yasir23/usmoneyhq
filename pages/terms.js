import Head from "next/head";

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Use | US Calc Tools</title>
        <meta name="description" content="Terms of use for US Calc Tools free financial calculators." />
        <link rel="canonical" href="https://uscalctools.com/terms" />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Terms of Use</span></nav>
        <h1>Terms of Use</h1>
        <p className="sub">Last updated: August 2026</p>

        <div className="seo">
          <h2>Acceptance of Terms</h2>
          <p>By using uscalctools.com you agree to these terms. If you do not agree, please do not use the site.</p>

          <h2>Informational Purposes Only</h2>
          <p>All calculators and content are provided for general informational purposes only. They are estimates and are not financial, legal, tax, medical, or professional advice. You should consult a qualified professional before making decisions based on calculator results.</p>

          <h2>No Guarantee of Accuracy</h2>
          <p>We strive for accuracy but make no warranties, express or implied, about the completeness or accuracy of results. Formulas may not reflect your specific lender, employer, state, or circumstances.</p>

          <h2>No Liability</h2>
          <p>To the maximum extent permitted by law, we are not liable for any damages arising from use of this site or reliance on its content.</p>

          <h2>Advertising</h2>
          <p>This site displays third-party advertising via Google AdSense. We are not responsible for the content of advertisements or linked external sites.</p>

          <h2>Changes</h2>
          <p>We may update these terms at any time. Continued use after changes constitutes acceptance.</p>
        </div>
      </main>
    </>
  );
}
