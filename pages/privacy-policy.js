import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | US Money HQ</title>
        <meta name="description" content="Privacy policy for US Money HQ — what data we collect, cookies, and third-party advertising." />
        <link rel="canonical" href="https://usmoneyhq.com/privacy-policy" />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Privacy Policy</span></nav>
        <h1>Privacy Policy</h1>
        <p className="sub">Last updated: August 2026</p>

        <div className="seo">
          <h2>Overview</h2>
          <p>US Money HQ ("we", "our") provides free online calculators. This policy explains what information is collected and how it is used when you visit usmoneyhq.com.</p>

          <h2>Information We Collect</h2>
          <p><strong>Calculator inputs:</strong> All calculations run in your browser. Numbers you enter are processed locally on your device and are not stored on our servers.</p>
          <p><strong>Automatically collected data:</strong> Like most websites, we receive standard technical data such as your IP address, browser type, device type, and pages visited, collected by analytics and advertising partners.</p>

          <h2>Cookies and Advertising</h2>
          <p>We use Google AdSense to display advertisements. Google and its partners use cookies (including the DART cookie) to serve ads based on your prior visits to this and other websites. You may opt out of personalized advertising by visiting <a href="https://adssettings.google.com">Google Ads Settings</a>.</p>
          <p>Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other websites.</p>

          <h2>How We Use Information</h2>
          <p>We use aggregated data to understand traffic patterns, improve our tools, and display relevant advertising. We do not sell personal information.</p>

          <h2>Your Choices</h2>
          <p>You can disable cookies in your browser settings, use private browsing, or opt out of personalized ads at <a href="https://adssettings.google.com">adssettings.google.com</a> and <a href="https://www.aboutads.info/choices">aboutads.info/choices</a>.</p>

          <h2>Contact</h2>
          <p>Questions about this policy: <a href="/contact">contact page</a>.</p>
        </div>
      </main>
    </>
  );
}
