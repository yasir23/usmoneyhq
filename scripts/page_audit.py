"""Page audit for usmoneyhq — the two defects that HTTP-status checks miss.

`scripts/crawl_check.py` proves every URL returns 200. It cannot see these:

  1. SOFT 404s — a page that returns HTTP 200 while rendering the shell's
     "Tool not found" body. Google indexes those as real pages. (This is how
     /<non-state-aware-tool>/<a>-vs-<b> hid for months.)
  2. DUPLICATE INTERNAL LINKS — two components rendering a "related tools"
     grid, so the same tool is linked twice on one URL.

Usage:
    python3 scripts/page_audit.py                       # against the live site
    python3 scripts/page_audit.py http://localhost:3999 # against a local build
    python3 scripts/page_audit.py --sitemap             # every URL in sitemap.xml
    python3 scripts/page_audit.py --sitemap http://localhost:3999

Exit code 1 if anything is found, so it can gate a push.
"""
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

args = [a for a in sys.argv[1:] if not a.startswith("--")]
FULL_SITEMAP = "--sitemap" in sys.argv
# CACHE POLITICS (2026-09-15)
# This script previously sent `Cache-Control: no-cache` on EVERY request. With
# ~4,845 sitemap URLs that forces every hit to origin and files the whole run
# under Cloudflare's DYNAMIC bucket, which is a large part of why that site's
# cache-hit rate reads ~12%. Default is now to ALLOW caching so repeat runs are
# served from the edge; pass --fresh only when you genuinely need origin state.
FRESH = "--fresh" in sys.argv
BASE = (args[0] if args else "https://usmoneyhq.com").rstrip("/")
UA = "Mozilla/5.0 (compatible; usmoneyhq-page-audit/1.0)"

# Paths this script requests KNOWING they are invalid — they exist to prove that
# a bad slug yields a hard 404 (or, worse, a soft 200). Their 404s are EXPECTED
# and are not site defects. They must be counted separately, because otherwise
# they land in the Cloudflare dashboard as unexplained 404 volume and get
# misread as broken URLs on the site.
INVALID_PROBES = ("/notastate",)


def fetch(path):
    """Return (status, body). Never raises."""
    hdrs = {"User-Agent": UA}
    if FRESH:
        hdrs["Cache-Control"] = "no-cache"
    req = urllib.request.Request(BASE + path, headers=hdrs)
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return r.status, r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "ignore")
    except Exception as e:  # noqa: BLE001
        return "ERR", str(e)


def grids(body):
    """hrefs inside every .tool-grid the shell renders."""
    return [h for g in re.findall(r'<div class="tool-grid">(.*?)</div>', body, re.S)
            for h in re.findall(r'href="([^"]+)"', g)]


def audit(path):
    problems = []
    status, body = fetch(path)
    if status == "ERR" or (isinstance(status, int) and status >= 500):
        return [(path, "UNREACHABLE", str(status))]
    if status == 200 and "Tool not found" in body:
        problems.append((path, "SOFT-404", "HTTP 200 rendering the not-found body"))
    if status == 200:
        hrefs = grids(body)
        dupes = sorted({x for x in hrefs if hrefs.count(x) > 1})
        if dupes:
            problems.append((path, "DUP-LINKS", dupes))
    return problems


def sitemap_paths():
    """Every path in /sitemap.xml, rewritten relative to BASE (so the same list
    works against localhost and production)."""
    _, xml = fetch("/sitemap.xml")
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)
    out = []
    for u in locs:
        m = re.match(r"^https?://[^/]+(/.*)?$", u)
        path = (m.group(1) or "/") if m else u
        out.append(path)
    return out


def main():
    if FULL_SITEMAP:
        pages = sitemap_paths()
        if not pages:
            print("sitemap.xml returned no <loc> entries — check the fetch")
            return 1
    else:
        _, home = fetch("/")
        slugs = sorted(set(re.findall(r'href="/([a-z0-9-]+)"', home)))
        skip = {"", "blog", "guides", "about", "contact", "privacy", "privacy-policy",
                "terms", "widgets", "developers", "methodology", "premium"}
        pages = [f"/{s}" for s in slugs if s not in skip]

        # variant shapes worth probing on every tool: valid + intentionally invalid
        for s in list(pages):
            pages += [f"{s}/california", f"{s}/texas-vs-florida", f"{s}/houston-texas",
                      f"{s}/75000", f"{s}/75000/california", f"{s}/notastate"]

    seen = set()
    pages = [p for p in pages if not (p in seen or seen.add(p))]
    print(f"auditing {len(pages)} URLs against {BASE} ...")

    found = []
    with ThreadPoolExecutor(max_workers=12) as ex:
        for res in ex.map(audit, pages):
            found += res

    # ---- request-footprint disclosure -------------------------------------
    # These requests are visible in Cloudflare analytics under our own UA. Two
    # ways that has misled us: (1) the volume itself inflates "visits" (this
    # script alone was 10.38k of 124.94k requests), and (2) the intentionally
    # invalid probes below generate 404s that the audit correctly ignores but
    # the dashboard counts, which then reads as broken URLs on the site.
    expected = [p for p in pages if any(p.endswith(bad) for bad in INVALID_PROBES)]
    print(f"  [footprint] {len(pages)} requests sent as '{UA.rsplit('; ',1)[-1].rstrip(')')}'")
    if expected:
        print(f"  [footprint] {len(expected)} of those are DELIBERATELY invalid probes "
              f"({', '.join(INVALID_PROBES)}) — their 404s are expected, not defects")
    print(f"  [footprint] cache: {'bypassed (--fresh), all hits go to origin' if FRESH else 'allowed'}")

    if not found:
        print(f"clean — no soft 404s, no duplicate internal links ({len(pages)} URLs)")
        return 0

    print(f"\n{len(found)} problems:")
    for p, kind, detail in found:
        print(f"  {kind:10} {p}  {detail}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
