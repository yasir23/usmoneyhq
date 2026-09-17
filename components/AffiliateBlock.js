// @ts-nocheck — plain client component; geo decision passed from server (ToolPageShell).
import { useEffect, useState } from "react";
import { AFFILIATE_OFFERS, AFFILIATE_DISCLOSURE } from "../lib/affiliates";
import { resolveUS } from "../lib/geo";

/**
 * AffiliateBlock — contextual affiliate CTAs shown ONLY to US visitors.
 * Clicks route through /api/go/{offerId} (tracked + redirected).
 *
 * GEO DECISION (fixed 2026-09-17): this used to be `if (!isUS) return null`,
 * trusting only the server prop. Only the dynamic route pages/[tool].js supplies
 * that prop, so on the 111 STATIC tool pages (mortgage-calculator,
 * budget-calculator, retirement-calculator...) isUS was always false and this
 * component rendered nothing for every visitor — the affiliate system earned
 * zero because of a missing prop, not a missing program. Now the server prop is
 * still authoritative, and when it is absent we fall back to the `geo` cookie
 * that middleware.ts sets from Cloudflare's cf-ipcountry, then to a US-only
 * timezone check.
 */
export default function AffiliateBlock({ slug, isUS = false, compact = false }) {
  const [visible, setVisible] = useState(false);
  const [pagePath, setPagePath] = useState("");

  useEffect(() => {
    setPagePath(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    // A server-resolved US is final. Otherwise resolve from the cookie, then tz.
    if (isUS === true) {
      setVisible(true);
      return;
    }
    setVisible(resolveUS(""));
  }, [isUS]);

  if (!visible) return null;

  // Only offers with a REAL tracked link. An untracked link (a plain brand
  // homepage) earns nothing when clicked, so rendering it spends page space and
  // reader trust for zero revenue while making the block LOOK monetized. Today
  // that means one offer (Shopify, via Impact); the finance slots in
  // lib/affiliates.ts switch on the moment a tracked URL is pasted in.
  const offers = AFFILIATE_OFFERS.filter(
    (o) =>
      o.live === true &&
      (!o.tools || o.tools.length === 0 || o.tools.includes(slug))
  ).slice(0, compact ? 2 : 3);

  if (offers.length === 0) return null;

  return (
    <div className="affiliate-block card" style={{ margin: "24px 0", padding: 20, border: "1px solid #e2e2e2", borderRadius: 12, background: "#fbfaf6" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Recommended tools</h2>
        <span style={{ fontSize: 12, color: "#777" }}>Free to use — supports this site</span>
      </div>
      {offers.map((o) => (
        <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid #eee" }}>
          <div>
            <div style={{ fontWeight: 700 }}>{o.name}</div>
            <div style={{ fontSize: 13, color: "#555" }}>{o.blurb}</div>
          </div>
          <a
            href={`/api/go/${o.id}?from=${encodeURIComponent(pagePath || slug)}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            style={{ whiteSpace: "nowrap", background: "#1a3c5e", color: "#fff", padding: "8px 14px", borderRadius: 8, textDecoration: "none", fontSize: 14 }}
          >
            Try it →
          </a>
        </div>
      ))}
      <p style={{ fontSize: 11, color: "#999", marginTop: 10, marginBottom: 0 }}>{AFFILIATE_DISCLOSURE}</p>
    </div>
  );
}
