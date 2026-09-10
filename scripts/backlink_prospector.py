#!/usr/bin/env python3
"""backlink_prospector.py — find REAL backlink prospects via Bing.

Tactics encoded (from the 2026 link strategy):
  1. Resource-page targets — pages that curate "financial calculators"/"money tools"
  2. Link-intersect lite — pages that already link to calculator.net / bankrate
     (they link to competitors, so they link out — prime embed targets)
  3. Vertical targets — personal finance, real estate, HR/payroll, local news
  4. .edu financial-literacy pages

Output: us-calc-tools/backlinks/prospects.csv  (url, domain, type, query, seen)
Dedupes against prior runs. Sends NOTHING — drafts only.
"""
import csv, html, os, re, subprocess, sys, time

BASE = "/Users/ambusiness/us-calc-tools"
OUT_DIR = os.path.join(BASE, "backlinks")
OUT = os.path.join(OUT_DIR, "prospects.csv")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

QUERIES = [
    ("resource-page",  '"financial calculators" intitle:resources'),
    ("resource-page",  '"money tools" OR "finance resources" intitle:links'),
    ("link-intersect", 'link:calculator.net mortgage calculator'),
    ("link-intersect", '"calculator.net" mortgage calculator resources'),
    ("vertical-realestate", '"mortgage calculator" intitle:resources real estate blog'),
    ("vertical-hr",    '"paycheck calculator" OR "salary calculator" intitle:resources'),
    ("vertical-news",  '"cost of living" calculator site:.com intitle:resources'),
    ("edu",            'site:.edu "financial literacy" calculator resources'),
    ("embed-friendly", '"free calculators" "add to your site" finance'),
]

SKIP_DOM = re.compile(r"(calculator\.net|bankrate|nerdwallet|smartasset|reddit|youtube|"
                      r"facebook|twitter|linkedin|pinterest|amazon|wikipedia|google|bing|"
                      r"quora|medium\.com/@|usmoneyhq)", re.I)

def bing(q, count=30):
    url = f"https://www.bing.com/search?q={html.escape(q)}&count={count}"
    r = subprocess.run(["curl", "-sL", "--max-time", "20", "-A", UA, url],
                       capture_output=True, timeout=40)
    return r.stdout.decode("utf-8", errors="ignore")

def extract_results(page):
    out = []
    # Bing organic result links
    for m in re.finditer(r'<h2[^>]*>\s*<a[^>]+href="(https?://[^"]+)"', page, re.I):
        out.append(html.unescape(m.group(1)))
    if not out:
        for m in re.finditer(r'href="(https?://[^"]+)"[^>]*>', page):
            u = html.unescape(m.group(1))
            if "bing.com" not in u and "microsoft" not in u:
                out.append(u)
    return out

def load_seen():
    if not os.path.exists(OUT):
        return set()
    try:
        return {r["url"] for r in csv.DictReader(open(OUT))}
    except Exception:
        return set()

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    seen = load_seen()
    existing = os.path.exists(OUT)
    added = 0
    with open(OUT, "a", newline="") as f:
        w = csv.writer(f)
        if not existing:
            w.writerow(["url", "domain", "type", "query", "added"])
        for typ, q in QUERIES:
            page = bing(q)
            urls = extract_results(page)
            kept = 0
            for u in urls:
                dom = re.sub(r"^https?://(www\.)?", "", u).split("/")[0]
                if SKIP_DOM.search(dom) or u in seen:
                    continue
                seen.add(u)
                w.writerow([u, dom, typ, q, __import__("datetime").date.today().isoformat()])
                added += 1; kept += 1
            print(f"  [{typ:20}] {kept:3} new from: {q[:52]}")
            time.sleep(2)  # be polite
    print(f"\nadded {added} prospects -> {OUT}")
    try:
        total = sum(1 for _ in csv.DictReader(open(OUT)))
        print(f"prospect list now: {total}")
    except Exception:
        pass

if __name__ == "__main__":
    main()
