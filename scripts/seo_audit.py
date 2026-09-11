"""On-page SEO audit across the whole sitemap.

The other two audit scripts cover HTTP behaviour (status codes, soft 404s) and
internal linking. This one covers what a crawler reads on the page itself, and
it is the check that matters most on a 4,845-page programmatic site where every
title/description/canonical is generated from a template:

  * duplicate <title>          (two URLs competing for the same query)
  * duplicate meta description  (Google rewrites them; wastes the snippet)
  * duplicate <h1> on DIFFERENT urls (same-intent pages — flag, judge by hand)
  * missing title / description / canonical / h1
  * canonical NOT equal to the page's own URL (canonicalising away from itself
    is how a programmatic site de-indexes itself)
  * invalid JSON-LD blocks

Usage:
    python3 scripts/seo_audit.py                        # live
    python3 scripts/seo_audit.py http://localhost:3999
    python3 scripts/seo_audit.py --quiet                # counts only
"""
import html
import json
import re
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

args = [a for a in sys.argv[1:] if not a.startswith("--")]
QUIET = "--quiet" in sys.argv
SHOW_ALL = "--full" in sys.argv
BASE = (args[0] if args else "https://usmoneyhq.com").rstrip("/")
UA = "Mozilla/5.0 (compatible; usmoneyhq-seo-audit/1.0)"
SITE = "usmoneyhq.com"


def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": UA, "Cache-Control": "no-cache"})
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return r.status, r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception:  # noqa: BLE001
        return "ERR", ""


def one(pattern, text, flags=re.S):
    m = re.search(pattern, text, flags)
    return html.unescape(m.group(1)).strip() if m else ""


def scan(path):
    status, h = fetch(path)
    if status != 200 or not h:
        return None
    title = one(r"<title[^>]*>(.*?)</title>", h)
    desc = one(r'<meta\s+name="description"\s+content="(.*?)"', h)
    canon = one(r'<link\s+rel="canonical"\s+href="(.*?)"', h)
    h1 = one(r"<h1[^>]*>(.*?)</h1>", h)
    h1 = re.sub(r"<[^>]+>", "", h1).strip()
    ld_errors = []
    for i, b in enumerate(re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)):
        try:
            json.loads(html.unescape(b))
        except Exception as e:  # noqa: BLE001
            ld_errors.append(f"block {i}: {str(e)[:70]}")
    expected = BASE + path if path.startswith("/") else path
    return {"path": path, "title": title, "desc": desc, "canon": canon,
            "h1": h1, "ld": ld_errors, "expected": expected}


def main():
    _, xml = fetch("/sitemap.xml")
    paths = []
    for u in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml):
        m = re.match(r"^https?://[^/]+(/.*)?$", u)
        paths.append((m.group(1) or "/") if m else u)
    paths = sorted(set(paths))
    # non-HTML assets have no title/description/canonical by design
    ASSET_EXT = (".txt", ".xml", ".json", ".js", ".css", ".png", ".svg", ".ico", ".webmanifest")
    pages = [p for p in paths if not p.lower().endswith(ASSET_EXT)]
    print(f"SEO-scanning {len(pages)} HTML URLs (skipping {len(paths) - len(pages)} assets) against {BASE} ...\n")

    rows = []
    with ThreadPoolExecutor(max_workers=14) as ex:
        for r in ex.map(scan, pages):
            if r:
                rows.append(r)
    print(f"fetched {len(rows)}/{len(pages)} pages OK\n")

    # duplicate groups
    for field, label in (("title", "TITLE"), ("desc", "META DESCRIPTION"), ("h1", "H1")):
        groups = defaultdict(list)
        for r in rows:
            if r[field]:
                groups[r[field]].append(r["path"])
        dupes = {k: v for k, v in groups.items() if len(v) > 1}
        affected = sum(len(v) for v in dupes.values())
        print(f"{label}: {len(groups)} unique across {len(rows)} pages, "
              f"{len(dupes)} duplicated values affecting {affected} pages")
        if dupes and not QUIET:
            limit = 100 if SHOW_ALL else 8
            for k, v in sorted(dupes.items(), key=lambda kv: -len(kv[1]))[:limit]:
                print(f"    {len(v)}x  \"{k[:95]}\"")
                print(f"         e.g. {v[0]}  |  {v[1]}")
        # empty
        empties = [r["path"] for r in rows if not r[field]]
        if empties:
            print(f"    MISSING on {len(empties)} pages: {empties[:5]}")
        print()

    # canonical self-reference — compare PATHS, because canonicals are absolute
    # production URLs while BASE may be localhost
    def canon_path(u):
        m = re.match(r"^https?://[^/]+(/.*)?$", u)
        p = (m.group(1) or "/") if m else u
        return p.rstrip("/") or "/"

    bad_canon, missing_canon = [], []
    for r in rows:
        if not r["canon"]:
            missing_canon.append(r["path"])
            continue
        if canon_path(r["canon"]) != canon_path(r["path"]):
            bad_canon.append((r["path"], r["canon"]))
    print(f"CANONICAL: {len(missing_canon)} missing, {len(bad_canon)} not self-referencing")
    for p in missing_canon[:10]:
        print(f"    MISSING canonical: {p}")
    for p, c in bad_canon[:15]:
        print(f"    {p}  ->  {c}")

    ld_bad = [(r["path"], r["ld"]) for r in rows if r["ld"]]
    print(f"\nJSON-LD: {len(ld_bad)} pages with an unparseable block")
    for p, errs in ld_bad[:10]:
        print(f"    {p}: {errs}")

    problems = (len(missing_canon) + len(bad_canon) + len(ld_bad))
    print(f"\n{'PROBLEMS FOUND: ' + str(problems) if problems else 'structural checks clean'}")
    return 1 if (bad_canon or missing_canon or ld_bad) else 0


if __name__ == "__main__":
    sys.exit(main())
