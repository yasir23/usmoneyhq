// middleware.ts — content negotiation for agents.
// If an agent sends Accept: text/markdown, serve the markdown representation
// of pages that have one (llms.txt content per tool); otherwise let Next
// handle normally. Browsers (Accept: text/html) are unaffected.
import { NextRequest, NextResponse } from "next/server";

const MARKDOWN_TOOLS = {
  // tool slug -> markdown endpoint (llms.txt fragments)
  "mortgage-calculator": "/llms.txt",
  "salary-after-tax-calculator": "/llms.txt",
  "developers": "/llms.txt",
};

export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  const wantsMarkdown = accept.includes("text/markdown") || accept.includes("text/x-markdown");
  const url = req.nextUrl.pathname;

  // Only negotiate for GET page requests, not assets/APIs
  if (!wantsMarkdown || req.method !== "GET") {
    return NextResponse.next();
  }
  if (url.startsWith("/_next") || url.startsWith("/api") || url.startsWith("/ads") || url.startsWith("/images")) {
    return NextResponse.next();
  }

  // Serve llms.txt (the canonical markdown manifest) for any page when an
  // agent explicitly wants markdown — this is the Markdown-for-Agents pattern.
  const mdUrl = new URL("/llms.txt", req.url);
  return NextResponse.rewrite(mdUrl);
}

export const config = {
  matcher: ["/((?!_next/static|ads/|images/).*)"],
};
