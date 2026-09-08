// app/api/subscribe/route.ts — newsletter email capture (US-focused list).
// Appends to a JSONL file; safe for the VPS. Use for money-tips / rate alerts.
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

const LIST_PATH = process.env.SUBSCRIBE_LOG || "/tmp/usmoneyhq_subscribers.jsonl";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/i;
const DISPOSABLE = ["mailinator.com", "guerrillamail.com", "10minutemail.com", "yopmail.com", "temp-mail.org", "throwawaymail.com"];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const email = String(body.email || "").trim().toLowerCase();
  const page = String(body.page || "").slice(0, 200);
  const country = (req.headers.get("cf-ipcountry") || "").toString().toUpperCase();

  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  const domain = email.split("@")[1];
  if (DISPOSABLE.includes(domain)) return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });

  try {
    const row = {
      t: new Date().toISOString(),
      email,
      page,
      country,
      source: body.source || "calculator",
    };
    fs.appendFileSync(LIST_PATH, JSON.stringify(row) + "\n");
  } catch {
    return NextResponse.json({ ok: false, error: "storage" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
