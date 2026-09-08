// app/auth.md/route.ts — Auth.md agent registration discovery.
import { NextResponse } from "next/server";

export function GET() {
  const md = `# US Money HQ auth.md

This service exposes free US financial calculators to AI agents and developers.

## Agent audience

- LLM agents and automation tools that need finance math (mortgage, tax,
  retirement, debt, 100+ calculators).
- No API key is required. The public API is anonymous and rate-unrestricted
  for reasonable use.

## Access methods

### 1. REST API (no auth)

- Schema: \`GET https://usmoneyhq.com/api/calc/{tool}\`
- Compute: \`POST https://usmoneyhq.com/api/calc/{tool}\` with JSON field values
- CORS-open. No registration, no credentials.

### 2. MCP server (no auth)

- Endpoint: \`https://usmoneyhq.com/api/mcp\` (streamable HTTP, JSON-RPC)
- All calculators exposed as tools via tools/list and tools/call.

### 3. llms.txt discovery

- \`https://usmoneyhq.com/llms.txt\` lists calculators, scenario pages, and guides.

## Registration / provisioning

None required for anonymous public access.

If you operate a high-volume agent service and expect >100k calls/day,
contact us (see /contact) for fair-use coordination.

## Credential use

No credentials are issued. Requests are anonymous. Please identify your
service with a descriptive User-Agent.
`;
  return new NextResponse(md, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
