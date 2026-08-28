import Document, { Html, Head, Main, NextScript } from "next/document";
import { ADSENSE_PUB_ID, ADSENSE_ACTIVE } from "../lib/ads";

export default class SiteDocument extends Document {
  render() {
    return (
      <Html lang="en-US">
        <Head>
          {/* SEO */}
          <meta name="robots" content="index, follow" />
          <meta property="og:site_name" content="US Money HQ" />
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
