#!/usr/bin/env python3
"""
site_integrity_heartbeat.py — recurring content-integrity audit for the revenue sites.

WHY THIS EXISTS
---------------
site_uptime_watch.sh answers "is the site up". site_digest.sh answers "how many
URLs and did the deploy pass". Neither answers the question that actually cost
us an AdSense review: does the site DO what each page PROMISES, and does its
own inventory description match reality.

Every check below is a defect class that was found by a human audit and would
have been caught here first:

  1. UNSUPPORTED_CLAIM   a page states a figure the code does not compute
                         (e.g. "5% flat national estimate" on a state page)
  2. INVENTORY_DRIFT     llms.txt / metadata claims a URL count the sitemap
                         does not support
  3. FROZEN_LASTMOD      every sitemap lastmod identical => the maintenance
                         signal is dead
  4. ROBOTS_CONFLICT     two robots meta tags, or sitemap lists a URL that
                         serves noindex (a direct contradiction)
  5. THIN_CONTENT        an indexable URL below the word floor
  6. MISSING_SOURCES     a YMYL page with no authoritative source links/dates
  7. DUP_CONTENT         the same path live on two domains, each self-canonical
  8. CANONICAL_DRIFT     canonical host != the host serving the page
  9. DEAD_URL            a URL listed in the sitemap that is not 200

CONTRACT
--------
Silent when everything passes (prints nothing, exits 0). Prints an ALERT block
when something is wrong. ALWAYS exits 0 — a raised alert is a SUCCESSFUL run of
the watchdog; a non-zero exit would mark the cron errored every day and train
the operator to ignore it.

Read-only: HTTP GETs only. Sends nothing, writes nothing but its own log.

  --selftest    run the detector fixtures in both directions (no network)
  --offline     use the fixture corpus instead of the live web
  --verbose     print the pass summary too (for manual runs)
  --json        emit machine-readable findings
"""

from __future__ import annotations

import argparse
import concurrent.futures as futures
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

SITES = ["https://usmoneyhq.com", "https://sealofaudit.com"]

# Core pages are PER SITE. Fetching one site's paths from the other is how the
# first version of this tool manufactured fake findings: usmoneyhq's calculator
# paths were requested from sealofaudit.com, whose catch-all returned a 200
# shell, which then read as a 6-word thin page and as duplicate content.
CORE_PAGES = {
    "https://usmoneyhq.com": [
        "/", "/methodology", "/about", "/llms.txt", "/mortgage-calculator",
        "/salary-after-tax-calculator", "/salary-after-tax-calculator/california",
        "/salary-after-tax-calculator/texas", "/guides/401k-guide", "/contact",
    ],
    "https://sealofaudit.com": [
        "/", "/about", "/services", "/services/risk-check", "/book", "/blog",
    ],
}

# Pages that must carry a source register with dates (YMYL).
SOURCE_PAGES = {
    "https://usmoneyhq.com": ["/methodology", "/about"],
    "https://sealofaudit.com": ["/about"],
}

# A path that must not exist. If this returns 200, the site has a catch-all
# route and every 404 is silently a soft-404 (a real, reportable defect).
SOFT_404_PROBE = "/zzz-nonexistent-probe-9f3a1c"

# Pages below this word count on a catch-all probe are shells, not content.
SHELL_WORD_CEILING = 120

# Cloudflare returns 403 to the default Python-urllib agent. This is load-bearing.
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)

TIMEOUT = 20
WORKERS = 12
MAX_PAGES_PER_SITE = 400  # keep the whole run inside the cron window

# An indexable page below this many words is thin. Core tool pages measured
# 1,015-1,036 words on 2026-09-26; the floor sits well below that.
WORD_FLOOR = 450

# If this fraction of sitemap lastmod values are identical, the dates are
# synthetic rather than a real maintenance signal.
LASTMOD_UNIFORMITY_LIMIT = 0.80

# Fetched and text-scanned for banned claims / sources.
AUTHORITATIVE_HOSTS = (
    "irs.gov", "bls.gov", "ssa.gov", "cms.gov", "sec.gov", "ftc.gov",
    "treasury.gov", "federalreserve.gov", "consumerfinance.gov", "hud.gov",
    "healthcare.gov", "ecfr.gov", ".gov", "oecd.org", "imf.org",
)

