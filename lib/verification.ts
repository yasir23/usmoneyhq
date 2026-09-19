// lib/verification.ts — Google Search Console / AdSense site-verification hooks.
//
// ⚠️ USMONEYHQ.COM IS ALREADY VERIFIED — DO NOT PASTE A TOKEN HERE (checked 2026-09-19).
// Verification is done by a DNS TXT record instead, which is the stronger method because
// it covers the whole DOMAIN (all subdomains, http and https) rather than one URL prefix:
//
//   google-site-verification=kjsRW9Cr8vaZ0eAyQtP5xl7cxKRxiewUFhuid80Eprg
//
// This constant is therefore INTENTIONALLY EMPTY. Setting it would add a redundant meta
// tag, not fix anything. An earlier comment here claimed that filling it would clear
// AdSense's "Not found" status — that is wrong, and acting on it wastes a cycle.
//
// The two hooks below are kept for a domain that is NOT yet verified this way. If you do
// need them: GSC -> Add property -> URL prefix (https://<domain>/) -> HTML tag method
// gives <meta name="google-site-verification" content="TOKEN" />. Paste only the TOKEN.
//
// AdSense "Not found" has other causes — check there first:
//   1. does the pub id in lib/ads.ts (pub-2473684818960461) belong to the AdSense account
//      you are looking at? A code belonging to a DIFFERENT account reads as "not found"
//   2. ads.txt is live and correct (verified), so it is not the ads.txt column
export const GOOGLE_SITE_VERIFICATION = "";
