import Head from "next/head";
import { staticPageSchema } from "../lib/pageSchema";
import { AFFILIATE_DISCLOSURE } from "../lib/affiliates";

/**
 * /disclosure — advertising and affiliate disclosure.
 *
 * Separate from /privacy on purpose: the FTC wants the commercial relationship
 * disclosed where a reader is deciding whether to trust a recommendation, and
 * AdSense reviewers look for a distinct advertising disclosure, not a clause buried
 * in a privacy policy. Text is taken from lib/affiliates AFFILIATE_DISCLOSURE so it
 * cannot drift from what the components actually render.
 *
 * DEEPENED 2026-11-02. Measured at 329 visible words against a 700-word floor for
 * trust pages on this site (scripts/thin_breakdown.py) — it was the thinnest page on
 * the domain, and trust pages are what a human reviewer reads when judging a
 * low-value-content appeal. The added sections describe mechanisms that are
 * verifiable in the code (the /api/go redirect, the live:false render rule, the
 * one-active-affiliate fact), not assurances: every statement here can be checked
 * against lib/affiliates.ts and the rendered page.
 */
const SCHEMA = staticPageSchema({
  name: "Advertising & Affiliate Disclosure | US Money HQ",
  description:
    "How US Money HQ earns money, which links are compensated, how to recognise one, and what compensation does and does not affect.",
  path: "/disclosure",
  type: "WebPage",
  dateModified: "2026-11-02",
});

export default function Disclosure() {
  return (
    <>
      <Head>
        <title>Advertising &amp; Affiliate Disclosure | US Money HQ</title>
        <meta
          name="description"
          content="How US Money HQ earns money, which links are compensated, how to recognise one, and what compensation does and does not affect."
        />
        <link rel="canonical" href="https://usmoneyhq.com/disclosure" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Disclosure</span></nav>
        <h1>Advertising &amp; Affiliate Disclosure</h1>
        <p className="muted">Last updated: 2 November 2026</p>

        <p>
          This page explains how this site earns money, so that a reader deciding whether to trust a figure or a
          recommendation can see what sits behind it. It covers the calculators, the guides that embed them, and
          every other page on usmoneyhq.com.
        </p>

        <h2>How this site earns money</h2>
        <p>There are exactly two commercial mechanisms on this site, and no others:</p>
        <ul>
          <li>
            <strong>Display advertising.</strong> The site is set up to serve advertising through Google AdSense.
          </li>
          <li>
            <strong>Affiliate commissions.</strong> Some outbound links to commercial products are compensated when a
            reader signs up or buys through them.
          </li>
        </ul>
        <p>
          The calculators themselves are free, require no account, and are not gated behind a payment or an email
          address. Using a tool never depends on clicking an advertisement or a partner link.
        </p>

        <h2>Advertising</h2>
        <p>
          Advertisements, where shown, are served by Google AdSense. Advertisers pay for impressions and clicks; we do
          not choose which individual creatives appear, we cannot see who a given reader is, and we do not endorse an
          advertised product merely because it appears next to our content.
        </p>
        <p>
          Advertising is kept visually separate from calculator results and is never placed inside a result panel. A
          calculator must remain usable with advertising present: the inputs, the button and the output are the point
          of the page, and an advertisement that displaces them on a small screen is a defect rather than a
          compromise. If you see one behaving that way, tell us through the address on the{" "}
          <a href="/about">about page</a>.
        </p>

        <h2>Affiliate links</h2>
        <p>{AFFILIATE_DISCLOSURE}</p>
        <p>
          A compensated link never changes a calculation. Every figure produced by a tool on this site comes from the
          formula documented on that tool&apos;s page, applied to the numbers you enter. No advertiser can alter a
          result, suppress a product from a comparison, or pay to change a rate we display.
        </p>

        <h2>How to recognise a compensated link</h2>
        <p>
          Commercial outbound links pass through a redirect on our own domain before they reach the partner, so the
          address bar briefly shows usmoneyhq.com and then the partner&apos;s site. Any page carrying a compensated
          link also carries the disclosure sentence above, near the link rather than only on this page.
        </p>
        <p>
          Not every outbound link is compensated. Links to primary sources — the IRS, the Social Security
          Administration, the Consumer Financial Protection Bureau, state revenue departments, the Census Bureau — are
          never compensated, and no government body has any commercial relationship with this site.
        </p>

        <h2>Current commercial relationships</h2>
        <p>
          Stated plainly, as of 2 November 2026: the site has one active affiliate relationship, with Shopify, through
          the Impact network. Partner slots for other categories are registered in the site&apos;s code but inactive,
          and an offer without a tracked link is not rendered at all — so a page can legitimately contain no affiliate
          links even where that page type supports them. This section is updated when the position changes rather than
          describing a roadmap as though it were live.
        </p>

        <h2>What we will not do</h2>
        <ul>
          <li>We do not publish a recommendation for a product we have not read the current terms for.</li>
          <li>We do not present a paid placement as an independent ranking.</li>
          <li>We do not accept payment to remove a competitor from a comparison.</li>
          <li>We do not accept payment to change a rate, a formula or a calculator result.</li>
          <li>We do not sell or rent email addresses, and the newsletter is opt-in only.</li>
        </ul>

        <h2>Email and reader data</h2>
        <p>
          The newsletter is optional. It is offered as a separate choice, it is never a precondition for using a
          calculator, and every message carries an unsubscribe link. Addresses are used to send the newsletter and
          nothing else. What is collected, how long it is kept and how to have it removed is set out in the{" "}
          <a href="/privacy-policy">privacy policy</a>.
        </p>

        <h2>The rules we follow</h2>
        <p>
          The commercial relationships on this site are disclosed in line with the FTC&apos;s Endorsement Guides
          (16 CFR Part 255), which require a material connection to be disclosed clearly and close to the
          recommendation it affects — not only on a separate legal page. Advertising is placed and labelled in line
          with Google&apos;s AdSense programme policies.
        </p>

        <h2>If something here looks wrong</h2>
        <p>
          If a link or advertisement on this site looks misleading — or if a page recommends something it does not
          disclose a relationship with — tell us through the address on the <a href="/about">about page</a> and we
          will review it. How corrections are handled is set out in the{" "}
          <a href="/editorial-policy">editorial policy</a>, which also explains where the numbers come from.
        </p>

        <h2>Changes to this page</h2>
        <p>
          Material changes are dated at the top of the page. The date published in the sitemap for this page comes
          from the same maintained record of material content changes, so it reflects when the text actually changed
          rather than when the site was last deployed.
        </p>
      </main>
    </>
  );
}
