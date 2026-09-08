// @ts-nocheck — client newsletter capture (US-focused list builder).
import { useState } from "react";

/**
 * NewsletterSignup — captures emails on calculator pages. Renders only for US
 * visitors (server passes isUS like the affiliate block). Small, non-intrusive,
 * one field + submit. Feed the list later with rate alerts / money tips.
 */
export default function NewsletterSignup({ isUS = false, context = "money tips" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");

  if (!isUS) return null;

  async function submit(e) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("sending");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, page: window.location.pathname, source: "calculator-newsletter" }),
      });
      const d = await r.json();
      if (d.ok) setState("done");
      else setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div style={{ background: "#eef7ee", border: "1px solid #cfe6cf", borderRadius: 10, padding: "14px 18px", margin: "16px 0" }}>
        <strong>You're in.</strong> We'll send the occasional money tip — no spam, unsubscribe anytime.
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: "#f6f6f4", border: "1px solid #ddd", borderRadius: 12, padding: "16px 18px", margin: "16px 0" }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Get smarter with money — free</div>
      <div style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>
        Occasional {context}: rate changes, tax deadlines, and calculator updates. No spam.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{ flex: 1, minWidth: 180, padding: "9px 12px", borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button type="submit" disabled={state === "sending"} style={{ background: "#1a3c5e", color: "#fff", border: 0, borderRadius: 8, padding: "9px 18px", cursor: "pointer" }}>
          {state === "sending" ? "..." : "Subscribe"}
        </button>
      </div>
      {state === "error" && <div style={{ fontSize: 12, color: "#a00", marginTop: 6 }}>Something went wrong — try again.</div>}
    </form>
  );
}
