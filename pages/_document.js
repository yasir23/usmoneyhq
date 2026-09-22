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
          {/* SEO */}
          {/* Deliberately NO site-wide robots meta here. `index, follow` is the
              default for any page that does not declare one, so adding it site-wide
              bought nothing and actively broke pages that DO declare one: a page
              rendering its own noindex produced TWO conflicting robots tags
              (noindex,follow alongside index,follow). Google resolves conflicts to
              the most restrictive, so the intent held — but the page was
              self-contradictory and the signal depended on conflict-resolution
              rules rather than being stated plainly. This affected the 2,907
              amount x state pages from 2026-09-18 until 2026-09-22, and would have
              affected the metro exclusion too. Removed so exactly one robots tag
              renders per page: the page-level one, or none (= indexable). */}

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