# The claim registry. Each entry is (regex, reason). Extend by editing
# site_integrity_rules.json next to this file — no code change needed.
DEFAULT_BANNED_CLAIMS = [
    (r"5%\s*flat\s*national\s*estimate", "flat-rate national tax presented on a state page"),
    (r"flat\s*national\s*estimate", "flat-rate national tax presented on a state page"),
    (r"\$5,?500\s*per\s*day\s*per\s*violation", "penalty figure the regulation does not state"),
    (r"\$16,?500", "aggregated penalty figure not in 45 CFR 180.30"),
    (r"\$2M\s*theoretical", "unsupported annual exposure figure"),
    (r"risk[- ]free", "absolute safety claim on a financial page"),
    (r"guaranteed\s+(returns|income|approval)", "guaranteed-outcome claim"),
    (r"100%\s+(accurate|correct|guaranteed)", "absolute accuracy claim"),
]

# ---------------------------------------------------------------------------
# FETCH
# ---------------------------------------------------------------------------


def _fetch_once(url: str) -> tuple[int, str, float]:
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
    })
    started = time.time()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            raw = resp.read(600_000)
            enc = resp.headers.get_content_charset() or "utf-8"
            return resp.status, raw.decode(enc, errors="replace"), time.time() - started
    except urllib.error.HTTPError as e:
        try:
            body = e.read(200_000).decode("utf-8", errors="replace")
        except Exception:
            body = ""
        return e.code, body, time.time() - started
    except Exception:
        return 0, "", time.time() - started


def fetch(url: str, attempts: int = 3) -> tuple[int, str, float]:
    """GET a URL with retries. Returns (status, body, seconds). status 0 = no response.

    Retries matter for correctness, not politeness: under 12 concurrent workers
    a single dropped connection reported two live pages as DEAD_URL. A transport
    failure is NOT evidence that a page is gone, and an audit that reports live
    pages as dead gets ignored.
    """
    st, body, t = 0, "", 0.0
    for i in range(attempts):
        st, body, t = _fetch_once(url)
        if st != 0:
            return st, body, t
        if i < attempts - 1:
            time.sleep(0.6 * (i + 1))
    return st, body, t


def text_of(html: str) -> str:
    """Visible text: scripts/styles/nav stripped, entities collapsed."""
    t = re.sub(r"<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    t = re.sub(r"<!--.*?-->", " ", t, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    t = (t.replace("&nbsp;", " ").replace("&amp;", "&").replace("&#39;", "'")
          .replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">"))
    return re.sub(r"\s+", " ", t).strip()


def words(text: str) -> int:
    return len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'\-\.,%$]*", text))


def robots_tags(html: str) -> list[str]:
    out = []
    for m in re.finditer(r"<meta[^>]+name=[\"']?robots[\"']?[^>]*>", html, re.I):
        c = re.search(r"content=[\"']([^\"']*)[\"']", m.group(0), re.I)
        if c:
            out.append(c.group(1).lower())
    return out


def robots_state(tags: list[str]) -> tuple[bool, bool]:
    """(has_index, has_noindex) with word boundaries.

    Substring matching is WRONG here and was a real false positive: "noindex"
    contains "index", so `"index" in tag and "noindex" in tag` fires on every
    page that legitimately carries a single `noindex, follow` tag.
    """
    blob = " ".join(tags)
    return (bool(re.search(r"(?<!no)\bindex\b", blob)),
            bool(re.search(r"\bnoindex\b", blob)))


EMPTY_ROOT_RE = re.compile(r'<div[^>]+id=["\']root["\'][^>]*>\s*</div>')
SCRIPT_RE = re.compile(r"<script", re.I)


def detect_render_mode(home_html: str) -> str:
    """'server' | 'client' | 'unknown'.

    A client-rendered SPA serves a shell whose mount point is empty and whose
    only visible text is the <title>. Raw-HTML word counts say nothing about
    such a page's content, so thin-content and source-register checks must be
    reported as UNKNOWN rather than as failures.
    """
    if not home_html:
        return "unknown"
    if (EMPTY_ROOT_RE.search(home_html) and SCRIPT_RE.search(home_html)
            and words(text_of(home_html)) < SHELL_WORD_CEILING):
        return "client"
    return "server"


