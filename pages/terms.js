import Head from "next/head";
import Link from "next/link";
import { contentDateLabel } from "../lib/content-dates";

/**
 * /terms
 *
 * The page previously answered six questions and stopped: acceptance,
 * informational use, accuracy, liability, advertising, changes. It did not say
 * who owns the content, what you may and may not do with it, what happens with
 * third-party links, or which law governs. For a site that also sells a
 * commercial widget licence, the intellectual-property section was the most
 * conspicuous omission of all.
 *
 * The "Last updated" line was hardcoded to "August 2026" while the sitemap
 * published CONTENT_DATES.legal. One date, two sources, disagreeing. Now derived.
 */
export default function Terms() {
  const updated = contentDateLabel("legal");

  return (
    <>
      <Head>
        <title>Terms of Use | US Money HQ</title>
        <meta name="description" content="Terms of use for US Money HQ free financial calculators — permitted use, intellectual property, third-party links, and limitations." />
        <link rel="canonical" href="https://usmoneyhq.com/terms" />
        <meta name="robots" content="index, follow" />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link> <span aria-hidden="true">›</span> <span>Terms of Use</span></nav>
        <h1>Terms of Use</h1>
        <p className="sub">Last updated: {updated}</p>

        <div className="seo">
          <h2>Acceptance of Terms</h2>
          <p>By using usmoneyhq.com you agree to these terms. If you do not agree, please do not use the site.</p>

          <h2>Informational Purposes Only</h2>
          <p>All calculators and content are provided for general informational purposes only. They are estimates and are not financial, legal, tax, medical, or professional advice. You should consult a qualified professional before making decisions based on calculator results.</p>
          <p>A calculator result depends entirely on the inputs you supply and on the assumption you choose. Where a result uses a rate you are assumed to have entered rather than a rate we publish, the result describes arithmetic — not a product you can buy. See <Link href="/methodology">Methodology &amp; Data Sources</Link> for how each figure is produced.</p>

          <h2>No Guarantee of Accuracy</h2>
          <p>We strive for accuracy and correct errors when they are reported. We make no warranties, express or implied, about the completeness or accuracy of results. Formulas may not reflect your specific lender, employer, state, or circumstances. Tax figures are based on published federal and state schedules and may lag a legislative change.</p>

          <h2>Intellectual Property and Permitted Use</h2>
          <p>The text, calculators, code, design, and compilation of this site are owned by US Money HQ and protected by copyright and other intellectual property laws.</p>
          <p><strong>You may:</strong> use the calculators for personal or internal business purposes; link to any page; quote a short excerpt with attribution and a link back to the page it came from; and share results with your own adviser.</p>
          <p><strong>You may not:</strong> republish or redistribute calculator content in bulk; copy the site or a substantial part of it; frame the site to pass it off as your own; resell access to the calculators; or use automated means to scrape the site in a way that imposes unreasonable load on our infrastructure.</p>
          <p>Embedding the calculators in your own website — including on a client site — requires the commercial licence included with our Webmaster Bundle. Nothing on this page grants that licence.</p>

          <h2>Third-Party Links and Content</h2>
          <p>This site contains links to external websites and displays advertisements. Those destinations are not under our control. We are not responsible for their content, accuracy, products, or privacy practices, and a link is not an endorsement. If you follow an external link, that site&rsquo;s own terms and policies apply.</p>

          <h2>Advertising</h2>
          <p>This site displays third-party advertising, including through Google AdSense. Advertisers do not influence our calculators or editorial content, and we are not responsible for the content of advertisements.</p>

          <h2>No Liability</h2>
          <p>To the maximum extent permitted by law, we are not liable for any direct, indirect, incidental, consequential, or special damages arising from your use of this site or your reliance on its content, including financial decisions made on the basis of a calculator result.</p>

          <h2>Indemnification</h2>
          <p>You agree to indemnify and hold US Money HQ harmless from any claim or demand — including reasonable legal fees — arising from your use of the site, your breach of these terms, or your violation of any third party&rsquo;s rights.</p>

          <h2>Changes, Termination, and Access</h2>
          <p>We may update these terms at any time. The &ldquo;Last updated&rdquo; date above changes when they do, and continued use after a change constitutes acceptance. We may add, change, or remove calculators at any time, and we may block access where use breaches these terms or threatens the availability of the site.</p>

          <h2>Governing Law</h2>
          <p>These terms are governed by the laws of the United States and of the state in which US Money HQ operates, without regard to conflict-of-law rules. Any dispute will be brought in the courts of that jurisdiction.</p>

          <h2>Severability and Entire Agreement</h2>
          <p>If any provision of these terms is found unenforceable, the remaining provisions stay in effect. These terms, together with our <Link href="/privacy-policy">Privacy Policy</Link>, are the entire agreement between you and us regarding the site.</p>

          <h2>Accessibility</h2>
          <p>The calculators use native form controls — number inputs and selects — with a label associated to each control, so they work with a keyboard and a screen reader without a mouse. If you meet a barrier using the site, tell us through the <Link href="/contact">contact page</Link> and we will try to remove it.</p>

          <h2>Contact</h2>
          <p>Questions about these terms: use our <Link href="/contact">contact page</Link>.</p>
        </div>
      </main>
    </>
  );
}
