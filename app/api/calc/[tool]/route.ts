import { NextRequest, NextResponse } from "next/server";
import { getTool } from "@/lib/tools";

/**
 * Backend API — /api/calc/[tool]
 * GET  -> machine-readable tool schema (fields, defaults, options) for programmatic clients
 * POST -> JSON computation results (server-side math, shared engine with the UI)
 */
export async function GET(_req: NextRequest, { params }: { params: { tool: string } }) {
  const tool = getTool(params.tool);
  if (!tool) return NextResponse.json({ error: "unknown tool" }, { status: 404 });
  return NextResponse.json({
    slug: tool.slug,
    title: tool.title,
    description: tool.description,
    fields: tool.fields.map((f) =>
      f.type === "select"
        ? { key: f.key, label: f.label, type: f.type, options: f.options }
        : { key: f.key, label: f.label, type: f.type, min: f.min, max: f.max, step: f.step }
    ),
  });
}

export async function POST(req: NextRequest, { params }: { params: { tool: string } }) {
  const tool = getTool(params.tool);
  if (!tool) return NextResponse.json({ error: "unknown tool" }, { status: 404 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // treat missing/invalid body as defaults
  }

  const values: Record<string, number | string> = {};
  for (const f of tool.fields) {
    const raw = body[f.key];
    if (f.type === "number") {
      const n = typeof raw === "number" ? raw : Number(raw);
      values[f.key] = Number.isFinite(n) ? n : (f.default as number);
    } else {
      values[f.key] = String(raw ?? f.default);
    }
  }

  const results = tool.compute(values);
  return NextResponse.json({ tool: tool.slug, results, ts: new Date().toISOString() });
}