def canonical_of(html: str) -> str:
    m = re.search(
        r"<link[^>]+rel=[\"']?canonical[\"']?[^>]*href=[\"']([^\"']+)[\"']", html, re.I
    ) or re.search(
        r"<link[^>]+href=[\"']([^\"']+)[\"'][^>]*rel=[\"']?canonical[\"']?", html, re.I
    )
    return m.group(1).strip() if m else ""


def sitemap_urls(host: str) -> tuple[list[str], list[str], list[str]]:
    """Returns (urls, lastmods, problems)."""
    st, body, _ = fetch(host.rstrip("/") + "/sitemap.xml")
    if st != 200 or "<urlset" not in body and "<sitemapindex" not in body:
        return [], [], [f"sitemap.xml returned {st or 'no response'}"]
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", body)
    lastmods = re.findall(r"<lastmod>\s*([^<\s]+)\s*</lastmod>", body)
    return locs, lastmods, []


def llms_hint(host: str) -> dict:
    """Read the inventory claims out of llms.txt."""
    st, body, _ = fetch(host.rstrip("/") + "/llms.txt")
    if st != 200:
        return {"status": st, "raw": "", "claims": []}
    claims = []
    for m in re.finditer(r"([0-9][0-9,]{1,7})\s+\w+", body):
        n = int(m.group(1).replace(",", ""))
        claims.append((n, m.group(0)))
    pages = None
    m = re.search(r"([0-9][0-9,]{1,7})\s+indexable\s+pages", body, re.I)
    if m:
        pages = int(m.group(1).replace(",", ""))
    return {"status": st, "raw": body, "claims": claims, "indexable_claim": pages}


# ---------------------------------------------------------------------------
# DETECTORS — each returns a list of findings
# ---------------------------------------------------------------------------


def band(sev: str, check: str, site: str, detail: str, url: str = "") -> dict:
    return {"severity": sev, "check": check, "site": site, "detail": detail, "url": url}


def detect_banned_claims(site, path, html, rules):
    """One finding per defect, not one per matching rule.

    The rules overlap by design ("5% flat national estimate" also matches the
    broader "flat national estimate"), so matches are deduped by SPAN — an
    overlapping match is the same defect already reported.
    """
    out = []
    txt = text_of(html)
    taken: list[tuple[int, int]] = []
    for pattern, reason in rules:
        for m in re.finditer(pattern, txt, re.I):
            s, e = m.span()
            if any(not (e <= ts or s >= te) for ts, te in taken):
                continue
            taken.append((s, e))
            out.append(band("HIGH", "UNSUPPORTED_CLAIM", site,
                            f"{path}: found {m.group(0)!r} — {reason}", site + path))
    return out


def detect_inventory_drift(site, sitemap_count, indexable_count, hint):
    """llms.txt must not claim a page count the sitemap contradicts."""
    out = []
    claimed = hint.get("indexable_claim")
    if claimed is None:
        return out
    if sitemap_count and claimed != sitemap_count:
        # Distinguish "sitemap legitimately lists noindex variants" from a lie.
        out.append(band(
            "MED", "INVENTORY_DRIFT", site,
            f"llms.txt claims {claimed} indexable pages; sitemap lists "
            f"{sitemap_count} URLs; {indexable_count} of those are actually indexable",
            site + "/llms.txt"))
    return out


def detect_frozen_lastmod(site, lastmods):
    out = []
    if len(lastmods) < 10:
        return out
    counts = Counter(lastmods)
    top, n = counts.most_common(1)[0]
    frac = n / len(lastmods)
    if frac >= LASTMOD_UNIFORMITY_LIMIT:
        out.append(band(
            "MED", "FROZEN_LASTMOD", site,
            f"{n}/{len(lastmods)} ({frac:.0%}) sitemap lastmod values are identical "
            f"({top}) — dates are synthetic, not a maintenance signal",
            site + "/sitemap.xml"))
    return out


def detect_robots_conflict(site, path, html, in_sitemap):
    out = []
    tags = robots_tags(html)
    if not tags:
        return out
    joined = " ".join(tags)
    has_index, has_noindex = robots_state(tags)
    if len(tags) > 1:
        out.append(band("HIGH", "ROBOTS_CONFLICT", site,
                        f"{path}: {len(tags)} robots meta tags {tags} — conflicting directives",
                        site + path))
    elif has_index and has_noindex:
        out.append(band("HIGH", "ROBOTS_CONFLICT", site,
                        f"{path}: self-contradicting robots {joined!r}", site + path))
    elif has_noindex and in_sitemap:
        out.append(band("HIGH", "ROBOTS_CONFLICT", site,
                        f"{path}: listed in sitemap but serves {joined!r} — direct contradiction",
                        site + path))
    return out


