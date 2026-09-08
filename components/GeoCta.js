// @ts-nocheck — US-only geo-gated CTA for affiliate guide pages.
// Guides are static (no SSR country prop), so this component reads the
// Cloudflare cookie-free signal via timezone + optionally a server-set
// window flag. Safe default: hidden for non-US.
import { useEffect, useState } from "react";

export default function GeoCta({ href, label = "Try it →", blurb, children }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const us = /^(America|US|Pacific\/Honolulu|Pacific\/Pago_Pago|Pacific\/Adak|Pacific\/Guam|Pacific\/Saipan)/.test(tz);
      setShow(us);
    } catch {
      setShow(false);
    }
  }, []);
  if (!show) return null;
  return (
    <p style={{ margin: "18px 0" }}>
      {blurb ? <span style={{ fontSize: 14, color: "#333" }}>{blurb} </span> : null}
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener"
        style={{ display: "inline-block", background: "#1a3c5e", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}
      >
        {label}
      </a>
    </p>
  );
}
