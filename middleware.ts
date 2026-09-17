// middleware.ts — two jobs, both per-request at the origin.
//
// 1. CONTENT NEGOTIATION for agents: if a client sends Accept: text/markdown,
//    serve the markdown representation (llms.txt) instead of HTML. Browsers
//    (Accept: text/html) are unaffected.
//
// 2. GEO PASSTHROUGH for US-only CTAs. Cloudflare sits in front of this site and
//    sets cf-ipcountry on every request, but only the dynamic route
//    pages/[tool].js was reading it (in getServerSideProps). The 111 static tool
//    pages cannot read request headers, so `isUS` was false for every visitor and
//    the affiliate block and newsletter rendered nothing on all of them.
//    Copying the country into a short-lived `geo` cookie lets those static pages
//    decide, without adding getServerSideProps to 111 files (which would also
//    disable static optimisation). The cookie is NOT httpOnly on purpose: the
//    client components read it. It carries a two-letter country code and nothing
//    else — no identifier, nothing personal.
import { NextRequest, NextResponse } from "next/server";

const MARKDOWN_TOOLS = {
  // tool slug -> markdown endpoint (llms.txt fragments)
  "mortgage-calculator": "/llms.txt",
  "salary-after-tax-calculator": "/llms.txt",
  "developers": "/llms.txt",
};

const GEO_COOKIE = "geo";
const GEO_MAX_AGE = 3600; // 1 hour; refreshed on the next request

function attachGeo(req: NextRequest, res: NextResponse) {
  const cc = String(req.headers.get("cf-ipcountry") || "")
    .trim()
    .toUpperCase()
    .slice(0, 2);
  // "XX" is what Cloudflare sends when it cannot determine the country; "" means
  // no Cloudflare in front. Neither is a country, so store nothing and let the
  // client fall back rather than recording a false negative.
  if (cc && cc !== "XX" && /^[A-Z]{2}$/.test(cc)) {
    res.cookies.set(GEO_COOKIE, cc, {
      path: "/",
      maxAge: GEO_MAX_AGE,
      sameSite: "lax",
      secure: true,
    });
  }
  return res;
}

export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  const wantsMarkdown =
    accept.includes("text/markdown") || accept.includes("text/x-markdown");
  const url = req.nextUrl.pathname;

  // Only negotiate for GET page requests, not assets/APIs
  if (!wantsMarkdown || req.method !== "GET") {
    return attachGeo(req, NextResponse.next());
  }
  if (
    url.startsWith("/_next") ||
    url.startsWith("/api") ||
    url.startsWith("/ads") ||
    url.startsWith("/images")
  ) {
    return attachGeo(req, NextResponse.next());
  }

  // Serve llms.txt (the canonical markdown manifest) for any page when an
  // agent explicitly wants markdown — this is the Markdown-for-Agents pattern.
  const mdUrl = new URL("/llms.txt", req.url);
  return attachGeo(req, NextResponse.rewrite(mdUrl));
}

export const config = {
  matcher: ["/((?!_next/static|ads/|images/).*)"],
};
