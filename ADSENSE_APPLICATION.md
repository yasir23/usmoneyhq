# AdSense Application Package — US Calc Tools
Prepared: Aug 2026. Site has 25 calculators + 4 policy pages. Ready for approval once deployed.

## 1. Pre-application checklist (all DONE in code)
- [x] 25 unique tool pages, each with: unique <title>, meta description, canonical, JSON-LD (WebApplication + FAQPage + BreadcrumbList)
- [x] About page (who we are, what we do, standards) — /about
- [x] Contact page with working email — /contact (email: hello@uscalctools.com)
- [x] Privacy Policy with cookies + Google Ads disclosure — /privacy-policy
- [x] Terms of Use with financial-advice disclaimer — /terms
- [x] Sitewide footer linking all policy pages (internal links)
- [x] Sitemap.xml (30 URLs) + robots.txt
- [x] Original content: each tool has an intro, FAQ, and how-to section
- [x] No sign-up, no data collection (calculators run client-side)
- [x] Ad placeholders (CLS-safe min-height) ready — CA-xxx placeholder in pages/_document.js + components/AdSlot.tsx

## 2. Steps after deployment
1. DEPLOY the site (deploy.sh). Do NOT apply before the site is publicly reachable.
2. Verify live: https://tools.nayaflow.com (or uscalctools.com) loads all pages, no 404s, no broken links.
3. Set the REAL domain in lib/tools.ts (SITE_URL) — currently https://uscalctools.com placeholder.
4. Swap the AdSense publisher ID: replace `ca-pub-XXXXXXXXXXXXXXXX` in:
   - pages/_document.js (adsbygoogle script)
   - components/AdSlot.tsx (data-ad-client comment)
5. Submit sitemap to Google Search Console (GSC) + request indexing of homepage and 5 key tools.
6. Apply at https://adsense.google.com with the live URL.
7. Google review typically 1-2 weeks (faster with policy pages + clean design + traffic).

## 3. Approval risk checklist (what Google checks)
- Site loads fast (static prerendered, ~80KB JS, no images) — PASS
- Content is original and useful (each calculator has unique copy) — PASS
- Clear site identity (About, Contact, brand in header/footer) — PASS
- Policy pages complete and linked — PASS
- No adult/illegal/copyrighted content — PASS
- Site has real traffic (apply AFTER some traffic exists; Search Console indexing helps)

## 4. After approval
1. Replace CA-xxx with the real pub-id (done above) — ad units go live automatically.
2. AdSense → at 10K sessions/mo apply Ezoic/Setupad/Journey (+30-150% RPM)
3. At 50K sessions/mo → Mediavine; at 100K pageviews → Raptive.
4. Revenue math (US, finance tools): 100K visits ≈ $1-3K/mo AdSense; 500K ≈ $5-15K/mo; 1M ≈ $10-30K/mo.
5. Then layer: comparison pages + affiliate (mortgage leads $15-100) + YouTube distribution.

## 5. Files
- /Users/ambusiness/us-calc-tools/pages/_document.js  <- AdSense script + pub-id
- /Users/ambusiness/us-calc-tools/components/AdSlot.tsx <- ad unit placeholders
- /Users/ambusiness/us-calc-tools/lib/tools.ts <- SITE_URL + tool registry
- /Users/ambusiness/us-calc-tools/deploy.sh <- deployment
