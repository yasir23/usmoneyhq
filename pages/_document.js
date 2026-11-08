import Document, { Html, Head, Main, NextScript } from "next/document";
import { ADSENSE_PUB_ID, ADSENSE_ACTIVE } from "../lib/ads";
import { GOOGLE_SITE_VERIFICATION } from "../lib/verification";
import { GA4_ID, GA4_ACTIVE } from "../lib/analytics";

export default class SiteDocument extends Document {
  render() {
    return (
      <Html lang="en-US">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* Favicon set — Google requires a proper multi-size favicon to drop the gray globe */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="theme-color" content="#0f172a" />
          <meta name="fo-verify" content="43649d3d-7769-4088-9cd7-7376c60a54cc" />
          {/* SEO */}

          {/* Deliberately NO site-wide robots meta here. Do not add one back.

              A site-wide tag has now been introduced TWICE and removed twice,
              both times after it broke pages that declare their own directive:

                2026-09-18 -> 09-22  broke the 2,907 amount x state pages
                2026-11-02 -> 11-04  broke every noindex variant page again
                                     (introduced trying to add
                                     max-image-preview:large site-wide)

              The failure is structural, not a matter of wording: _document.js
              renders for EVERY route and cannot know whether the page will emit
              its own tag, so any global directive lands alongside the page-level
              one. A variant page then serves TWO robots tags —
              "noindex, follow" plus "index, follow" — which is the exact
              self-contradiction this site was rejected for. Google resolves the
              conflict to the most restrictive, so the intent held by luck, but
              the page still stated both things at once and the outcome depended
              on conflict resolution rather than on a plain declaration.

              CORRECT SHAPE: exactly one robots tag per page, or none.
                - indexable page emits no tag  => default is index, follow
                - noindex page emits exactly one, from its own <Head>
              Where max-image-preview:large is wanted, it is attached to the
              page-level tag that already exists (see components/ToolPageShell),
              never added as a second tag here.

              Guarded at build time by scripts/verify_robots_meta.mjs, which
              fails `npm run build` if any prerendered page emits more than one
              robots tag or mixes index with noindex. A comment is not a guard. */}


          <meta property="og:site_name" content="US Money HQ" />
          <meta property="og:image" content="https://usmoneyhq.com/og.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="US Money HQ — Free Financial Calculators" />
          {/* Google Search Console verification — active once a token is set in lib/verification.ts */}
          {GOOGLE_SITE_VERIFICATION && (
            <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
          )}
          {/* Google Analytics 4 — only loads once lib/analytics.ts has a real GA4 ID */}
          {GA4_ACTIVE && (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA4_ID}', { anonymize_ip: true });`,
                }}
              />
            </>
          )}
          {/* AdSense site-ownership verification.
              This meta tag is what satisfies AdSense's "Verify site ownership"
              step. The loader script below is NOT a substitute for it: the
              script only serves ads, so with the script present and this tag
              absent the dashboard still shows ownership as unverified —
              exactly the state the account was in on 2026-09-26. */}
          {ADSENSE_ACTIVE && (
            <meta name="google-adsense-account" content={ADSENSE_PUB_ID} />
          )}
          {/* Google AdSense loader — only loads once lib/ads.ts has a real publisher ID */}
          {ADSENSE_ACTIVE && (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
              crossOrigin="anonymous"
            />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
