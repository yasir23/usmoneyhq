import Head from "next/head";
import { SITE_URL, SITE_NAME } from "../lib/tools";
import { WHOP_SHOP_URL, WHOP_PRO_URL, WHOP_DATA_PACK_URL, WHOP_BUNDLE_URL } from "../lib/whop";

/** /premium — Whop-powered premium tier: Pro membership, data packs, webmaster bundle. */
export default function PremiumPage() {
  const shopReady = !!WHOP_SHOP_URL;

  const btn = (href, label) =>
    href ? (
      <a className="btn btn-buy" href={href} target="_blank" rel="noopener sponsored">{label}</a>
    ) : (
      <span className="btn btn-disabled">Coming soon — shop setup in progress</span>
    );

  return (
    <>
      <Head>
        <title>Premium — US Money HQ Pro, Data Packs & Widget Bundle | US Money HQ</title>
        <meta name="description" content="Go beyond the free calculators: US Money HQ Pro (ad-free, advanced tools, exports), state tax data packs, and the branded webmaster calculator bundle. Powered by Whop." />
        <link rel="canonical" href={`${SITE_URL}/premium`} />
      </Head>

      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Premium</span></nav>
        <h1>Go Premium — Support US Money HQ</h1>
        <p className="sub">The calculators stay free forever. Premium unlocks the power features — and keeps the lights on.</p>

        {!shopReady && (
          <div className="note-box">Checkout is being wired up — products go live within days. Join the waitlist below to get notified.</div>
        )}

        <div className="premium-grid">
          <div className="card premium-card">
            <h2>US Money HQ Pro</h2>
            <p className="price">$9/mo or $49/yr</p>
            <ul>
              <li>Ad-free across all 733 pages</li>
              <li>Advanced tools: full rent-vs-buy scenarios, tax optimizer, amortization tables</li>
              <li>Export results to CSV / PDF</li>
              <li>Save and compare scenarios</li>
              <li>Early access to new calculators</li>
            </ul>
            {btn(WHOP_PRO_URL, "Get Pro on Whop")}
          </div>

          <div className="card premium-card">
            <h2>State Tax Data Pack</h2>
            <p className="price">$19 one-time</p>
            <ul>
              <li>All 50 states + DC in one spreadsheet</li>
              <li>Income tax type & notes, property tax %, sales tax %</li>
              <li>Clean CSV + Excel formats, updated quarterly</li>
              <li>Perfect for realtors, tax pros, and analysts</li>
            </ul>
            {btn(WHOP_DATA_PACK_URL, "Get the Data Pack")}
          </div>

          <div className="card premium-card">
            <h2>Webmaster Bundle</h2>
            <p className="price">$29 one-time</p>
            <ul>
              <li>All 54 embeddable calculator widgets</li>
              <li>Your branding on every widget</li>
              <li>Priority support + custom field requests</li>
              <li>Commercial license for client sites</li>
            </ul>
            {btn(WHOP_BUNDLE_URL, "Get the Bundle")}
          </div>
        </div>

        <div className="seo">
          <h2>Earn 30% recurring commission</h2>
          <p>Every premium sale referred by you pays 30% — recurring for as long as the customer stays subscribed. Join the Whop affiliate program after checkout opens: <a href={WHOP_SHOP_URL || "https://whop.com"} target="_blank" rel="noopener">{WHOP_SHOP_URL ? "visit our Whop shop" : "whop.com"}</a>, open the product, and grab your affiliate link.</p>
          <h2>Why pay?</h2>
          <p>US Money HQ runs on advertising and premium support. Your subscription removes the ads, unlocks the power tools, and directly funds the free calculators. No data is ever sold.</p>
        </div>

        <div className="waitlist">
          <h2>Waitlist</h2>
          <p>Email <a href="mailto:hello@usmoneyhq.com?subject=Premium%20waitlist">hello@usmoneyhq.com</a> with the subject "Premium waitlist" and we'll notify you the moment checkout is live.</p>
        </div>
      </main>
    </>
  );
}
