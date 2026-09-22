#!/usr/bin/env python3
"""
SERP SNIPPET FIT AUDIT — the sixth audit dimension.

Existing audits and what they cover:
  crawl_check.py               -> HTTP status
  page_audit.py                -> soft-404s, duplicate hrefs
  internal_link_dupes.py       -> repeated hrefs in <main>
  seo_audit.py                 -> UNIQUENESS of title/desc/h1 + canonical + JSON-LD
  orphan_page_audit.py         -> inbound links
  sitemap_index_consistency.py -> sitemap vs noindex contradiction

None of them checks whether a UNIQUE title/description actually FITS in a SERP.
Google truncates titles at ~580px (~60 chars) and descriptions at ~920px
(~155-160 chars). A unique-but-overlong title is silently truncated, and the
truncated part is usually the modifier that carries the intent ("Calculator",
state name, year) — so the page loses CTR while every uniqueness audit stays green.

Reports: overlong/undersized titles and descriptions, grouped by page SHAPE so a
template bug is visible as one row rather than N pages.
"""
import re, sys, collections
from concurrent.futures import ThreadPoolExecutor
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://usmoneyhq.com"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")

TITLE_MAX, TITLE_MIN = 60, 25
DESC_MAX, DESC_MIN = 160, 70

def fetch(url, tries=2):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
            with urllib.request.urlopen(req, timeout=25) as r:
                return r.status, r.read().decode("utf-8", "replace")
        except Exception as e:
            if i == tries - 1:
                return None, f"ERR {e}"
    return None, "ERR"

def tag(html, name):
    m = re.search(rf"<{name}[^>]*>(.*?)</{name}>", html, re.I | re.S)
    if not m:
        return ""
    s = re.sub(r"<[^>]+>", "", m.group(1))
    s = (s.replace("&amp;", "&").replace("&#x27;", "'").replace("&quot;", '"')
          .replace("&apos;", "'").replace("&lt;", "<").replace("&gt;", ">")
          .replace("&nbsp;", " "))
    return re.sub(r"\s+", " ", s).strip()

def meta_desc(html):
    m = re.search(r'<meta[^>]+name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]*name=["\']description["\']', html, re.I)
    return m.group(1).strip() if m else ""

def shape(path):
    """Collapse a URL to its template shape so a template bug shows as ONE row."""
    p = path.strip("/").split("/")
    if not p or p == [""]:
        return "/"
    for prefix in ("blog", "guides", "calculators", "states"):
        if p[0] == prefix:
            return f"/{prefix}/" + ("*" if len(p) > 1 else "")
    if len(p) == 1:
        return "/{tool}"
    if len(p) == 2:
        seg = p[1]
        if "-vs-" in seg:
            return "/{tool}/{a}-vs-{b}"
        if re.fullmatch(r"\d+", seg):
            return "/{tool}/{amount}"
        if re.fullmatch(r"\d+[kK]?", seg):
            return "/{tool}/{amount}"
        return "/{tool}/{state}"
    if len(p) == 3:
        return "/{tool}/{seg}/{seg}"
    return "/" + "/".join("*" for _ in p)

def main():
    st, sm = fetch(f"{BASE}/sitemap.xml")
    if st != 200:
        print(f"FATAL sitemap {st}")
        return 2
    raw_locs = re.findall(r"<loc>([^<]+)</loc>", sm)
    # The sitemap lists ABSOLUTE PRODUCTION urls, so auditing against localhost
    # would silently re-measure the live site and report "no change" whatever
    # this build did. Rewrite each loc's origin onto BASE before fetching.
    locs = [re.sub(r"^https?://[^/]+", BASE.rstrip("/"), u) for u in raw_locs]
    print(f"sitemap urls: {len(locs)} (origin rewritten to {BASE})")

    rows = []
    with ThreadPoolExecutor(max_workers=24) as ex:
        for url, (code, html) in zip(locs, ex.map(fetch, locs)):
            if code != 200 or "<html" not in (html or "").lower():
                rows.append((url, None, None, None, None))
                continue
            rows.append((url, tag(html, "title"), meta_desc(html), tag(html, "h1"), code))

    bad = [r for r in rows if r[1] is None]
    if bad:
        print(f"non-HTML / failed: {len(bad)} (skipped)")

    ok = [r for r in rows if r[1] is not None]
    print(f"html pages analyzed: {len(ok)}\n")

    long_t = [r for r in ok if len(r[1]) > TITLE_MAX]
    short_t = [r for r in ok if len(r[1]) < TITLE_MIN]
    long_d = [r for r in ok if len(r[2]) > DESC_MAX]
    short_d = [r for r in ok if len(r[2]) < DESC_MIN]
    nol_d = [r for r in ok if not r[2]]

    total_len_t = sum(len(r[1]) for r in ok)
    print(f"title length: avg={total_len_t/len(ok):.1f}  "
          f"> {TITLE_MAX} chars: {len(long_t)} ({100*len(long_t)/len(ok):.1f}%)  "
          f"< {TITLE_MIN}: {len(short_t)}")
    print(f"desc  length: avg={sum(len(r[2]) for r in ok)/len(ok):.1f}  "
          f"> {DESC_MAX} chars: {len(long_d)} ({100*len(long_d)/len(ok):.1f}%)  "
          f"< {DESC_MIN}: {len(short_d)}  missing: {len(nol_d)}")

    for label, items, idx in (("OVERLONG TITLES", long_t, 1),
                              ("SHORT TITLES", short_t, 1),
                              ("OVERLONG DESCRIPTIONS", long_d, 2)):
        if not items:
            continue
        print(f"\n=== {label}: by SHAPE (template bug => one shape, many pages) ===")
        c = collections.Counter(shape(u.split(BASE, 1)[-1]) for u, *_ in items)
        for sh, n in c.most_common(12):
            ex = next(u for u, *_ in items if shape(u.split(BASE, 1)[-1]) == sh)
            exv = next(r[idx] for r in items if shape(r[0].split(BASE, 1)[-1]) == sh)
            print(f"  {n:5}  {sh:36}  e.g. {exv[:96]}")
        print(f"  --- worst offenders ---")
        for r in sorted(items, key=lambda r: -len(r[idx]))[:5]:
            print(f"    {len(r[idx]):3}  {r[0].split(BASE,1)[-1][:52]:54} {r[idx][:80]}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
