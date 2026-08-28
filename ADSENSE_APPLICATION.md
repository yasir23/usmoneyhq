# AdSense Application Package — US Money HQ
Prepared: Aug 2026. Site: usmoneyhq.com — 30 calculators + 250 state pages + 4 policy pages + widgets.
Publisher ID: pub-2473684818960461 (wired in lib/ads.ts as ca-pub-2473684818960461, ads.txt live).
Status: account OPEN, site "Requires review" — waiting on Google review + GSC ownership verification.

## 1. Pre-application checklist (all DONE in code)
- [x] 30 tool pages + 250 state-variant pages, each with unique <title>, meta description, canonical, JSON-LD (WebApplication + FAQPage + BreadcrumbList)
- [x] About page — /about
- [x] Contact page with working email — /contact (hello@usmoneyhq.com)
- [x] Privacy Policy with cookies + Google Ads disclosure — /privacy-policy
- [x] Terms of Use with financial-advice disclaimer — /terms
- [x] Sitewide footer linking all policy pages
- [x] Sitemap.xml (291 URLs) + robots.txt
- [x] Original content per page: intro, FAQ, state facts (state pages have real data, not thin)
- [x] No sign-up, no data collection (calculators run server-side via API)
- [x] Ad slots wired: lib/ads.ts (single source of truth) + auto-activating AdSlot (CLS-safe min-height)

## 2. Steps to go live with AdSense
1. APPLY first: go to https://adsense.google.com, sign in with any Google account you control, add site https://usmoneyhq.com, submit. Review takes 1-2 weeks. DO NOT wait for approval to do step 2.
2. Submit sitemap to Google Search Console + request indexing of homepage and 10 key tools (GSC → sitemaps → https://usmoneyhq.com/sitemap.xml).
3. When AdSense approves, copy your Publisher ID (adsense.google.com → Account → Account information → Publisher ID, format ca-pub-1234567890).
4. TELL ME THE PUBLISHER ID. I swap ONE value in lib/ads.ts, add ads.txt (google.com, ca-pub-..., DIRECT, f08c47fec0942fa0), git push. Loader + every ad unit activate automatically — no other code changes.

## 3. Approval risk checklist (what Google checks)
- Site loads fast (static prerendered + SSR, ~80KB JS, no images) — PASS
- Original, useful content (unique copy per page; state pages data-rich) — PASS
- Clear site identity (About, Contact, brand header/footer) — PASS
- Policy pages complete and linked — PASS
- No adult/illegal/copyrighted content — PASS
- Site has real traffic (apply after some traffic exists; GSC indexing helps)

## 4. After approval
1. Ads live automatically after the pub-id swap (step 2.4).
2. At 10K sessions/mo: apply Ezoic/Setupad/Journey (+30-150% RPM).
3. At 50K sessions/mo: Mediavine; at 100K pageviews: Raptive.
4. Revenue math (US, finance tools): 100K visits ≈ $1-3K/mo AdSense; 500K ≈ $5-15K/mo; 1M ≈ $10-30K/mo.
5. Then layer: comparison pages + affiliate (mortgage leads $15-100) + YouTube distribution.

## 5. Files
- /Users/ambusiness/us-calc-tools/lib/ads.ts <- SINGLE source of truth for pub-id (edit here)
- /Users/ambusiness/us-calc-tools/components/AdSlot.js <- ad unit (auto-activates)
- /Users/ambusiness/us-calc-tools/pages/_document.js <- AdSense loader (auto-activates)
- /Users/ambusiness/us-calc-tools/lib/tools.ts <- SITE_URL + tool registry
