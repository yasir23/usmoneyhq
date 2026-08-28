import Document, { Html, Head, Main, NextScript } from "next/document";

export default class SiteDocument extends Document {
  render() {
    return (
      <Html lang="en-US">
        <Head>
          {/* SEO */}
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={`https://YOUR-DOMAIN.com${this.props.__NEXT_DATA__?.page || ""}`} />
          <meta property="og:site_name" content="US Calc Tools" />
          {/* Google AdSense — replace CA-xxx with your publisher ID after approval */}
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
            crossOrigin="anonymous"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
