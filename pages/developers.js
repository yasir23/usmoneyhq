import Head from "next/head";
import Link from "next/link";
import AdSlot from "../components/AdSlot";
import { SITE_URL, SITE_NAME } from "../lib/tools";
import { siteCounts } from "../lib/site-counts";

/**
 * /developers
 *
 * Every endpoint and response shape below was captured from the live site on
 * 2026-10-06 rather than read off the route files, because the two differ in a
 * way that matters:
 *
 *   POSTing an empty or unparseable body returns HTTP 200 with each field
 *   falling back to its default. It never returns 400. A client that trusts a
 *   200 as "my inputs were used" will silently compute the wrong thing.
 *
 * Two further corrections from that capture:
 *
 *   1. The page claimed the REST API is "CORS-open for any origin". It was not:
 *      no Access-Control-* header was sent at all. Server-side clients never
 *      noticed, which is how the claim survived. The headers now exist (scoped
 *      to /api/calc and /api/widget in next.config.js), so the claim is true.
 *
 *   2. The tool count was hardcoded as "105" in four places including the meta
 *      description. It is now derived from lib/site-counts, so it cannot drift
 *      from the registry it describes.
 */
export default function DevelopersPage() {
  const counts = siteCounts();
  const n = counts.calculators;

  const faqs = [
    {
      q: "Do I need an API key?",
      a: `No. Every endpoint is open, with no key, no account, and no sign-up. The calculator API is public arithmetic over public data.`,
    },
    {
      q: "Why did my POST return 200 but the wrong numbers?",
      a: "A missing or unparseable JSON body is treated as empty, and each field falls back to its default. Check the field keys against the GET schema first — an unrecognised key is ignored rather than rejected.",
    },
    {
      q: "Are the result values numbers?",
      a: `No. They are preformatted display strings such as "$1,516.96". Strip the symbol and thousands separators before doing arithmetic, or use the same formula from the methodology page.`,
    },
    {
      q: "Is there a rate limit?",
      a: "No published limit and no key. It is one shared server serving every caller, so please cache results rather than re-requesting the same schema in a loop.",
    },
  ];

  return (
    <>
      <Head>
        <title>Developers — Connect {SITE_NAME} Calculators to AI Agents | {SITE_NAME}</title>
        <meta name="description" content={`Expose ${n} free US finance calculators to AI agents via MCP, llms.txt, and a JSON REST API. Free, no key, CORS-open.`} />
        <link rel="canonical" href={`${SITE_URL}/developers`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Developers — AI Agent Tools",
              url: `${SITE_URL}/developers`,
              about: `MCP server, llms.txt, and REST API for ${n} US finance calculators`,
            }),
          }}
        />
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
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span aria-hidden="true">›</span> <span>Developers</span>
        </nav>
        <h1>Developers: give AI agents {n} finance calculators</h1>
        <p className="lead">
          Every calculator on {SITE_NAME} is computable by machines — MCP tools, llms.txt discovery,
          and a CORS-open REST API. Free, no API key, no account.
        </p>

        <div className="card">
          <h2>1. MCP Server (for AI agents)</h2>
          <p>
            Connect Claude Desktop, Cursor, or any MCP-aware agent to{" "}
            <code>{SITE_URL}/api/mcp</code> — all {n} calculators appear as native tools.
          </p>
          <pre>{`"mcpServers": {
  "usmoneyhq": {
    "url": "${SITE_URL}/api/mcp"
  }
}`}</pre>
          <p>Try it:</p>
          <pre>{`curl -s -X POST ${SITE_URL}/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}</pre>
          <p>
            Then call any tool: <code>tools/call</code> with{" "}
            <code>{`{"name":"mortgage-calculator","arguments":{"amount":300000,"rate":6.5,"years":30}}`}</code>.
            A machine-readable server card is published at{" "}
            <code>/.well-known/mcp/server-card.json</code>.
          </p>
        </div>

        <div className="card">
          <h2>2. llms.txt (for agent discovery)</h2>
          <p>
            <a href="/llms.txt">{SITE_URL}/llms.txt</a> follows the{" "}
            <a href="https://llmstxt.org" rel="nofollow noopener">llmstxt.org</a> standard so
            browsing agents can find and cite our tools. The site also publishes a Google
            A2A-style agent card at <code>/.well-known/agent-card.json</code> and an RFC 9727
            linkset at <code>/.well-known/api-catalog</code>.
          </p>
        </div>

        <div className="card">
          <h2>3. REST API — get the schema, then compute</h2>
          <p>
            Every calculator has a JSON endpoint. No key, CORS-open for any origin, so this works
            from a script, a server, an agent, or a page on your own site.
          </p>
          <pre>{`# 1. Schema — what fields does it take?
GET  ${SITE_URL}/api/calc/mortgage-calculator

# 2. Compute
POST ${SITE_URL}/api/calc/mortgage-calculator
{"amount": 300000, "rate": 6.5, "years": 30}`}</pre>
          <p>
            <strong>Schema response</strong> — <code>slug</code>, <code>title</code>,{" "}
            <code>description</code>, and <code>fields[]</code>. Each field carries{" "}
            <code>key</code>, <code>label</code>, and <code>type</code>; numeric fields add{" "}
            <code>min</code>, <code>max</code>, and <code>step</code>, and selects carry{" "}
            <code>options</code>.
          </p>
          <p>
            <strong>Compute response</strong> — the real output for the call above, captured live:
          </p>
          <pre>{`{
  "tool": "mortgage-calculator",
  "results": [
    { "label": "Loan amount",    "value": "$240,000.00",  "highlight": false },
    { "label": "Monthly payment","value": "$1,516.96",    "highlight": true  },
    { "label": "Total interest", "value": "$306,106.77",  "highlight": false },
    { "label": "Total paid",     "value": "$546,106.77",  "highlight": false }
  ],
  "ts": "2026-10-06T12:11:48.721Z"
}`}</pre>
          <p>
            Full machine-readable specification: <a href="/openapi.json">{SITE_URL}/openapi.json</a>.
            Every calculator page is listed on the <Link href="/">homepage</Link>.
          </p>
        </div>

        <div className="card">
          <h2>Four things that surprise integrators</h2>
          <ul>
            <li>
              <strong>An empty or invalid body is not an error.</strong> POSTing{" "}
              <code>{"{}"}</code> returns <strong>HTTP 200</strong> with every field at its
              default. The API never returns 400. Read the schema before you send, or you will
              compute a default you did not intend.
            </li>
            <li>
              <strong>Result values are preformatted strings</strong> — <code>"$1,516.96"</code>,
              not <code>1516.96</code>. Strip the currency symbol and separators before you do
              arithmetic. They are display values, not raw floats.
            </li>
            <li>
              <strong>Unknown keys are ignored, unknown tools are not.</strong> An unrecognised
              field is dropped silently; an unrecognised tool slug returns{" "}
              <code>404 {"{ \"error\": \"unknown tool\" }"}</code>.
            </li>
            <li>
              <strong>Non-numeric input falls back to the default</strong> rather than erroring,
              so a string in a number field quietly produces the default answer.
            </li>
          </ul>
        </div>

        <div className="card">
          <h2>4. Embeddable widgets</h2>
          <p>
            Any of the {counts.widgets} calculators can be embedded in your own site.{" "}
            <code>GET /api/widget/&lt;tool&gt;</code> returns{" "}
            <code>{"{ html, js }"}</code>, and <a href="/widget-loader.js">
            {SITE_URL}/widget-loader.js</a> renders it. The response is CORS-open by design —
            the footer backlink is the value to us.
          </p>
        </div>

        <div className="card">
          <h2>Data provenance</h2>
          <p>
            Every result is computed server-side by the same engine the interactive pages use,
            from the same published tables. See{" "}
            <Link href="/methodology">Methodology &amp; Data Sources</Link>.
          </p>
        </div>

        <div className="card">
          <h2>Use, attribution and limits</h2>
          <p>
            Use is free for personal and internal business purposes. Quoting a result with
            attribution and a link back is welcome. Republishing the calculator content in bulk,
            or embedding the calculators on a commercial or client site, needs the commercial
            licence included with the <Link href="/premium">Webmaster Bundle</Link> — see the{" "}
            <Link href="/terms">Terms of Use</Link>.
          </p>
          <p>
            There is no published rate limit and no key, because it is one shared server serving
            every caller. Cache the schema, avoid re-requesting it in a loop, and write to{" "}
            <a href="mailto:hello@usmoneyhq.com?subject=API">hello@usmoneyhq.com</a> if you need a
            higher-volume arrangement or find a bug.
          </p>
        </div>

        <div className="card">
          <h2>Questions integrators ask</h2>
          {faqs.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>

        <AdSlot />
      </main>
    </>
  );
}