def detect_thin(site, path, html):
    if not html:
        return []
    n = words(text_of(html))
    if n < WORD_FLOOR:
        return [band("MED", "THIN_CONTENT", site,
                     f"{path}: {n} words (floor {WORD_FLOOR})", site + path)]
    return []


def detect_missing_sources(site, path, html):
    if not html:
        return []
    txt = text_of(html)
    hosts = set(re.findall(r"https?://([a-z0-9.\-]+)", html, re.I))
    hosts = {h.lower().lstrip("www.") for h in hosts}
    hits = {h for h in hosts if any(h.endswith(a) for a in AUTHORITATIVE_HOSTS)}
    dated = bool(re.search(
        r"\b(?:effective|updated|last\s+reviewed|as\s+of|current\s+as\s+of)\b"
        r"[^.]{0,40}?(?:19|20)\d{2}", txt, re.I))
    out = []
    if len(hits) < 3:
        out.append(band("HIGH", "MISSING_SOURCES", site,
                        f"{path}: only {len(hits)} authoritative source link(s) "
                        f"({sorted(hits) or 'none'}) — AdSense E-E-A-T gap",
                        site + path))
    if not dated:
        out.append(band("MED", "MISSING_SOURCES", site,
                        f"{path}: no visible effective/updated date", site + path))
    return out


def detect_canonical(site, path, html):
    if not html:
        return []
    can = canonical_of(html)
    if not can:
        return []
    m = re.match(r"https?://([^/]+)(/.*)?$", can)
    if not m:
        return []
    can_host = m.group(1).lower().lstrip("www.")
    can_path = (m.group(2) or "/").rstrip("/") or "/"
    want = site.replace("https://", "").replace("http://", "").lower().lstrip("www.")
    page_path = path.rstrip("/") or "/"
    out = []
    if can_host != want:
        out.append(band("MED", "CANONICAL_DRIFT", site,
                        f"{path}: canonical points at {can_host}, not the serving host {want}",
                        site + path))
    if can_path == "/" and page_path != "/":
        out.append(band("MED", "CANONICAL_ROOT", site,
                        f"{path}: canonical points at the homepage — the page declares "
                        f"itself a duplicate of / and cannot rank as itself",
                        site + path))
    return out


def detect_dead(site, path, status):
    """Distinguish a definitive dead URL from an unverified one.

    A 4xx/5xx while listed in the sitemap is a hard defect. A transport failure
    after retries is NOT evidence of death — it is an UNKNOWN, and reporting it
    as DEAD_URL is how this tool cried wolf on two live pages.
    """
    if status == 0:
        return [band("LOW", "UNREACHABLE", site,
                     f"{path}: no response after 3 attempts — NOT verified; "
                     f"may be a network flake, re-check before fixing",
                     site + path)]
    if status >= 400:
        return [band("HIGH", "DEAD_URL", site,
                     f"{path}: HTTP {status} though listed in sitemap", site + path)]
    return []


# ---------------------------------------------------------------------------
# RUNNER
# ---------------------------------------------------------------------------


