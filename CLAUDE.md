# us-calc-tools (usmoneyhq.com)

Registry-driven calculator site. 105 tools in `pages/`, tool metadata in
`lib/tools.ts`, URLs derived from `TOOLS`.

## The check

`npm run build` is the gate. It is not just a compile — it runs, in order:
adsense_verify, claims_verify, verify_guides, `next build`, verify_static_schema,
verify_llms_txt. A change is not done until that exits 0. For a fast loop while
editing, `npx tsc --noEmit`.

## What you cannot learn by reading this repo

**A push is a production deploy.** `git push origin master` triggers GitHub
Actions, which builds, hard-gates on live 200 + ads.txt, then submits the sitemap
to IndexNow. There is no staging environment. Never push to "see if it works".

**The site earns nothing right now, on purpose.** AdSense rejected it on
2026-09-26 for "low value content" — 84% of the 916 URLs then submitted were
permutations. `AD_UNITS` in `lib/ads.ts` holds empty strings, so no ad slot
renders on any page. An appeal is pending. Do not add pages that would look like
the thing that got it rejected.

**The variant layer is dormant by measurement, not by accident.** ~2,900 URLs
(sate/metro/comparison/amount families) sit behind `VARIANT_PAGES_INDEXED` and
`METRO_VARIANTS_INDEXED` in `lib/indexing.ts`. They are off because siblings
measured 83–99.6% identical with zero unique numbers. A family is switched on only
after `scripts/measure_uniqueness.py` shows per-page UNIQUE NUMBERS. Flipping a
flag is one line; un-rejecting the account is months.

## Data rules that are not negotiable

Every published figure must be derived by the engine at build time. No hand-typed
numbers in JSX, no illustrative examples that were not computed. If a number
cannot be derived, the page does not ship with it.

Refused permanently, with reasons, in the operator's skill notes:
bank routing/ABA/SWIFT directories (identifiers that move money, no authoritative
source on this machine), Google Indexing API for general pages (JobPosting and
BroadcastEvent only — it returns 200 and indexes nothing), invented author
bylines, and paid traffic arbitrage while RPM is undefined.

## Deploy mechanics worth knowing

A GitHub Actions run failing at `ssh: connect to host ... port 22: Connection
timed out` is a transient VPS blip. `gh run rerun <id> --failed` is the correct
first move — it has gone green on rerun while the site served 200 throughout. Do
not start an infrastructure investigation until a rerun also fails.
