// lib/geo.js — how a page decides whether to show US-only CTAs.
//
// WHY THIS EXISTS
// AffiliateBlock and NewsletterSignup are gated on `isUS`, which ToolPageShell
// derives from a `country` prop. Only the dynamic route pages/[tool].js supplies
// that prop (it reads cf-ipcountry in getServerSideProps). The 111 STATIC tool
// pages — including mortgage-calculator, budget-calculator and
// retirement-calculator — render <ToolPageShell slug="..." /> with no country, so
// isUS was false for everyone and BOTH components rendered null on every one of
// them. That is why the live pages carry no affiliate links at all: not a missing
// program, a missing prop.
//
// THE FIX
// middleware.ts runs on every page request at the origin and can see
// cf-ipcountry (Cloudflare is in front of usmoneyhq.com). It sets a short-lived
// `geo` cookie, so a static page can learn the visitor's country without adding
// getServerSideProps to 111 files (which would also disable static optimisation).
//
// The decision itself is a PURE function so it can be tested without a browser.

export const US = "US";

/** Normalise any country signal: "us", " US ", undefined -> "US" | "GB" | "". */
export function normalizeCountry(value) {
  return String(value || "").trim().toUpperCase().slice(0, 2);
}

/** Read the geo cookie the middleware sets. Safe on the server (no document). */
export function readGeoCookie() {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)geo=([^;]+)/);
  return m ? normalizeCountry(decodeURIComponent(m[1])) : "";
}

/**
 * Should US-only CTAs render?
 *
 * Precedence:
 *   1. a country the server resolved (authoritative — Cloudflare edge data)
 *   2. the geo cookie the middleware set (same data, for static pages)
 *   3. timezone, ONLY when nothing above exists (e.g. no Cloudflare in front)
 *
 * An explicit non-US country from 1 or 2 is FINAL — we do not fall through to the
 * timezone guess, because a real country signal is better than a heuristic.
 */
export function shouldShowUS(serverCountry, cookieCountry, timeZone) {
  const server = normalizeCountry(serverCountry);
  if (server) return server === US;

  const cookie = normalizeCountry(cookieCountry);
  if (cookie) return cookie === US;

  if (!timeZone) return false;
  // Fallback only. US zones only — deliberately excluding America/Toronto,
  // Vancouver, Mexico_City etc. so a heuristic cannot show US offers to Canada.
  return /^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Juneau|Honolulu|Indiana|Kentucky|North_Dakota|Adak|Sitka|Yakutat|Nome|Sitka|Metlakatla)$/.test(
    timeZone
  );
}

/** Convenience for client components: resolve once, from the best signal available. */
export function resolveUS(serverCountry) {
  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    tz = "";
  }
  return shouldShowUS(serverCountry, readGeoCookie(), tz);
}
