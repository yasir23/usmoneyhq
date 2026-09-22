// app/api/go/[offerId]/route.ts — affiliate click tracker + redirect.
//
// DURABILITY — CORRECTED 2026-09-22
// This route used to write `fs.appendFileSync("/data/affiliate_clicks.jsonl")`
// inside a bare `catch {}`. The site is served from Cloudflare's edge
// (`cf-cache-status: DYNAMIC`, `server: cloudflare`, no wrangler.toml, no KV
// binding), where there is no persistent filesystem. So the write either threw
// and was swallowed, or landed on an ephemeral per-instance path discarded at
// the next cold start. In both cases NO click was durably recorded, while the
// header comment above it claimed "Logs every affiliate click".
//
// That is the worst shape a measurement bug can take: the dashboard looks
// wired, the redirect works, and the data is empty. Any per-page RPM number
// derived from this log would have been derived from nothing.
//
// Now there are two independent sinks and neither can silently no-op:
//   1. ALWAYS a single structured "affiliate_click " line to stdout. Cloudflare
//      Workers Logs and Logpush capture this with zero new infrastructure.
//   2. If AFFILIATE_LOG_URL is set, the same row is POSTed there for durable
//      storage — a Worker + KV, a D1 table, or any collector that takes JSON.
//      Delivery is awaited with a hard timeout so a slow sink cannot delay the
//      user's redirect, and a failure is logged rather than swallowed.
//
// ATTRIBUTION
// The outbound URL now carries a per-PAGE subId. Previously every page emitted
// the identical `?subId1=usmoneyhq-web`, so the network's own reporting could
// not break a click down by page — only the (broken) local log could. Now the
// page is reported by the network too, which is what makes per-page RPM
// measurable from the affiliate dashboard as well as locally.

import { NextRequest, NextResponse } from "next/server";
import { AFFILIATE_OFFERS } from "@/lib/affiliates";

/** Impact accepts subId1..subId5. subId1 is the channel; subId2 is the page. */
const PAGE_SUBID_PARAM = "subId2";
/** A slow collector must never hold up a user's redirect. */
const SINK_TIMEOUT_MS = 1500;

/** "/mortgage-calculator/new-york-new-york?x=1" -> "mortgage-calculator-new-york-new-york" */
function pageSlug(value: string): string {
  return (
    value
      .split("?")[0]
      .split("/")
      .filter(Boolean)
      .join("-")
      .replace(/[^a-zA-Z0-9-]/g, "")
      .slice(0, 64) || "home"
  );
}

/** Add the page subId to the tracked URL. Returns the href unchanged if unparseable. */
function withPageSubId(href: string, page: string): string {
  try {
    const url = new URL(href);
    url.searchParams.set(PAGE_SUBID_PARAM, pageSlug(page));
    return url.toString();
  } catch {
    return href;
  }
}

export async function GET(req: NextRequest, { params }: { params: { offerId: string } }) {
  const offer = AFFILIATE_OFFERS.find((o) => o.id === params.offerId);
  // An unknown offer id is bad input, not a reason to 500 in front of a reader.
  if (!offer) return NextResponse.redirect("https://usmoneyhq.com/", 302);

  const rawFrom = req.nextUrl.searchParams.get("from");
  const page = (rawFrom || req.headers.get("referer") || "").slice(0, 200) || "unknown";
  const slug = pageSlug(page);

  const row = {
    t: new Date().toISOString(),
    offer: offer.id,
    program: offer.program,
    page: slug,
    placement: req.nextUrl.searchParams.get("slot") || "block",
    country: (req.headers.get("cf-ipcountry") || "").toString(),
    // user-agent is kept coarse and truncated: enough to tell a bot from a
    // reader, not enough to fingerprint one.
    ua: (req.headers.get("user-agent") || "unknown").slice(0, 80),
    live: offer.live === true,
  };

  // 1. Always emit. This line is the record of last resort.
  console.log("affiliate_click " + JSON.stringify(row));

  // 2. Durable sink, if one is configured.
  const sink = process.env.AFFILIATE_LOG_URL;
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
      // Say so — a swallowed sink failure is how this bug survived the first time.
      console.log(
        "affiliate_click_sink_failed " +
          JSON.stringify({ offer: offer.id, sink, error: String(error).slice(0, 120) })
      );
    } finally {
      clearTimeout(timer);
    }
  }

  return NextResponse.redirect(withPageSubId(offer.href, page), 302);
}
