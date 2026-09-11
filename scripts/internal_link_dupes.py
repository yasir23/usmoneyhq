"""Deep internal-link audit: the same URL linked twice anywhere inside <main>.

`scripts/page_audit.py` is the strict gate (it only inspects .tool-grid, so it
can fail a build). This one scans EVERY href in <main> — it catches a component
duplicating a link outside the grids, which is how the guide pages were found
re-linking /refinance-calculator in both their curated list and the card grid.

Some hits are legitimate site patterns (a breadcrumb "Home" link plus a body
link to "/"), so this tool REPORTS rather than fails — read the output and judge.

Usage:
    python3 scripts/internal_link_dupes.py
    python3 scripts/internal_link_dupes.py http://localhost:3999
    python3 scripts/internal_link_dupes.py --all        # every URL in sitemap.xml
"""
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

args = [a for a in sys.argv[1:] if not a.startswith("--")]
ALL = "--all" in sys.argv
BASE = (args[0] if args else "https://usmoneyhq.com").rstrip("/")
UA = "Mozilla/5.0 (compatible; usmoneyhq-link-audit/1.0)"

SAMPLES = [
    "/", "/mortgage-calculator", "/dti-calculator", "/bmi-calculator",
    "/salary-after-tax-calculator", "/salary-after-tax-calculator/california",
    "/salary-after-tax-calculator/75000", "/salary-after-tax-calculator/75000/california",
    "/salary-after-tax-calculator/texas-vs-florida", "/mortgage-calculator/houston-texas",
    "/401k-calculator/30", "/net-worth-calculator", "/concrete-calculator",
    "/guides/mortgage-calculator-guide", "/guides/rmd-guide", "/guides",
    "/about", "/contact", "/blog", "/blog/warning-letter-vs-cap-vs-fine",
    "/widgets", "/developers", "/methodology", "/calculators/money-loans",
]


def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": UA, "Cache-Control": "no-cache"})
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return r.status, r.read().decode("utf-8", "ignore")
    except Exception as e:  # noqa: BLE001
        return "ERR", str(e)


def targets():
    if not ALL:
        return SAMPLES
    _, xml = fetch("/sitemap.xml")
    out = []
    for u in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml):
        m = re.match(r"^https?://[^/]+(/.*)?$", u)
        out.append((m.group(1) or "/") if m else u)
    return out


def audit(path):
    status, html = fetch(path)
    if status != 200:
        return None
    m = re.search(r"<main[^>]*>(.*?)</main>", html, re.S)
    body = m.group(1) if m else html
    hrefs = [h for h in re.findall(r'href="([^"]+)"', body) if h.startswith("/")]
    counts = {h: hrefs.count(h) for h in set(hrefs) if hrefs.count(h) > 1}
    return (path, counts) if counts else None


def main():
    pages = targets()
    print(f"deep link scan of {len(pages)} pages against {BASE} ...\n")
    hits = []
    with ThreadPoolExecutor(max_workers=12) as ex:
        for res in ex.map(audit, pages):
            if res:
                hits.append(res)
    if not hits:
        print("clean — no URL linked twice inside <main>")
        return 0
    print(f"{len(hits)} pages with a repeated link (review each — breadcrumb + body"
          f" patterns are normal):\n")
    for path, counts in hits:
        print(f"  {path}")
        for href, n in sorted(counts.items(), key=lambda kv: -kv[1]):
            print(f"      {n}x  {href}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
