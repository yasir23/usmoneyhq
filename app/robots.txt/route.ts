// app/robots.txt/route.ts — serve robots.txt with Content-Signals + AI rules.
//
// POLICY (two separate decisions, do not conflate them):
//   1. TRAINING  — blocked. We do not want our content in model weights.
//   2. RETRIEVAL — allowed. AI answer engines citing us is distribution, which is
//      the entire point of the llms.txt / MCP / agent-card work on this site.
//
// A crawler that only powers AI *answers* is a citation channel, not a training
// channel. Blocking Claude-SearchBot here previously contradicted this file's own
// stated policy ("index everything, appear in AI answers, do NOT train models")
// and threw away GEO visibility the rest of the agent-readiness suite was built to
// earn. If a bot's purpose is retrieval, it belongs in the ALLOW list below.
import { NextResponse } from "next/server";

export function GET() {
  const body = `# robots.txt — usmoneyhq.com
# Policy: index everything, appear in AI answers, do NOT train models on content.
Content-Signal: ai-train=no, search=yes, ai-input=no

User-agent: *
Allow: /

# ─────────────────────────────────────────────────────────────────────────────
# AI SEARCH / RETRIEVAL crawlers — EXPLICITLY ALLOWED.
# These fetch pages to answer a user's question and cite the source. They are a
# distribution channel, not a training channel. Listed explicitly (not left to the
# wildcard) so an audit can see the decision was deliberate.
# ─────────────────────────────────────────────────────────────────────────────
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# ─────────────────────────────────────────────────────────────────────────────
# AI TRAINING crawlers — BLOCKED.
# ─────────────────────────────────────────────────────────────────────────────
User-agent: GPTBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: PetalBot
Disallow: /

User-agent: cohere-ai
Disallow: /

Sitemap: https://usmoneyhq.com/sitemap.xml
`;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
