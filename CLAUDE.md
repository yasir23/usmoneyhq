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

## Permanent invariants (added 2026-11-27)

Shared across the four sites; each one has already cost real damage when broken.
Site-specific rules above still take precedence where they overlap.

### Cloudflare

- KV namespace `LEADS` = `c4a271e9b204464c878b6051d5a30109`
- KV namespace `BOOKINGS` = `1c6af436d13344de98f711959a279725`
- KV `GET .../values/{key}` returns RAW BYTES. There is no `{"result": ...}`
  wrapper — that envelope exists only on `/keys`. Parsing it silently yields ""
  for every record.
- A Worker route must end in a wildcard (`/api/paid*`). A bare pattern is matched
  against the full URL including the query string, so `/api/paid?plan=x` misses
  `/api/paid`. A `www.` host needs no separate zone — the route lives on the apex
  zone and may target its subdomains.

### Full-file guards (before any verdict on a downloaded file)

A partial download produces phantom schema errors that look exactly like real
defects. Sixteen false pitches came from this. Before hashing or validating:

1. delete the temp file BEFORE `curl` runs (never reuse last iteration's file)
2. require `http_status == "200"`
3. require `_got > 1000` bytes
4. require `downloaded_bytes >= Content-Length * 0.99`
5. take the metadata host from the `mrf-url` in the record, never from the
   contact's email domain

### Sending

ALL email goes through `~/hermes-outreach/ses_send.py`. Never ad-hoc send
scripts. It enforces the 4-source suppression list (archive, unsubscribed,
bounces, complaints), intra-queue dedupe, queue stamps that prevent a re-run from
double-sending, and `--dry-run` before every `--send`.

### Language

100% American English: license, advisor, personalized, unrecognized,
organization, fulfillment, artifact, analyze. Beware plurals — `\badviser\b` does
not match "advisers". Grep the stem. A `pre-push` hook in this repo enforces it.

### Workers and HTML

Plain string concatenation only. No nested template literals, and JavaScript does
not concatenate adjacent string literals across lines — a wrapped literal is a
syntax error, not a continuation.

Self-checks must send `-A "curl/8.7.1"` so the bot filter ignores them and
`view:*` telemetry keys stay clean.

### Honesty gates

- A conformance defect must come from the official validator or a dead link.
  Data completeness is not a conformance defect.
- Never accuse on a client-side failure (DNS, TLS, WAF 403 are inconclusive).
- Never invent a number, a vendor, or a contact. If it was not measured, say so.
- A payment signal that is not signature-verified is not revenue. Unverified
  webhooks are quarantined under `whop_rejected:*`, never `paid:*`.
