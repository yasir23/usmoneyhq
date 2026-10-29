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
 */
const SCHEMA = staticPageSchema({
  name: "Advertising & Affiliate Disclosure | US Money HQ",
  description:
    "How US Money HQ earns money, which links are compensated, and what that does and does not affect.",
  path: "/disclosure",
  type: "WebPage",
  dateModified: "2026-10-29",
});

export default function Disclosure() {
  return (
    <>
      <Head>
        <title>Advertising &amp; Affiliate Disclosure | US Money HQ</title>
        <meta
          name="description"
          content="How US Money HQ earns money, which links are compensated, and what that does and does not affect."
        />
        <link rel="canonical" href="https://usmoneyhq.com/disclosure" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Disclosure</span></nav>
        <h1>Advertising &amp; Affiliate Disclosure</h1>
        <p className="muted">Last updated: 29 October 2026</p>

        <h2>Advertising</h2>
        <p>
          This site displays advertising served by Google AdSense. Advertisers pay for impressions and
          clicks; we do not choose which individual ads appear and we do not endorse them. Advertising is
          kept visually separate from calculator results and is never placed inside a result panel.
        </p>

        <h2>Affiliate links</h2>
        <p>{AFFILIATE_DISCLOSURE}</p>
        <p>
          A compensated link never changes a calculation. Every figure produced by a tool on this site comes
          from the formula documented on that tool&apos;s page, applied to the numbers you enter. No
          advertiser can alter a result, suppress a product from a comparison, or pay to change a rate we
          display.
        </p>

        <h2>What we will not do</h2>
        <ul>
          <li>We do not publish a recommendation for a product we have not read the current terms for.</li>
          <li>We do not present a paid placement as an independent ranking.</li>
          <li>We do not accept payment to remove a competitor from a comparison.</li>
        </ul>

        <h2>Questions</h2>
        <p>
          If a link or advertisement on this site looks misleading, tell us through the address on the{" "}
          <a href="/about">about page</a> and we will review it. Corrections policy is on the{" "}
          <a href="/editorial-policy">editorial policy</a> page.
        </p>
      </main>
    </>
  );
}