def scan_site(site, rules, offline=None):
    findings = []
    meta = {}

    if offline is not None:
        pages = offline["pages"]
        sitemap_set = set(offline["sitemap"])
        lastmods = offline["lastmods"]
        hint = offline["llms"]
    else:
        sitemap, lastmods, sp = sitemap_urls(site)
        findings += [band("HIGH", "SITEMAP", site, p, site + "/sitemap.xml") for p in sp]
        hint = llms_hint(site)

        def grab(u):
            return (u.replace(site, "") or "/"), *fetch(u)[:2]

        sitemap_urls_capped = sitemap[:MAX_PAGES_PER_SITE]
        sitemap_set = {(u.replace(site, "") or "/") for u in sitemap_urls_capped}

        # Sitemap URLs plus THIS SITE's own core pages. Never borrow another
        # site's paths — a catch-all on the other domain returns 200 shells
        # that masquerade as thin pages and duplicate content.
        wanted = list(sitemap_urls_capped)
        for c in CORE_PAGES.get(site, []):
            if c not in sitemap_set:
                wanted.append(site + c)

        pages = {}
        with futures.ThreadPoolExecutor(max_workers=WORKERS) as ex:
            for p, st, body in ex.map(grab, wanted):
                pages[p] = {"status": st, "html": body}

        # SOFT-404 probe: a path that must not exist.
        pst, pbody, _ = fetch(site + SOFT_404_PROBE)
        pw = words(text_of(pbody)) if pbody else 0
        meta["soft404_status"] = pst
        if pst == 200:
            findings.append(band(
                "HIGH", "CATCH_ALL", site,
                f"{SOFT_404_PROBE} returns HTTP 200 ({pw} words) — the site serves a "
                f"catch-all route, so every deleted or mistyped URL is a soft-404 "
                f"instead of a 404",
                site + SOFT_404_PROBE))

    listed_paths = sitemap_set
    indexable = 0
    seen_canon = {}

    # Render mode decides which checks are even meaningful. A client-rendered
    # SPA serves an empty app shell, so raw-HTML word counts and source-link
    # scans measure the shell, not the page. Measuring them anyway produced 112
    # false THIN_CONTENT findings for sealofaudit.com on the first live run.
    home = pages.get("/") or {}
    render = detect_render_mode(home.get("html", "") if home.get("status") == 200 else "")
    meta["render_mode"] = render
    if render == "client":
        findings.append(band(
            "LOW", "CLIENT_RENDERED", site,
            "raw HTML is an empty app shell (empty mount point + JS bundle) — "
            "thin-content and source-register checks are UNKNOWN for this domain; "
            "only HTTP status and canonical are verifiable server-side",
            site + "/"))

    for path, rec in sorted(pages.items()):
        html = rec.get("html", "")
        status = rec.get("status", 0)
        listed = path in listed_paths
        if status != 200:
            if listed:
                findings += detect_dead(site, path, status)
            continue
        if not html:
            continue

        tags = robots_tags(html)
        _, has_noindex = robots_state(tags)
        w = words(text_of(html))
        rec["words"] = w

        # A shell served by a catch-all for a path that is NOT in the sitemap is
        # a routing artefact, not content. Scanning it invents thin-content and
        # duplicate-content findings — exactly the false positives this tool
        # shipped with on its first run.
        if w < SHELL_WORD_CEILING and not listed:
            continue

        if listed and not has_noindex:
            indexable += 1

        findings += detect_robots_conflict(site, path, html, listed)
        findings += detect_canonical(site, path, html)

        # Shell markup cannot answer content questions — stop here rather than
        # measuring the shell and reporting the result as a page defect.
        if render == "client":
            continue

        findings += detect_banned_claims(site, path, html, rules)
        if listed and not has_noindex:
            findings += detect_thin(site, path, html)
        can = canonical_of(html)
        if can:
            seen_canon.setdefault(can, []).append(path)

    if render != "client":
        for sp_path in SOURCE_PAGES.get(site, []):
            rec = pages.get(sp_path)
            if rec and rec.get("status") == 200 and rec.get("words", 0) >= SHELL_WORD_CEILING:
                findings += detect_missing_sources(site, sp_path, rec.get("html", ""))

    findings += detect_frozen_lastmod(site, lastmods)
    findings += detect_inventory_drift(site, len(listed_paths), indexable, hint)

    meta["sitemap_count"] = len(listed_paths)
    meta["indexable_count"] = indexable
    meta["lastmod_count"] = len(lastmods)
    meta["llms_claim"] = hint.get("indexable_claim")
    meta["canonical_dupes"] = {k: v for k, v in seen_canon.items() if len(v) > 1}
    return findings, meta, pages


def scan_cross_domain(primary_pages, other_site, other_pages):
    """A path serving real content on both domains, each self-canonicalising."""
    out = []
    for p in sorted(set(primary_pages) & set(other_pages)):
        a, b = primary_pages[p], other_pages[p]
        # Only genuine content on BOTH sides is duplicate content. A catch-all
        # shell on one domain is a soft-404 and is reported as CATCH_ALL.
        if a.get("words", 0) < SHELL_WORD_CEILING or b.get("words", 0) < SHELL_WORD_CEILING:
            continue
        ca, cb = canonical_of(a.get("html", "")), canonical_of(b.get("html", ""))
        if ca and cb and ca != cb:
            out.append(band("HIGH", "DUP_CONTENT", "cross-domain",
                            f"{p}: live on both domains, each self-canonicalising "
                            f"({ca} | {cb})", p))
    return out


