// @ts-nocheck — plain client component; geo decision passed from server (ToolPageShell).
import { useEffect, useState } from "react";
import { AFFILIATE_OFFERS, AFFILIATE_DISCLOSURE } from "../lib/affiliates";

/**
 * AffiliateBlock — contextual affiliate CTAs shown ONLY to US visitors.
 * Receives `isUS` from the server render (getServerSideProps / SSR passes
 * the Cloudflare country header). If the client-side check disagrees
 * (e.g. VPN), it still hides for non-US — safe default is OFF.
 */
export default function AffiliateBlock({ slug, isUS = false, compact = false }) {
  const [visible, setVisible] = useState(isUS);

  useEffect(() => {
    // server said not US -> never show. server said US -> also re-check via
    // timezone as a cheap client heuristic (no external call needed)
    if (!isUS) {
      setVisible(false);
      return;
    }
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const usTz = /^(America|US|Pacific\/Honolulu|Pacific\/Pago_Pago|Pacific\/Adak|Pacific\/Guam|Pacific\/Saipan)/.test(tz);
      setVisible(usTz);
    } catch {
      setVisible(true); // can't detect -> trust server
    }
  }, [isUS]);

  if (!visible) return null;

  const offers = AFFILIATE_OFFERS.filter(
    (o) => !o.tools || o.tools.length === 0 || o.tools.includes(slug)
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
          <a href={o.href} target="_blank" rel="nofollow sponsored noopener" style={{ whiteSpace: "nowrap", background: "#1a3c5e", color: "#fff", padding: "8px 14px", borderRadius: 8, textDecoration: "none", fontSize: 14 }}>
            Try it →
          </a>
        </div>
      ))}
      <p style={{ fontSize: 11, color: "#999", marginTop: 10, marginBottom: 0 }}>{AFFILIATE_DISCLOSURE}</p>
    </div>
  );
}
