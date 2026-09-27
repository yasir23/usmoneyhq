import Head from "next/head";
import { SITE_URL, SITE_NAME } from "../lib/tools";
import { WHOP_SHOP_URL, WHOP_PRO_URL, WHOP_DATA_PACK_URL, WHOP_BUNDLE_URL } from "../lib/whop";
import { siteCounts } from "../lib/site-counts";

/**
 * /premium — Whop-powered premium tier: Pro membership, data packs, webmaster bundle.
 *
 * COUNT DISCIPLINE (fixed 2026-09-27)
 * This page asserted "Ad-free across all 733 pages" and "All 54 embeddable
 * calculator widgets". Neither was true: the sitemap publishes 140 pages, and
 * the widget endpoint serves every one of the 105 tools. Both numbers were
 * surviving stale values from earlier generations of the site.
 *
 * They are now DERIVED via lib/site-counts.ts, which reads the same source the
 * sitemap is built from. A subscriber is being asked to pay for a stated
 * quantity, so that quantity has to be unable to drift — a hardcoded number
 * cannot fail loudly when the inventory changes underneath it.
 */
export default function PremiumPage() {
  const shopReady = !!WHOP_SHOP_URL;
  const counts = siteCounts();

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
              <li>Ad-free across all {counts.pages} pages</li>
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
              <li>All {counts.widgets} embeddable calculator widgets</li>
              <li>Your branding on every widget</li>
              <li>Priority support + custom field requests</li>
              <li>Commercial license for client sites</li>
            </ul>
            {btn(WHOP_BUNDLE_URL, "Get the Bundle")}
          </div>
        </div>

        <div className="seo">
          <h2>Earn 30% recurring commission</h2>
          {/*
            FIXED 2026-09-27. This paragraph used to link out to https://whop.com
            — the platform's generic homepage — whenever WHOP_SHOP_URL was unset,
            under a heading promising 30% recurring commission. Two problems:
            a reader would reasonably read that link as THE way to join the
            program, and it earned nothing for anyone if clicked. It also
            carried rel="noopener" only, unlike every real buy button on this
            page, which carries rel="noopener sponsored".
            Now there is no outbound link until a real shop exists, so the page
            cannot point a reader at a destination that does not serve them.
          */}
          {shopReady ? (
            <p>
              Every premium sale referred by you pays 30% — recurring for as long as the customer
              stays subscribed. Visit{" "}
              <a href={WHOP_SHOP_URL} target="_blank" rel="noopener sponsored">our Whop shop</a>,
              open the product, and grab your affiliate link.
            </p>
          ) : (
            <p>
              When checkout opens, every premium sale you refer will pay 30% — recurring for as long
              as the customer stays subscribed. The affiliate program opens with the shop. Email{" "}
              <a href="mailto:hello@usmoneyhq.com?subject=Affiliate%20program">hello@usmoneyhq.com</a>{" "}
              with the subject &ldquo;Affiliate program&rdquo; and we will send your link the day it
              goes live.
            </p>
          )}
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
