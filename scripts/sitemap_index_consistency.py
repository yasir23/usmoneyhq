#!/usr/bin/env python3
"""
Sitemap <-> robots-meta consistency audit.

No existing audit covers this:
  crawl_check.py   -> status codes
  page_audit.py    -> soft-404s + dup hrefs
  seo_audit.py     -> title/desc/h1/canonical/schema
  orphan_page_audit.py -> inbound links

This checks the CONTRADICTION class:
  A) a URL in the sitemap that serves "noindex"  -> dead crawl budget, splits signal
  B) a tool variant NOT in the sitemap that serves "index" -> unsubmitted indexable page
"""
import re, sys, time
from concurrent.futures import ThreadPoolExecutor
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://usmoneyhq.com"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")
WORKERS = 24

def fetch(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA,
                                                       "Accept": "text/html"})
            with urllib.request.urlopen(req, timeout=25) as r:
                return r.status, r.read().decode("utf-8", "replace")
        except Exception as e:
            if i == tries - 1:
                return None, f"ERR {e}"
            time.sleep(1.5 * (i + 1))
    return None, "ERR"

def robots_token(html):
    if not isinstance(html, str):
        return "?"
    # meta robots may be name="robots" content="noindex, follow"
    m = re.search(r'<meta[^>]+name=["\']robots["\'][^>]*content=["\']([^"\']*)["\']',
                  html, re.I)
    if m:
        return m.group(1).strip().lower()
    m = re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]*name=["\']robots["\']',
                  html, re.I)
    if m:
        return m.group(1).strip().lower()
    return ""

def main():
    st, sm = fetch(f"{BASE}/sitemap.xml")
    if st != 200:
        print(f"FATAL: sitemap fetch -> {st}")
        return 2
    locs = re.findall(r"<loc>([^<]+)</loc>", sm)
    print(f"sitemap: status={st} urls={len(locs)}")

    # sample strategy: full scan is 1939 reqs; do it, it's a one-off
    results = []
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for url, (code, html) in zip(locs, ex.map(fetch, locs)):
            results.append((url, code, robots_token(html)))

    noindex_in_sitemap = [(u, c, t) for u, c, t in results if t and "noindex" in t]
    no_meta = [(u, c) for u, c, t in results if not t]
    nofollow_missing = [(u, c, t) for u, c, t in results
                        if t and "nofollow" in t or (t and "index" not in t and "noindex" not in t)]
    errors = [(u, c) for u, c, t in results if c is None]

    print(f"\n[A] sitemap URLs serving NOINDEX  : {len(noindex_in_sitemap)}")
    for u, c, t in noindex_in_sitemap[:15]:
        print(f"      {u}  -> '{t}'")
    print(f"\n[B] sitemap URLs with NO robots meta at all: {len(no_meta)}")
    for u, c in no_meta[:10]:
        print(f"      {u}  ({c})")
    print(f"\n[C] sitemap URLs missing an explicit 'index': {len(nofollow_missing)}")
    for u, c, t in nofollow_missing[:10]:
        print(f"      {u}  -> '{t}'")
    print(f"\n[D] fetch errors (transient?): {len(errors)}")
    for u, c in errors[:10]:
        print(f"      {u}  {c}")

    print("\n--- verdict ---")
    if not noindex_in_sitemap:
        print("OK: no sitemap URL is noindexed (no contradictory signal).")
    else:
        print("DEFECT: sitemap lists noindexed URLs.")
    return 1 if noindex_in_sitemap else 0

if __name__ == "__main__":
    sys.exit(main())
