import { NextRequest, NextResponse } from "next/server";
import { TOOLS, getTool } from "@/lib/tools";

/**
 * MCP (Model Context Protocol) server — https://usmoneyhq.com/api/mcp
 * Exposes all 99 calculators as native tools for AI agents
 * (Claude Desktop, agent harnesses, anything MCP-aware).
 *
 * Client config:
 *   "mcpServers": { "usmoneyhq": { "url": "https://usmoneyhq.com/api/mcp" } }
 *
 * Protocol: streamable HTTP JSON-RPC (initialize / tools/list / tools/call).
 */

const SERVER_NAME = "usmoneyhq";
const PROTOCOL_VERSION = "2025-06-18";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id",
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    "MCP-Protocol-Version": PROTOCOL_VERSION,
  };
}

function jsonRpc(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function fieldSchema(f: { key: string; label: string; type: string; min?: number; max?: number; step?: number; default?: number | string; options?: { value: string | number; label: string }[] }) {
  if (f.type === "select") {
    return { type: "string", description: f.label, enum: (f.options || []).map((o) => String(o.value)) };
  }
  const s: Record<string, unknown> = { type: "number", description: f.label };
  if (typeof f.min === "number") s.minimum = f.min;
  if (typeof f.max === "number") s.maximum = f.max;
  if (typeof f.step === "number") s.multipleOf = f.step;
  if (f.default !== undefined) s.default = f.default;
  return s;
}

function toolsList() {
  return TOOLS.map((t) => {
    const properties: Record<string, unknown> = {};
    for (const f of t.fields) properties[f.key] = fieldSchema(f);
    return {
      name: t.slug,
      description: t.description || t.title,
      inputSchema: {
        type: "object",
        properties,
        required: t.fields.map((f) => f.key),
      },
    };
  });
}

function formatRows(rows: { label: string; value: unknown }[]) {
  return rows.map((r) => `${r.label}: ${typeof r.value === "number" ? String(r.value) : String(r.value)}`).join("\n");
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  // MCP discovery/health
  return NextResponse.json(
    { server: SERVER_NAME, protocol: PROTOCOL_VERSION, tools: TOOLS.length, endpoint: "https://usmoneyhq.com/api/mcp" },
    { headers: corsHeaders() }
  );
}

export async function POST(req: NextRequest) {
  let msg: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    msg = await req.json();
  } catch {
    return NextResponse.json(jsonRpcError(null, -32700, "Parse error"), { status: 400, headers: corsHeaders() });
  }
  const { id, method, params } = msg;
  if (!method) return NextResponse.json(jsonRpcError(id, -32600, "Invalid Request"), { status: 400, headers: corsHeaders() });

  switch (method) {
    case "initialize": {
      const caps = (params?.capabilities as Record<string, unknown>) || {};
      void caps;
      return NextResponse.json(
        jsonRpc(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: SERVER_NAME, version: "1.0.0" },
          instructions: "US Money HQ calculators: 99 free US finance tools. Each tool takes numeric field arguments and returns computed rows. For state-specific math include the state field where available.",
        }),
        { headers: corsHeaders() }
      );
    }
    case "notifications/initialized":
    case "notifications/cancelled":
      return new NextResponse("", { status: 202, headers: corsHeaders() });

    case "ping":
      return NextResponse.json(jsonRpc(id, {}), { headers: corsHeaders() });

    case "tools/list":
      return NextResponse.json(jsonRpc(id, { tools: toolsList() }), { headers: corsHeaders() });

    case "tools/call": {
      const name = String(params?.name || "");
      const args = (params?.arguments as Record<string, unknown>) || {};
      const tool = getTool(name);
      if (!tool) return NextResponse.json(jsonRpcError(id, -32602, `Unknown tool: ${name}`), { headers: corsHeaders() });
      const values: Record<string, number | string> = {};
      for (const f of tool.fields) {
        const raw = args[f.key];
        if (f.type === "number") {
          const n = typeof raw === "number" ? raw : Number(raw);
          values[f.key] = Number.isFinite(n) ? n : (f.default as number);
        } else {
          values[f.key] = String(raw ?? f.default);
        }
      }
      let rows: { label: string; value: unknown }[] = [];
      let err: string | null = null;
      try {
        rows = tool.compute(values);
      } catch (e) {
        err = String(e);
      }
      if (err) return NextResponse.json(jsonRpcError(id, -32603, `Compute error: ${err}`), { headers: corsHeaders() });
      const text = formatRows(rows) || "No results";
      return NextResponse.json(
        jsonRpc(id, {
          content: [{ type: "text", text }],
          isError: false,
        }),
        { headers: corsHeaders() }
      );
    }

    default:
      return NextResponse.json(jsonRpcError(id, -32601, `Method not found: ${method}`), { headers: corsHeaders() });
  }
}
