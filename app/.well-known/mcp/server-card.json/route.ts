// app/.well-known/mcp/server-card.json/route.ts — MCP Server Card (SEP-1649).
import { NextResponse } from "next/server";

export function GET() {
  const card = {
    serverInfo: {
      name: "usmoneyhq-calculators",
      version: "1.0.0",
    },
    transports: [
      { type: "streamable-http", endpoint: "https://usmoneyhq.com/api/mcp" },
    ],
    capabilities: {
      tools: {
        listChanged: false,
        // all 105+ calculators exposed as tools (dynamic registry)
        count: 105,
      },
      resources: {
        listChanged: false,
      },
      prompts: {
        listChanged: false,
      },
    },
  };
  return NextResponse.json(card, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
