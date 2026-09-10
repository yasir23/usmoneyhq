import Head from "next/head";
import Script from "next/script";
import { useState } from "react";
import { TOOLS, SITE_URL, SITE_NAME } from "../lib/tools";

const FAQ = [
  ["Is it really free?", "Yes. The widgets are free for any website, permanently. There is no paid tier and no account required. The only return for us is the small attribution link at the foot of the widget."],
  ["Will it slow my site down?", "The loader is about 2.5 KB and each widget bundle is around 4 KB. That is roughly 5 KB total, loaded asynchronously, with no external frameworks, no third-party trackers and no iframe. For comparison, an iframe embed loads an entire page on top of yours."],
  ["Are there ads inside the widget?", "No. The widget contains no advertising. There is one small attribution line linking back to US Money HQ."],
  ["Do I have to update it when tax rates change?", "No. The calculations run from our engine, so federal brackets, FICA and state estimates update automatically. You never maintain the maths."],
  ["Will it match my site's design?", "The widget inherits your page's font stack and sizes sensibly at any width, including mobile under 480px. If you want a fully branded version with your own colours, get in touch and we will build one."],
  ["Can I put more than one calculator on a page?", "Yes. Add as many widget divs as you like; a single script tag loads and mounts them all, including widgets that appear later on the page."],
  ["Does the attribution link have to be there?", "It is part of the free arrangement. It is small, text-only and points to the calculator the reader is already using."],
];

export default function WidgetsPage() {
  const [tool, setTool] = useState("mortgage-calculator");
  const t = TOOLS.find((x) => x.slug === tool) || TOOLS[0];

  const scriptEmbed = `<div data-umhq-widget="${tool}"></div>\n<script async src="${SITE_URL}/widget-loader.js"></script>`;
  const iframeEmbed = `<iframe src="${SITE_URL}/${tool}?embed=1" width="100%" height="640" frameborder="0" loading="lazy" title="${t.shortTitle}"></iframe>`;

  const copy = (text) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <Head>
        <title>Free Embeddable Financial Calculator Widgets — US Money HQ</title>
        <meta
          name="description"
          content={`Add ${TOOLS.length} free US financial calculators to your site with one line of code: mortgage, salary after tax, debt payoff, affordability and more. ~5 KB, no iframe, no ads, no sign-up.`}
        />
        <link rel="canonical" href={`${SITE_URL}/widgets`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <main className="container">
        <h1>Free Calculator Widgets for Your Website</h1>
        <p className="sub">
          Add accurate US financial calculators to your site with one line of code. {TOOLS.length} calculators
          including mortgage, salary after tax, debt payoff and home affordability. No sign-up, no ads on your
          site, no maintenance — the maths updates automatically.
        </p>

        <ul className="widget-specs" style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px", listStyle: "none", padding: 0, margin: "0 0 26px", fontSize: 14, color: "#374151" }}>
          <li><strong>~5 KB</strong> total</li>
          <li>No iframe</li>
          <li>No external dependencies</li>
          <li>No tracking</li>
          <li>Mobile-responsive</li>
          <li>{TOOLS.length} calculators</li>
        </ul>

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

            <p className="method-label">Method 1 — Script (recommended)</p>
            <pre className="code-block">{scriptEmbed}</pre>
            <button className="btn" onClick={() => copy(scriptEmbed)}>Copy script embed</button>

            <p className="method-label">Method 2 — iframe</p>
            <pre className="code-block">{iframeEmbed}</pre>
            <button className="btn" onClick={() => copy(iframeEmbed)}>Copy iframe embed</button>

            <p className="widget-note">
              Paste the snippet anywhere in your page — once per widget, plus the script tag once per page.
              The widget links back to {SITE_NAME} with a small text attribution so your readers can find the
              full tool set. That link is the entire return, which is why the widgets stay free.
            </p>
          </div>
        </div>

        <div className="seo">
          <h2>Why embed our calculators?</h2>
          <p>
            Every widget runs the same engine as the full tools on this site: standard US amortisation, current
            federal tax brackets, FICA and state-aware estimates. Your readers get an answer without leaving your
            page, and you never have to maintain tax tables again.
          </p>

          <h2>Script or iframe — which should I use?</h2>
          <p>
            Use the script embed. It renders as real HTML inside your page, so it inherits your fonts, responds to
            your layout, and adds about 5 KB. The iframe option is there for platforms that block third-party
            scripts, but it loads an entire page inside yours and is slower. If your CMS only accepts iframes,
            use Method 2.
          </p>

          <h2>What it costs you</h2>
          <p>
            Nothing. No fee, no account, no revenue share. There are no ads inside the widget and no script from
            any third party — the loader is served from our own domain, and the only outbound link is the
            attribution line.
          </p>

          <h2>Frequently asked questions</h2>
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}

          <h2>Custom and bulk embeds</h2>
          <p>
            Need a branded version, extra fields, currency variants or a bulk embed across a network of sites?
            Email hello@usmoneyhq.com and we will build it.
          </p>
        </div>
      </main>

      <Script src="/widget-loader.js" strategy="afterInteractive" />
    </>
  );
}
