// lib/analytics.ts — Google Analytics 4 measurement scaffold.
// Paste your GA4 measurement ID (G-XXXXXXXXXX) here and set GA4_ACTIVE=true.
// The gtag.js loader in pages/_document.js activates automatically.
// Until then, nothing loads — zero analytics bloat.
export const GA4_ID = "";
export const GA4_ACTIVE = GA4_ID.startsWith("G-");
