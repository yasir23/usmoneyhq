#!/usr/bin/env python3
"""Compare the fetched pages on disk. Read-only."""
import difflib
import html
import os
import re

D = "/tmp/uq"


def visible(name):
    p = os.path.join(D, name)
    if not os.path.exists(p) or os.path.getsize(p) == 0:
        return ""
    h = open(p, encoding="utf-8", errors="replace").read()
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", h, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


def nums(t):
    return {n for n in re.findall(r"\d[\d,]*\.?\d*", t)
            if len(n.replace(",", "").replace(".", "")) >= 3}


def cmp(label, fa, fb):
    ta, tb = visible(fa), visible(fb)
    if not ta or not tb:
        print(f"\n{label}\n  MISSING ({len(ta)} / {len(tb)} chars)"); return
    ratio = difflib.SequenceMatcher(None, ta, tb).ratio()
    na, nb = nums(ta), nums(tb)
    only_a, only_b = na - nb, nb - na
    print(f"\n{label}")
    print(f"  visible text     : {len(ta)} vs {len(tb)} chars")
    print(f"  similarity       : {ratio * 100:.1f}%")
    print(f"  numbers (>=3 dig) : {len(na)} vs {len(nb)}   shared {len(na & nb)}")
    print(f"  unique to A      : {len(only_a)}  {sorted(only_a)[:5]}")
    print(f"  unique to B      : {len(only_b)}  {sorted(only_b)[:5]}")
    if not only_a and not only_b:
        print("  VERDICT          : NO unique data — pure duplicate")
    elif len(only_a) + len(only_b) <= 2:
        print("  VERDICT          : n-1 unique numbers — effectively duplicate")
    else:
        print(f"  VERDICT          : {len(only_a) + len(only_b)} unique numbers — "
              f"has some per-page data")


print("=" * 70)
print("CONTENT UNIQUENESS — measured from live pages")
print("=" * 70)
cmp("AMOUNT  mortgage /100000 vs /150000", "a100.html", "a150.html")
cmp("AMOUNT  salary /50000 vs /60000", "s50.html", "s60.html")
cmp("COMPARE ca-vs-tx vs fl-vs-ny", "c1.html", "c2.html")
cmp("STATE   florida vs ohio", "fl.html", "oh.html")
cmp("BASE    /mortgage-calculator vs /mortgage-calculator/california",
    "base.html", "baseca.html")

print("\n" + "=" * 70)
print("HEADLINE")
print("=" * 70)
print("  Sitemap URLs            : 916")
print("  state variants          : ~350  (7 tools x 50 states)")
print("  state-vs-state compares : ~315  (7 tools x 45 pairs)")
print("  amount variants         : 105")
print("  -> thin/templated       : ~770  = 84% of the sitemap")
print("  genuinely distinct      : ~140")
