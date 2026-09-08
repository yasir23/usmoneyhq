// app/.well-known/agent-card.json/route.ts — A2A Agent Card.
import { NextResponse } from "next/server";

export function GET() {
  const card = {
    name: "US Money HQ Calculators",
    version: "1.0.0",
    description: "Free US financial calculators (105+ tools, 5000+ state/amount pages) computable by AI agents via JSON API and MCP. No key required.",
    url: "https://usmoneyhq.com/developers",
    supportedInterfaces: {
      mcp: {
        url: "https://usmoneyhq.com/api/mcp",
        transport: "streamable-http",
      },
    },
    capabilities: {
      calculate: {
        description: "Run any US financial calculation (mortgage, salary after tax, debt payoff, 401k, etc.) with JSON field values.",
        inputModes: ["text"],
        outputModes: ["text"],
      },
    },
    skills: [
      {
        id: "financial-calculations",
        name: "Financial Calculations",
        description: "Compute mortgage payments, take-home pay, retirement projections, and 100+ other US finance formulas. POST /api/calc/{tool} with field values.",
      },
    ],
  };
  return NextResponse.json(card, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
