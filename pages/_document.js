import Document, { Html, Head, Main, NextScript } from "next/document";
import { ADSENSE_PUB_ID, ADSENSE_ACTIVE } from "../lib/ads";
import { GOOGLE_SITE_VERIFICATION } from "../lib/verification";
import { GA4_ID, GA4_ACTIVE } from "../lib/analytics";

export default class SiteDocument extends Document {
  render() {
    return (
      <Html lang="en-US">
        <Head>
          {/* Favicon set — Google requires a proper multi-size favicon to drop the gray globe */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="theme-color" content="#0f172a" />
          {/* SEO */}
          <meta name="robots" content="index, follow" />
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
