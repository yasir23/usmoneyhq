// lib/ads.ts — SINGLE SOURCE OF TRUTH for AdSense.
// To go live: replace the X's in ADSENSE_PUB_ID with your real publisher ID
// (from adsense.google.com → Account → Account information → Publisher ID),
// then git push. The loader script and every ad unit activate automatically.
export const ADSENSE_PUB_ID = "ca-pub-XXXXXXXXXXXXXXXX";
export const ADSENSE_ACTIVE = !ADSENSE_PUB_ID.includes("XXX");
