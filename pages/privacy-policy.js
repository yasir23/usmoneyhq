import Head from "next/head";
import Link from "next/link";
import { contentDateLabel } from "../lib/content-dates";

/**
 * /privacy-policy
 *
 * The policy previously covered only four things: local calculation, automatic
 * technical data, AdSense, and how to opt out. That left out the questions a
 * policy actually exists to answer — how long data is kept, who else receives
 * it, what happens for visitors outside the US, what a visitor can ask us to do
 * about their data, and when the policy last changed. Those are additions, not
 * padding: each one is a disclosure the site previously did not make.
 *
 * The "Last updated" line was a hardcoded "August 2026" while the sitemap
 * advertised the legal pages as having changed on CONTENT_DATES.legal. Two
 * sources of truth for one date, disagreeing. It is now derived, so it cannot
 * drift again.
 */
export default function PrivacyPolicy() {
  const updated = contentDateLabel("legal");

  return (
    <>
      <Head>
        <title>Privacy Policy | US Money HQ</title>
        <meta name="description" content="Privacy policy for US Money HQ — what data we collect, how long we keep it, who processes it, cookies, and third-party advertising." />
        <link rel="canonical" href="https://usmoneyhq.com/privacy-policy" />
        <meta name="robots" content="index, follow" />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link> <span aria-hidden="true">›</span> <span>Privacy Policy</span></nav>
        <h1>Privacy Policy</h1>
        <p className="sub">Last updated: {updated}</p>

        <div className="seo">
          <h2>Overview</h2>
          <p>US Money HQ (&ldquo;we&rdquo;, &ldquo;our&rdquo;) provides free online calculators at usmoneyhq.com. This policy explains what information is collected, how long it is kept, who processes it, and what you can ask us to do with it. It applies to this website only.</p>

          <h2>Information We Collect</h2>
          <p><strong>Calculator inputs:</strong> All calculations run in your browser. Numbers you enter are processed locally on your device and are not stored on our servers.</p>
          <p><strong>Automatically collected data:</strong> Like most websites, we receive standard technical data such as your IP address, browser type, device type, approximate location derived from the IP address, referring page, and pages visited. This is collected by the analytics and advertising services described below.</p>
          <p><strong>Correspondence:</strong> If you email us, we receive your email address and whatever you choose to write. We keep that correspondence so we can answer you and, where you have reported an error, so we can verify the fix.</p>

          <h2>What We Do Not Collect</h2>
          <p>There are no accounts, no sign-up, and no login. We do not ask for your name, Social Security number, bank or brokerage credentials, income figures, medical details, or payment card details. We do not buy personal information from data brokers, and we do not sell or rent personal information to anyone.</p>

          <h2>Cookies and Advertising</h2>
          <p>We use Google AdSense to display advertisements. Google and its partners use cookies (including the DART cookie) to serve ads based on your prior visits to this and other websites. Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other websites. You may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>.</p>
          <p><strong>Google Analytics 4:</strong> We use Google Analytics 4 to measure page views and understand which calculators are used. It sets cookies and collects usage data such as the pages viewed, an approximate location derived from your IP address, and device type. We do not receive your name, email address, or contact details from it. You can opt out with the <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">Google Analytics opt-out browser add-on</a>.</p>
          <p><strong>Our own page counter:</strong> We also count page views through a counter on our own servers. It sets no cookies, stores no IP address, and does not attempt to identify you as an individual — it cannot tell two visitors apart and is not used to build any profile.</p>

          <h2>Who Else Receives Data</h2>
          <p>We do not disclose personal information except to the service providers that make the site work, and only for the purposes described here:</p>
          <ul>
            <li><strong>Google</strong> — advertising (AdSense) and analytics (Google Analytics 4).</li>
            <li><strong>Our hosting and network providers</strong> — servers and content delivery that receive the requests your browser makes to reach the site, including IP addresses in ordinary web server logs.</li>
            <li><strong>Our email provider</strong> — processes correspondence you send to our contact address.</li>
            <li><strong>Our checkout provider</strong> — if you buy a premium product, payment is handled by our checkout provider and we do not receive your full card number.</li>
          </ul>
          <p>We may also disclose information where we are legally required to, or to protect the rights and safety of the site or its visitors.</p>

          <h2>How Long We Keep Data</h2>
          <p>We do not operate a database of individual visitors, so there is no visitor record to expire. Aggregated page-view counts are retained indefinitely because they are not personal data. Correspondence is kept for as long as is useful to resolve the matter and to demonstrate that a reported error was fixed.</p>

          <h2>Your Choices</h2>
          <p>You can disable cookies in your browser settings, use private browsing, and opt out of personalized ads at <a href="https://adssettings.google.com" rel="noopener">adssettings.google.com</a> or <a href="https://www.aboutads.info/choices" rel="noopener">aboutads.info/choices</a>. Because the calculators run locally, blocking cookies does not affect their results.</p>

          <h2>Your Privacy Rights</h2>
          <p>Depending on where you live, you may have the right to request access to the personal information we hold about you, to have it corrected or deleted, to receive a copy, and to object to certain processing. California residents have these rights under the CCPA/CPRA, including the right not to be discriminated against for exercising them.</p>
          <p>In practice we hold very little: the only personal information we are likely to have is correspondence you sent us. To make a request, email us from the <Link href="/contact">contact page</Link> and tell us what you want done. We will confirm within 30 days. We do not sell or share personal information for cross-context behavioural advertising in a way that requires an opt-out link.</p>

          <h2>Children&rsquo;s Privacy</h2>
          <p>This site is intended for a general adult audience and is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us information, contact us and we will delete it.</p>

          <h2>Visitors Outside the United States</h2>
          <p>The site is operated from the United States and the service providers listed above may process data in the United States or other countries. If you visit from outside the United States, you understand that your information will be processed there, where privacy laws may differ from those in your country.</p>

          <h2>Security</h2>
          <p>The site is served over HTTPS. We keep the surface small deliberately: no accounts, no logins, no stored user profile. No method of transmission over the internet is completely secure, but there is no account database of yours to breach.</p>

          <h2>Changes to This Policy</h2>
          <p>If this policy changes materially, the &ldquo;Last updated&rdquo; date at the top of this page changes with it. Continued use of the site after a change means you accept the revised policy.</p>

          <h2>Contact</h2>
          <p>Questions about this policy, or a request under the rights described above: use our <Link href="/contact">contact page</Link>. See also our <Link href="/terms">Terms of Use</Link> and <Link href="/methodology">Methodology &amp; Data Sources</Link>.</p>
        </div>
      </main>
    </>
  );
}
