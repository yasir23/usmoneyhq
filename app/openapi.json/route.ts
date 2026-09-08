// app/openapi.json/route.ts — minimal OpenAPI for the calculator API.
import { NextResponse } from "next/server";

export function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "US Money HQ Calculators API",
      version: "1.0.0",
      description: "Free US financial calculators as a JSON API. No key, CORS-open. See https://usmoneyhq.com/developers for usage and the MCP endpoint.",
    },
    servers: [{ url: "https://usmoneyhq.com" }],
    paths: {
      "/api/calc/{tool}": {
        get: {
          summary: "Get tool schema (fields, defaults, options)",
          parameters: [{ name: "tool", in: "path", required: true, schema: { type: "string" }, description: "Calculator slug, e.g. mortgage-calculator" }],
          responses: { "200": { description: "Tool schema" } },
        },
        post: {
          summary: "Compute a calculation",
          parameters: [{ name: "tool", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", additionalProperties: true } } } },
          responses: { "200": { description: "Computed rows" } },
        },
      },
      "/api/mcp": {
        post: {
          summary: "MCP server endpoint (JSON-RPC tools/list, tools/call)",
          responses: { "200": { description: "MCP JSON-RPC response" } },
        },
      },
    },
  };
  return NextResponse.json(spec, {
    headers: { "Content-Type": "application/openapi+json; charset=utf-8" },
  });
}
