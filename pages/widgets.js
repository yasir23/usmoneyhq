import Head from "next/head";
import Script from "next/script";
import { useState } from "react";
import { TOOLS, SITE_URL, SITE_NAME } from "../lib/tools";

/** /widgets — embeddable calculator widgets: live demo + copy-paste embed code. */
export default function WidgetsPage() {
  const [tool, setTool] = useState("mortgage-calculator");
  const t = TOOLS.find((x) => x.slug === tool) || TOOLS[0];

  const scriptEmbed = `<div data-umhq-widget="${tool}"></div>\n<script async src="${SITE_URL}/widget-loader.js"></script>`;
  const iframeEmbed = `<iframe src="${SITE_URL}/${tool}?embed=1" width="100%" height="640" frameborder="0" loading="lazy" title="${t.shortTitle}"></iframe>`;

  const copy = (text) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
  };

  return (
    <>
      <Head>
        <title>Free Embeddable Financial Calculator Widgets — US Money HQ</title>
        <meta name="description" content="Add free, accurate US financial calculators to your site with one line of code: mortgage, salary, tax, loan, retirement and more. Includes a link back to US Money HQ." />
        <link rel="canonical" href={`${SITE_URL}/widgets`} />
      </Head>

      <main className="container">
        <h1>Free Calculator Widgets for Your Website</h1>
        <p className="sub">Embed accurate US financial calculators with one line of code. No sign-up, no ads on your site, works anywhere.</p>

        <div className="widget-demo-grid">
          <div>
            <h2>Live demo</h2>
            <div data-umhq-widget={tool}></div>
          </div>
          <div>
            <h2>Get the embed code</h2>
            <label className="field-label" htmlFor="tool-select">Choose a calculator</label>
            <select id="tool-select" className="input" value={tool} onChange={(e) => setTool(e.target.value)}>
              {TOOLS.map((x) => (
                <option key={x.slug} value={x.slug}>{x.shortTitle}</option>
              ))}
            </select>

            <p className="method-label">Method 1 — Script (recommended, responsive)</p>
            <pre className="code-block">{scriptEmbed}</pre>
            <button className="btn" onClick={() => copy(scriptEmbed)}>Copy script embed</button>

            <p className="method-label">Method 2 — iframe</p>
            <pre className="code-block">{iframeEmbed}</pre>
            <button className="btn" onClick={() => copy(iframeEmbed)}>Copy iframe embed</button>

            <p className="widget-note">The widget is free for any site. It links back to {SITE_NAME} so your readers can explore the full tool set — no attribution required beyond the automatic link.</p>
          </div>
        </div>

        <div className="seo">
          <h2>Why embed our calculators?</h2>
          <p>Every widget is powered by the same formulas as the full tools on this site: standard US amortization, 2025 federal tax brackets, FICA, and state-aware estimates. Updates roll out automatically — you never maintain the math.</p>
          <h2>Custom widgets</h2>
          <p>Need a branded version, different fields, or a bulk embed for a network of sites? Email hello@usmoneyhq.com.</p>
        </div>
      </main>

      <Script src="/widget-loader.js" strategy="afterInteractive" />
    </>
  );
}
