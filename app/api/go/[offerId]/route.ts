// app/api/go/[offerId]/route.ts — affiliate click tracker + redirect.
// Logs every affiliate click (offer, page, timestamp) then 302s to the real
// affiliate URL. Enables per-offer/per-page RPM measurement (the KPI system).
import { NextRequest, NextResponse } from "next/server";
import { AFFILIATE_OFFERS } from "@/lib/affiliates";
import fs from "fs";
import path from "path";

const LOG_PATH = process.env.AFFILIATE_LOG || "/tmp/affiliate_clicks.jsonl";

export async function GET(req: NextRequest, { params }: { params: { offerId: string } }) {
  const offer = AFFILIATE_OFFERS.find((o) => o.id === params.offerId);
  if (!offer) return NextResponse.redirect("https://usmoneyhq.com/", 302);

  // Log the click: offer, referrer page, country, UA-ish (no PII beyond country)
  try {
    const row = {
      t: new Date().toISOString(),
      offer: offer.id,
      program: offer.program,
      page: req.nextUrl.searchParams.get("from") || (req.headers.get("referer") || "").slice(0, 200),
      country: (req.headers.get("cf-ipcountry") || "").toString(),
      ua: (req.headers.get("user-agent") || "unknown").slice(0, 80),
    };
    fs.appendFileSync(LOG_PATH, JSON.stringify(row) + "\n");
  } catch {
    // never break the redirect on a logging error
  }

  return NextResponse.redirect(offer.href, 302);
}
