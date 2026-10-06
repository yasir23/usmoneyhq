// lib/analytics.ts — Google Analytics 4 measurement configuration.
//
// The gtag.js loader in pages/_document.js reads this file. GA4_ACTIVE is
// DERIVED from the ID rather than set alongside it: an ID and a separate
// boolean can disagree, and the failure mode of that disagreement is a switch
// that reads "active" while nothing loads. One source of truth, no second flag.
//
// CONNECTED 2026-10-06 with measurement ID G-9RQVWQHX9Y. Until this line held a
// value the loader rendered nothing, so the site had first-party pageviews
// (/api/px) but no source, geography or engagement reporting — which is why the
// 100,925 Cloudflare pageviews could not be attributed to anything. GA4's own
// onboarding screen reported "No data received from your website yet" for the
// same reason: there was no tag to receive it.
//
// The tag enables anonymize_ip. pages/privacy-policy.js carries the matching
// disclosure, and a tag without that disclosure would be a claim drifting from
// the code.
//
// Verified live by crawl_layer_watch.py, which asserts this ID appears in the
// served homepage HTML — a tag that silently stops rendering is otherwise
// indistinguishable from a site with no traffic.
export const GA4_ID = "G-9RQVWQHX9Y";
export const GA4_ACTIVE = GA4_ID.startsWith("G-");
