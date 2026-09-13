// lib/ads.ts — SINGLE SOURCE OF TRUTH for AdSense.
// Publisher ID (AdSense dashboard): pub-2473684818960461
// Ad code uses the ca-pub- prefix with the same numeric ID.
export const ADSENSE_PUB_ID = "ca-pub-2473684818960461";
export const ADSENSE_ACTIVE = !ADSENSE_PUB_ID.includes("XXX");

// ---------------------------------------------------------------------------
// AD UNIT IDS — paste the NUMERIC id of each ad unit here.
//
// AdSense -> Ads -> By ad unit -> Display ads -> Create. The id is the ~10-digit
// number shown on the unit, NOT the unit's name. Create one per page POSITION
// and reuse it across every page — ad units are site-wide resources, not
// per-URL, so four ids cover the whole site.
//
// Leaving these EMPTY is safe and loses nothing: with no numeric id the <ins>
// markup is not rendered at all, and Auto ads (if enabled in the dashboard) fill
// the placements instead.
//
// What DOES lose money — and was live until 2026-09-13 — is shipping a
// non-numeric id. Every slot on the site was rendered as
// data-ad-slot="mortgage-calculator-top" (a slug-derived name). No ad unit has
// that id, so AdSense could never fill a single slot on any of the ~4,845 pages,
// while the markup made them look correctly wired.
export const AD_UNITS: Record<string, string> = {
  top: "",      // below the H1 / TLDR
  mid: "",      // after the calculator
  bottom: "",   // before the related-tools grid
};

/** A real AdSense unit id is numeric. Anything else matches no ad unit. */
export function isRealUnit(id: unknown): boolean {
  return /^\d{6,}$/.test(String(id ?? "").trim());
}

/**
 * Resolve a descriptive slot name to a real ad unit id.
 *
 *   "1234567890"            -> "1234567890"  (already numeric, pass through)
 *   "top"                   -> AD_UNITS.top  (exact key)
 *   "blog-some-post-top"    -> AD_UNITS.top  (trailing position token)
 *
 * Returns "" when unconfigured, which the slot component renders as nothing.
 */
export function resolveAdUnit(id: unknown): string {
  const s = String(id ?? "").trim();
  if (isRealUnit(s)) return s;
  if (isRealUnit(AD_UNITS[s])) return AD_UNITS[s];          // exact key
  const pos = s.split("-").pop() || "";                     // trailing token
  const mapped = AD_UNITS[pos];
  return isRealUnit(mapped) ? mapped : "";
}
