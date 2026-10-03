#!/usr/bin/env python3
"""
verify_llms_links.py — every URL published in an llms.txt must resolve.

WHY THIS EXISTS
llms.txt is the one document an answer engine reads to learn what a site contains.
If it points at a 404, the engine is handed a broken reference and the thing you
were trying to make discoverable is not. Publishing a link and not checking it is
how the sealofaudit blog ended up 404 on both domains in the first place.

Checks every absolute URL inside each domain's llms.txt, and reports any that do
not return 200. Also asserts the llms.txt itself is served as text/plain — a crawl
file returning HTML with 200 is the failure this whole surface had.
"""
import re
import sys
import urllib.error
import urllib.request

TARGETS = ["https://sealofaudit.com", "https://hermesrevenue.com"]
UA = {"User-Agent": "Mozilla/5.0 (compatible; llms-link-check/1.0)"}
TIMEOUT = 20


def fetch(url):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return r.status, (r.headers.get("Content-Type") or ""), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, "", ""
    except Exception as e:
        return 0, f"__ERR__ {e}", ""


bad = 0
for base in TARGETS:
    print(f"\n=== {base} ===")

    status, ctype, body = fetch(f"{base}/llms.txt")
    if status != 200 or "text/html" in ctype:
        print(f"  FAIL llms.txt -> HTTP {status} {ctype} (must be 200 text/plain)")
        bad += 1
        continue
    print(f"  llms.txt OK: {status}, {ctype.split(';')[0]}, {len(body)} chars")

    # every absolute URL on this domain mentioned in the file
    urls = sorted(set(re.findall(rf"{re.escape(base)}[^\s)\]]*", body)))
    print(f"  URLs referenced: {len(urls)}")
    for u in urls:
        st, ct, _ = fetch(u)
        mark = "OK  " if st == 200 else "FAIL"
        if st != 200:
            bad += 1
        print(f"    {mark} {st:>3}  {u}")

print()
if bad == 0:
    print("ALL LLMS.TXT LINKS RESOLVE")
else:
    print(f"{bad} BROKEN REFERENCE(S) PUBLISHED IN llms.txt")
sys.exit(0 if bad == 0 else 1)
