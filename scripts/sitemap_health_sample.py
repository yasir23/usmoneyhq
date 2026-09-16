#!/usr/bin/env python3
"""sitemap_health_sample.py — find the 404/500 URLs WITHOUT adding to the problem.

CONTEXT (2026-09-15)
--------------------
The Cloudflare dashboard for usmoneyhq.com shows 15.59k 404s and 2.06k 500s.
Two things follow, and both are measured rather than assumed:

  1. A large share of that traffic is OUR OWN audit scripts. `page_audit.py`
     (UA `usmoneyhq-page-audit/1.0`, 10.38k requests) fetches EVERY url in
     sitemap.xml, and the sitemap holds 4,845 URLs. That is ~2 full passes.
     `internal_link_dupes.py` (UA `usmoneyhq-link-audit/1.0`) adds 4.87k more.
     So the audit both MEASURES and AMPLIFIES the 404 count.

  2. Therefore a full re-crawl to enumerate the dead URLs would make the very
     number being complained about worse. This samples instead.

A BOUNDED sample (default 60 URLs, spaced evenly across the sitemap) is enough
to estimate the failure rate and identify the failing URL PATTERNS, which is
what you need in order to fix or 410 them. It cannot enumerate every bad URL —
this is a rate estimate plus pattern discovery, not a census.

Read-only. Sends GETs to our own site only.

    python3 sitemap_health_sample.py [--n 60] [--base https://usmoneyhq.com]
"""
import gzip
import re
import sys
import urllib.error
import urllib.request
from collections import Counter, defaultdict

UA = "Mozilla/5.0 (compatible; usmoneyhq-page-audit/1.0)"
BASE = "https://usmoneyhq.com"
N = 60


def get(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read()
            if r.headers.get("Content-Encoding") == "gzip":
                body = gzip.decompress(body)
            return r.status, body.decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        try:
            return e.code, e.read().decode("utf-8", "ignore")
        except Exception:
            return e.code, ""
    except Exception as e:
        return "ERR", str(e)


def shape(path):
    """Collapse a URL to a pattern so failures group instead of listing."""
    p = re.sub(r"^https?://[^/]+", "", path)
    p = re.sub(r"\d+", "<n>", p)
    p = re.sub(r"[a-z0-9-]{20,}", "<slug>", p)
    return p


def main():
    global BASE, N
    argv = sys.argv[1:]
    if "--n" in argv:
        N = int(argv[argv.index("--n") + 1])
    if "--base" in argv:
        BASE = argv[argv.index("--base") + 1].rstrip("/")

    print("=" * 76)
    print(f"SITEMAP HEALTH — bounded sample (max {N} URLs)")
    print("=" * 76)

    st, xml = get(f"{BASE}/sitemap.xml")
    if st != 200:
        print(f"  sitemap fetch failed: {st}")
        return 2
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)
    print(f"  sitemap status : {st}")
    print(f"  URLs in sitemap: {len(locs):,}")
    if not locs:
        return 2

    step = max(1, len(locs) // N)
    sample = locs[::step][:N]
    print(f"  sampling       : every {step}th URL -> {len(sample)} requests")
    print()

    codes = Counter()
    bad = []
    for u in sample:
        st, body = get(u)
        codes[st] += 1
        if st != 200:
            soft = (st == 200)
            bad.append((st, u))
        else:
            # catch the SOFT 404 class the audit already knows about:
            # HTTP 200 rendering the shell's "Tool not found" body
            if "Tool not found" in body:
                codes["soft404"] += 1
                bad.append(("soft404", u))

    total = len(sample)
    print("STATUS DISTRIBUTION")
    for k, v in codes.most_common():
        print(f"  {str(k):<8} {v:>4}  {100.0*v/total:5.1f}%")

    print()
    if bad:
        print("FAILING URL PATTERNS (grouped; full URLs truncated)")
        pat = Counter()
        for code, u in bad:
            pat[(code, shape(u))] += 1
        for (code, p), n in pat.most_common(15):
            print(f"  [{code}] x{n:<3} {p[:70]}")
        print()
        print("SAMPLE FAILURES (first 10 verbatim)")
        for code, u in bad[:10]:
            print(f"  [{code}] {u}")
    else:
        print("No failures in this sample.")

    bad_n = sum(v for k, v in codes.items() if k != 200)
    print()
    print("=" * 76)
    print(f"ESTIMATE: {100.0*bad_n/total:.1f}% of sampled URLs are not 200 "
          f"({bad_n}/{total})")
    print(f"          applied to the sitemap that is ~{int(bad_n/total*len(locs)):,} "
          f"of {len(locs):,} URLs")
    print()
    print("CAVEAT: a bounded sample estimates the rate and reveals patterns. It does")
    print("        NOT enumerate every bad URL, and a full crawl would add to the")
    print("        very 404 count under investigation. Treat this as a lead, not a census.")
    return 1 if bad_n else 0


if __name__ == "__main__":
    raise SystemExit(main())
