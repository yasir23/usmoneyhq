#!/usr/bin/env python3
"""Measure how much of usmoneyhq.com is genuinely unique.

AdSense rejected the site for "low value content". Rather than guess which
pages caused it, fetch representative pairs and measure:

  similarity      how much of the visible text is shared
  shared numbers  figures appearing in BOTH pages
  unique numbers  figures appearing in only one

A page carrying real per-state data shows unique numbers. A page that is its
sibling with one word swapped shows none.

Read-only. Fetches 6 pages.
"""
import difflib
import html
import re
import urllib.request

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36")


def fetch(url):
    req = urllib.request.Request(url)
    req.add_header("User-Agent", UA)
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        return f"__ERR__ {type(e).__name__}: {e}"


def visible_text(h):
    if h.startswith("__ERR__"):
        return h
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", h, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


def nums(t):
    # Ignore 1-2 digit numbers: years, list markers, counts of sections.
    return {n for n in re.findall(r"\d[\d,]*\.?\d*", t) if len(n.replace(",", "")) >= 3}


def compare(label, a, b):
    ta, tb = visible_text(fetch(a)), visible_text(fetch(b))
    if ta.startswith("__ERR__") or tb.startswith("__ERR__"):
        print(f"\n{label}: FETCH FAILED\n  {ta[:80]}\n  {tb[:80]}")
        return
    ratio = difflib.SequenceMatcher(None, ta, tb).ratio()
    na, nb = nums(ta), nums(tb)
    shared, only_a, only_b = na & nb, na - nb, nb - na
    print(f"\n{label}")
    print(f"  text length      : {len(ta)} vs {len(tb)}")
    print(f"  similarity       : {ratio * 100:.1f}%")
    print(f"  numbers found    : {len(na)} vs {len(nb)}")
    print(f"  shared numbers   : {len(shared)}")
    print(f"  unique to A      : {len(only_a)}  {sorted(only_a)[:6]}")
    print(f"  unique to B      : {len(only_b)}  {sorted(only_b)[:6]}")
    verdict = ("REAL per-page data" if (only_a or only_b)
               else "NO unique data — duplicate")
    print(f"  verdict          : {verdict}")


print("=" * 70)
print("usmoneyhq.com — CONTENT UNIQUENESS AUDIT")
print("=" * 70)

B = "https://usmoneyhq.com"
compare("STATE  pages: california vs texas",
        f"{B}/mortgage-calculator/california",
        f"{B}/mortgage-calculator/texas")
compare("STATE  pages: florida vs ohio",
        f"{B}/mortgage-calculator/florida",
        f"{B}/mortgage-calculator/ohio")
compare("AMOUNT pages: /100000 vs /150000",
        f"{B}/mortgage-calculator/100000",
        f"{B}/mortgage-calculator/150000")
compare("SALARY amount: /50000 vs /60000",
        f"{B}/salary-after-tax-calculator/50000",
        f"{B}/salary-after-tax-calculator/60000")
compare("COMPARISON: ca-vs-tx vs fl-vs-ny",
        f"{B}/mortgage-calculator/california-vs-texas",
        f"{B}/mortgage-calculator/florida-vs-new-york")
compare("BASE tool vs its own state page",
        f"{B}/mortgage-calculator",
        f"{B}/mortgage-calculator/california")

print("\n" + "=" * 70)
