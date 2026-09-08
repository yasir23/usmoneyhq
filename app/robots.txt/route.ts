// app/robots.txt/route.ts — serve robots.txt with Content-Signals + AI rules.
import { NextResponse } from "next/server";

export function GET() {
  const body = `# robots.txt — usmoneyhq.com
# Policy: index everything, appear in AI answers, do NOT train models on content.
Content-Signal: ai-train=no, search=yes, ai-input=no

User-agent: *
Allow: /

# AI TRAINING crawlers blocked
User-agent: GPTBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Claude-SearchBot
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
