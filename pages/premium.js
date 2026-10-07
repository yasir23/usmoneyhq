import Head from "next/head";
import Link from "next/link";
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
 *
 * DEEPENED 2026-10-06 with the questions a buyer actually asks before paying —
 * what the commercial licence covers, what stays free, how billing and
 * cancellation work. Deliberately did NOT add new feature promises: checkout is
 * not live yet, and a tier that advertises more than it delivers is the same
 * defect class as the stale counts above.
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

  const faqs = [
    {
      q: "Do the free calculators stay free?",
      a: `Yes. All ${counts.calculators} calculators stay free and need no account, with or without a subscription. Premium adds power features and removes advertising — it does not move anything behind a paywall after the fact.`,
    },
    {
      q: "What does the commercial licence in the Webmaster Bundle actually cover?",
      a: "It lets you embed the widgets on sites you own and on sites you build for clients, with your own branding, for as long as you like. It does not let you resell or redistribute the widgets themselves as a product, or republish the calculator content in bulk.",
    },
    {
      q: "Can I cancel the Pro membership?",
      a: "Yes, at any time. Billing is handled by our checkout provider, and you can cancel from your account there — access continues to the end of the period you have already paid for.",
    },
    {
      q: "How current is the state tax data pack?",
      a: "It is refreshed quarterly and the pack states the date of the release it was built from, so you can see how old your copy is before you rely on it. Tax structures do change between releases.",
    },
    {
      q: "Is a purchase refundable?",
      a: "If a purchase does not work as described, email us and we will put it right — including a refund where that is the right answer. We would rather fix the problem than keep the money.",
    },
  ];

  return (
    <>
      <Head>
        <title>Premium — {SITE_NAME} Pro, Data Packs &amp; Widget Bundle | {SITE_NAME}</title>
        <meta name="description" content={`Go beyond the free calculators: ${SITE_NAME} Pro (ad-free, advanced tools, exports), state tax data packs, and the branded webmaster calculator bundle. Powered by Whop.`} />
        <link rel="canonical" href={`${SITE_URL}/premium`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </Head>

      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link> <span aria-hidden="true">›</span> <span>Premium</span></nav>
        <h1>Go Premium — Support {SITE_NAME}</h1>
        <p className="sub">The calculators stay free forever. Premium unlocks the power features — and keeps the lights on.</p>

        {!shopReady && (
          <div className="note-box">Checkout is being wired up — products go live within days. Join the waitlist below to get notified.</div>
        )}

        <div className="premium-grid">
          <div className="card premium-card">
            <h2>{SITE_NAME} Pro</h2>
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
              <li>Income tax type &amp; notes, property tax %, sales tax %</li>
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
          <h2>Which one is for you</h2>
          <p><strong>Pro</strong> is for an individual who uses the calculators regularly and wants to compare scenarios side by side without advertising in the way — a household working out a mortgage refi, a retirement date, or a rent-versus-buy decision.</p>
          <p><strong>The State Tax Data Pack</strong> is for someone who needs the underlying numbers, not a calculator: a realtor comparing take-home pay across two states for a relocating client, a tax preparer, or an analyst who wants the table in a spreadsheet.</p>
          <p><strong>The Webmaster Bundle</strong> is for someone who runs websites — a broker, an accountant, an agency — and wants the calculators on their own pages under their own branding, with a licence that covers client work.</p>

          <h2>What stays free, permanently</h2>
          <p>Every calculator, every state page, every guide, and the full developer API stay free and require no account. There is no trial, no card on file, and no feature that works today and moves behind a paywall later. If a calculator is free when you find it, it stays free.</p>

          <h2>Billing, cancellation and refunds</h2>
          <p>Subscriptions and one-time purchases are handled by our checkout provider, so we never see or store your card details. You can cancel a subscription from your account with the provider at any time and keep access to the end of the period you have paid for. If something you bought does not work as described, contact us and we will fix it or refund it.</p>

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
          <p>{SITE_NAME} runs on advertising and premium support. Your subscription removes the ads, unlocks the power tools, and directly funds the free calculators. No data is ever sold.</p>
        </div>

        <div className="seo">
          <h2>Questions before you buy</h2>
          {faqs.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>

        <div className="waitlist">
          <h2>Waitlist</h2>
          <p>Email <a href="mailto:hello@usmoneyhq.com?subject=Premium%20waitlist">hello@usmoneyhq.com</a> with the subject &quot;Premium waitlist&quot; and we&apos;ll notify you the moment checkout is live.</p>
        </div>
      </main>
    </>
  );
}
