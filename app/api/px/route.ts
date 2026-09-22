// app/api/px/route.ts — first-party pageview + conversion beacon.
//
// WHY THIS EXISTS
// GA4 is unwired (lib/analytics.ts has GA4_ID = ""), so the site has NO pageview
// measurement at all. The strategy requires sessions, landing pages, source and
// conversions before any optimisation decision is meaningful — you cannot run a
// weekly cycle on no data. Cloudflare Web Analytics is the richer free option
// and needs no code; this is the piece that works the moment it deploys, with
// no account action and no third party.
//
// SAME DURABILITY CONTRACT as /api/go: always one structured stdout line, which
// Cloudflare Workers Logs and Logpush capture with no new infrastructure. If
// ANALYTICS_LOG_URL is set, the row is POSTed there too for durable storage.
//
// PRIVACY — deliberately minimal, and this is a constraint, not an oversight:
//   * no cookies are set or read
//   * no IP address is stored (country comes from Cloudflare's cf-ipcountry,
//     which is already resolved at the edge)
//   * no persistent visitor id — distinctness is NOT measurable here, so do not
//     read these rows as unique users
//   * the path is truncated and the referrer is reduced to its host
// If you later need unique-visitor counts, that is a deliberate decision with a
// privacy disclosure attached, not something to smuggle in here.

import { NextRequest, NextResponse } from "next/server";

const SINK_TIMEOUT_MS = 1500;
/** Pages arrive from the browser, so treat every field as untrusted input. */
const MAX_PATH = 200;
const MAX_FIELD = 80;

function clean(value: unknown, max = MAX_FIELD): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, max);
}

/** Referrer reduced to host only — never the full URL, which can leak query data. */
function referrerHost(value: string): string {
  try {
    return new URL(value).host.slice(0, MAX_FIELD);
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // An unparseable beacon is not worth a 400 round trip in a browser's
    // critical path; record that it happened and move on.
    console.log("px_bad_payload " + JSON.stringify({ h: req.headers.get("host") }));
    return new NextResponse(null, { status: 204 });
  }

  const row = {
    t: new Date().toISOString(),
    kind: clean(body.kind) || "pageview",        // pageview | view | outbound
    path: clean(body.path, MAX_PATH),
    ref: referrerHost(clean(body.ref, 400)),
    country: clean(req.headers.get("cf-ipcountry")),
    // Coarse device class only — no fingerprinting, no full UA stored.
    device: /Mobi|Android|iPhone/i.test(req.headers.get("user-agent") || "")
      ? "mobile"
      : "desktop",
    ...(body.event ? { event: clean(body.event) } : {}),
  };

  // Record of last resort. Never silent.
  console.log("px " + JSON.stringify(row));

  const sink = process.env.ANALYTICS_LOG_URL;
  if (sink) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SINK_TIMEOUT_MS);
    try {
      await fetch(sink, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(row),
        signal: controller.signal,
      });
    } catch (error) {
      console.log("px_sink_failed " + JSON.stringify({ error: String(error).slice(0, 120) }));
    } finally {
      clearTimeout(timer);
    }
  }

  return new NextResponse(null, { status: 204 });
}

/** A GET here is a human poking at the endpoint, not a beacon. */
export async function GET() {
  return NextResponse.json(
    { ok: true, accepts: "POST", fields: ["kind", "path", "ref", "event"] },
    { status: 200 }
  );
}