# ---------------------------------------------------------------------------
# SELFTEST — detectors must fire on bad fixtures AND stay quiet on good ones
# ---------------------------------------------------------------------------

GOOD_PAGE = """<html><head>
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://usmoneyhq.com/mortgage-calculator">
</head><body>""" + ("word " * 600) + "</body></html>"

BAD_ROBOTS_DOUBLE = """<html><head>
<meta name="robots" content="index, follow">
<meta name="robots" content="noindex, follow">
</head><body>""" + ("word " * 600) + "</body></html>"

BAD_CANONICAL = """<html><head>
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://sealofaudit.com/x">
</head><body>""" + ("word " * 600) + "</body></html>"

THIN_PAGE = """<html><head>
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://usmoneyhq.com/x">
</head><body>too short</body></html>"""

CLAIM_PAGE = """<html><head><meta name="robots" content="index"></head><body>""" + \
    ("word " * 600) + " This uses a 5% flat national estimate. </body></html>"

NOSOURCE_PAGE = """<html><head><meta name="robots" content="index"></head><body>""" + \
    ("word " * 600) + "</body></html>"


def selftest() -> int:
    rules = DEFAULT_BANNED_CLAIMS
    S = "https://usmoneyhq.com"  # a REAL host, so canonical checks are meaningful
    checks = []

    def ck(label, got, want):
        checks.append((label, got == want, got, want))

    # 1. GOOD fixture must be silent on every per-page detector.
    ck("good page: no banned claim", detect_banned_claims(S, "/p", GOOD_PAGE, rules), [])
    ck("good page: no robots conflict", detect_robots_conflict(S, "/p", GOOD_PAGE, True), [])
    ck("good page: not thin", detect_thin(S, "/p", GOOD_PAGE), [])
    ck("good page: no canonical drift", detect_canonical(S, "/p", GOOD_PAGE), [])
    ck("good page: not dead", detect_dead(S, "/p", 200), [])

    # 2. BAD fixtures must fire.
    ck("double robots fires", len(detect_robots_conflict(S, "/p", BAD_ROBOTS_DOUBLE, True)), 1)
    ck("canonical drift fires", len(detect_canonical(S, "/p", BAD_CANONICAL)), 1)
    ck("thin fires", len(detect_thin(S, "/p", THIN_PAGE)), 1)
    ck("banned claim fires once, not per overlapping rule",
       len(detect_banned_claims(S, "/p", CLAIM_PAGE, rules)), 1)
    ck("dead url fires", len(detect_dead(S, "/p", 500)), 1)
    ck("missing sources fires", len(detect_missing_sources(S, "/x", NOSOURCE_PAGE)), 2)

    # 3. REGRESSION — "noindex" contains "index"; substring matching made every
    #    legitimate single-tag noindex page look self-contradicting.
    ck("bare noindex is NOT self-contradicting",
       detect_robots_conflict(S, "/p", GOOD_PAGE.replace("index, follow", "noindex, follow"), False), [])
    ck("noindex in sitemap fires",
       len(detect_robots_conflict(S, "/p", GOOD_PAGE.replace("index, follow", "noindex, follow"), True)), 1)
    ck("robots_state: bare index", robots_state(["index, follow"]), (True, False))
    ck("robots_state: bare noindex", robots_state(["noindex, follow"]), (False, True))
    ck("robots_state: both", robots_state(["index", "noindex"]), (True, True))

    # 4. FROZEN_LASTMOD must need real uniformity, not a small sample.
    ck("frozen lastmod fires", len(detect_frozen_lastmod(S, ["2026-09-18"] * 20)), 1)
    variants = [f"2026-09-{d:02d}" for d in range(1, 21)]
    ck("varied lastmod silent", detect_frozen_lastmod(S, variants), [])
    ck("tiny sample silent", detect_frozen_lastmod(S, ["2026-09-18"] * 3), [])

    # 5. INVENTORY DRIFT: agreement silent, mismatch fires.
    ck("inventory agrees silent",
       detect_inventory_drift(S, 140, 140, {"indexable_claim": 140}), [])
    ck("inventory mismatch fires",
       len(detect_inventory_drift(S, 917, 140, {"indexable_claim": 140})), 1)

    # 6. ELIGIBILITY GUARD (the holiday-test lesson): a thin-firing test proves
    #    nothing unless the control page was over the floor to begin with.
    ck("control page is a real candidate (over floor)",
       words(text_of(GOOD_PAGE)) >= WORD_FLOOR, True)

    # 7. Sitemap parsing must not silently return empty on a bad document.
    ck("empty sitemap is not a clean pass",
       sitemap_urls("http://127.0.0.1:9")[2] != [], True)

    # 8. fetch() must never raise — returns 0 on a dead host.
    st, _, _ = fetch("http://127.0.0.1:9/nope")
    ck("fetch returns 0 on dead host", st, 0)

    # 9. REGRESSION — v1 fetched usmoneyhq's core paths from sealofaudit.com,
    #    whose catch-all answered 200 with a shell; those shells were then
    #    reported as thin content and duplicate content on the wrong domain.
    ck("core pages exist for every site", all(s in CORE_PAGES for s in SITES), True)
    ck("sealofaudit does not borrow usmoneyhq calculator paths",
       set(CORE_PAGES["https://sealofaudit.com"]) &
       {"/mortgage-calculator", "/salary-after-tax-calculator/california",
        "/guides/401k-guide", "/llms.txt"}, set())
    ck("source pages exist for every site", all(s in SOURCE_PAGES for s in SITES), True)

    # 10. REGRESSION — the shell guard depends on the two fixtures sitting on
    #     opposite sides of SHELL_WORD_CEILING. If a future edit moves the
    #     ceiling, this asserts the fixtures still straddle it.
    ck("thin fixture is below the shell ceiling",
       words(text_of(THIN_PAGE)) < SHELL_WORD_CEILING, True)
    ck("good fixture is above the shell ceiling",
       words(text_of(GOOD_PAGE)) > SHELL_WORD_CEILING, True)

    # 11. The soft-404 probe must not collide with a real page.
    all_core = set().union(*CORE_PAGES.values())
    ck("soft-404 probe is not a real core page", SOFT_404_PROBE in all_core, False)

    # 12. RENDER MODE — a client-rendered shell must never be measured for
    #     content. This produced 112 false thin-content findings in production.
    SHELL_HTML = ('<html><head><title>Seal of Audit</title></head><body>'
                  '<div id="root"></div><script src="/a.js"></script></body></html>')
    ck("app shell detected as client-rendered", detect_render_mode(SHELL_HTML), "client")
    ck("real page detected as server-rendered", detect_render_mode(GOOD_PAGE), "server")
    ck("missing html is unknown, not server", detect_render_mode(""), "unknown")

    # 13. CANONICAL_ROOT — a non-root page declaring itself a duplicate of /.
    ROOT_CANON = GOOD_PAGE.replace(
        "https://usmoneyhq.com/mortgage-calculator", "https://usmoneyhq.com/")
    ck("non-root page canonicalising to / fires",
       [x["check"] for x in detect_canonical(S, "/services", ROOT_CANON)],
       ["CANONICAL_ROOT"])
    ck("homepage canonicalising to / is silent",
       [x["check"] for x in detect_canonical(S, "/", ROOT_CANON)], [])

    # 14. DEAD vs UNREACHABLE — a dropped connection is not a dead page. Two
    #     live pages were reported dead by v1 because of exactly this.
    ck("transport failure is UNREACHABLE, not DEAD_URL",
       detect_dead(S, "/p", 0)[0]["check"], "UNREACHABLE")
    ck("404 is DEAD_URL", detect_dead(S, "/p", 404)[0]["check"], "DEAD_URL")
    ck("200 is silent", detect_dead(S, "/p", 200), [])

    passed = sum(1 for _, ok, _, _ in checks if ok)
    for label, ok, got, want in checks:
        if not ok:
            print(f"  FAIL  {label}\n        got={got!r}\n        want={want!r}")
    print(f"selftest: {passed}/{len(checks)} passing")
    return 0 if passed == len(checks) else 1


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--stamp", default="")
    args = ap.parse_args()

    if args.selftest:
        return selftest()

    rules = list(DEFAULT_BANNED_CLAIMS)
    rp = pathlib.Path(__file__).with_name("site_integrity_rules.json")
    if rp.exists():
        try:
            extra = json.loads(rp.read_text())
            for e in extra.get("banned_claims", []):
                rules.append((e["pattern"], e.get("reason", "custom rule")))
        except Exception:
            pass

    stamp = args.stamp or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    all_findings, metas, corpora = [], {}, {}

    for site in SITES:
        f, m, pages = scan_site(site, rules)
        all_findings += f
        metas[site] = m
        corpora[site] = pages

    # Cross-domain duplication, reusing the corpora already fetched above —
    # this used to re-fetch both sites, doubling the run's network cost.
    if len(SITES) >= 2:
        all_findings += scan_cross_domain(
            corpora[SITES[0]], SITES[1], corpora[SITES[1]])

    if args.json:
        print(json.dumps({"stamp": stamp, "findings": all_findings, "meta": metas}, indent=2))
    else:
        # Dedupe: identical (check, site, detail) triples otherwise print twice
        # and read as two problems when there is one.
        seen, uniq = set(), []
        for x in all_findings:
            k = (x["check"], x["site"], x["detail"])
            if k in seen:
                continue
            seen.add(k)
            uniq.append(x)
        all_findings = uniq

        order = {"HIGH": 0, "MED": 1, "LOW": 2}
        all_findings.sort(key=lambda x: (order.get(x["severity"], 3), x["check"], x["url"]))
        high = [x for x in all_findings if x["severity"] == "HIGH"]

        def line(x):
            host = x["site"].replace("https://", "").replace("http://", "")
            return f"  [{x['check']}] {host}: {x['detail']}"

        if all_findings:
            print(f"SITE INTEGRITY — {stamp}")
            print()
            if high:
                print(f"HIGH ({len(high)}) — content-policy risk, fix before any review")
                for x in high[:30]:
                    print(line(x))
                if len(high) > 30:
                    print(f"  ... +{len(high) - 30} more HIGH")
                print()
            # MED rolls up by check: 100+ thin-content lines bury the signal,
            # and the count per class is the actionable number.
            med = [x for x in all_findings if x["severity"] == "MED"]
            if med:
                bycheck: dict = {}
                for x in med:
                    bycheck.setdefault(x["check"], []).append(x)
                print(f"MED ({len(med)})")
                for cname, items in sorted(bycheck.items(), key=lambda kv: -len(kv[1])):
                    print(f"  {cname} × {len(items)}")
                    for x in items[:3]:
                        host = x["site"].replace("https://", "")
                        print(f"      {host}: {x['detail']}")
                    if len(items) > 3:
                        print(f"      ... +{len(items) - 3} more")
                print()
            for site, m in metas.items():
                host = site.replace("https://", "")
                probe = m.get("soft404_status")
                print(f"{host}: sitemap={m['sitemap_count']} indexable={m['indexable_count']} "
                      f"llms_claims={m['llms_claim']} soft404_probe={probe}")
            print()
            print("Each finding above is a page promise the site does not keep.")
        elif args.verbose:
            print(f"SITE INTEGRITY — {stamp}: CLEAN")
            for site, m in metas.items():
                host = site.replace("https://", "")
                print(f"  {host}: sitemap={m['sitemap_count']} indexable={m['indexable_count']} "
                      f"llms_claims={m['llms_claim']} soft404_probe={m.get('soft404_status')}")

    # heartbeat trail — proves the watchdog ran even on silent days
    log = pathlib.Path.home() / ".hermes/state/site_integrity.log"
    log.parent.mkdir(parents=True, exist_ok=True)
    hb_line = (f"{stamp}  findings={len(all_findings)} "
               f"high={len([x for x in all_findings if x['severity']=='HIGH'])} "
               f"checks={len(set(x['check'] for x in all_findings))}\n")
    try:
        with log.open("a") as fh:
            fh.write(hb_line)
        keep = log.read_text().splitlines()[-200:]
        log.write_text("\n".join(keep) + "\n")
    except Exception:
        pass

    return 0


if __name__ == "__main__":
    sys.exit(main())
