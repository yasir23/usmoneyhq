import Head from "next/head";
import Link from "next/link";
import AdSlot from "../../components/AdSlot";
import { SITE_URL, SITE_NAME } from "../../lib/tools";

export default function DevelopersPage() {
  return (
    <>
      <Head>
        <title>Developers — Connect US Money HQ Calculators to AI Agents | {SITE_NAME}</title>
        <meta name="description" content="Expose 99 free US finance calculators to AI agents via MCP, llms.txt, and a JSON REST API. Free, no key, CORS-open." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Developers — AI Agent Tools",
              url: `${SITE_URL}/developers`,
              about: "MCP server, llms.txt, and REST API for 99 US finance calculators",
            }),
          }}
        />
      </Head>

      <main className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span aria-hidden="true">›</span> <span>Developers</span>
        </nav>
        <h1>Developers: give AI agents 99 finance calculators</h1>
        <p className="lead">
          Every calculator on {SITE_NAME} is computable by machines — MCP tools, llms.txt discovery,
          and a CORS-open REST API. Free, no API key.
        </p>

        <div className="card">
          <h2>1. MCP Server (for AI agents)</h2>
          <p>
            Connect Claude Desktop, Cursor, or any MCP-aware agent to{" "}
            <code>{SITE_URL}/api/mcp</code> — all 99 calculators appear as native tools.
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
            Then call any tool:{" "}
            <code>tools/call</code> with <code>{"{\"name\":\"mortgage-calculator\",\"arguments\":{\"amount\":300000,\"rate\":6.5,\"years\":30}}"}</code>
          </p>
        </div>

        <div className="card">
          <h2>2. llms.txt (for agent discovery)</h2>
          <p>
            <a href="/llms.txt">{SITE_URL}/llms.txt</a> follows the{" "}
            <a href="https://llmstxt.org" rel="nofollow noopener">llmstxt.org</a> standard so
            browsing agents can find and cite our tools.
          </p>
        </div>

        <div className="card">
          <h2>3. REST API (for apps)</h2>
          <p>
            Every calculator has a JSON endpoint — no key, CORS-open for any origin:
          </p>
          <pre>{`# Schema
GET  ${SITE_URL}/api/calc/mortgage-calculator

# Compute
POST ${SITE_URL}/api/calc/mortgage-calculator
{"amount": 300000, "rate": 6.5, "years": 30}`}</pre>
          <p>
            Full tool list: <Link href="/tools">all 99 calculators</Link>.
          </p>
        </div>

        <div className="card">
          <h2>Data provenance</h2>
          <p>
            Every result is computed server-side from the same engine as the interactive pages,
            using current federal and state tax tables. See{" "}
            <Link href="/methodology">Methodology &amp; Data Sources</Link>.
          </p>
        </div>

        <AdSlot />
      </main>
    </>
  );
}
