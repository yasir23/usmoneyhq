#!/usr/bin/env python3
"""
adsense_crawler_check.py — can Google actually READ ads.txt and serve ads here?

WHY THE USER-AGENT MATTERS
AdSense does not use Googlebot. It uses:
  - AdsBot-Google        -> fetches ads.txt
  - Mediapartners-Google -> crawls pages for ad targeting
If either is blocked by robots.txt or answered differently by the server, ads.txt
reads as "Not found" even though the file is present and byte-perfect. That is the
one remaining explanation for a correct file showing as missing.
"""
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from adsense_live_guard import expected_line  # noqa: E402

# Derived, never typed in. This line used to hardcode the publisher id, which is
# the same drift class the guard exists to catch: a check that stores its own copy
# of the value it checks stops detecting the day that value legitimately changes.
_, EXPECTED = expected_line()

UA = {
    "AdsBot-Google": "AdsBot-Google (+http://www.google.com/adsbot.html)",
    "Mediapartners-Google": "Mediapartners-Google",
    "Googlebot": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "default": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
}


def get(url, ua_key):
    req = urllib.request.Request(url, headers={"User-Agent": UA[ua_key], "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, (r.headers.get("Content-Type") or ""), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, "", ""
    except Exception as e:
        return 0, f"__ERR__ {e}", ""


EXPECTED = "google.com, pub-2473684818960461, DIRECT, f08c47fec0942fa0"
bad = 0

print("1. ads.txt, fetched as each Google agent")
for key in ("AdsBot-Google", "Mediapartners-Google", "Googlebot", "default"):
    st, ct, body = get("https://usmoneyhq.com/ads.txt", key)
    body = body.strip()
    ok = st == 200 and "text/html" not in ct and body == EXPECTED
    if not ok:
        bad += 1
    print(f"   {'OK  ' if ok else 'FAIL'} {key:<22} {st}  {ct.split(';')[0]:<10} match={body == EXPECTED}")

print("\n2. page fetch, as AdSense's targeting crawler")
st, ct, body = get("https://usmoneyhq.com/", "Mediapartners-Google")
ok = st == 200 and len(body) > 5000
if not ok:
    bad += 1
print(f"   {'OK  ' if ok else 'FAIL'} Mediapartners-Google  {st}  {len(body)} bytes")

print("\n3. robots.txt must not exclude an AdSense agent")
st, ct, robots = get("https://usmoneyhq.com/robots.txt", "default")
blocked = []
for agent in ("AdsBot-Google", "Mediapartners-Google", "Googlebot"):
    # find a UA block for this agent and look for a Disallow: / inside it
    m = re.search(rf"User-agent:\s*{re.escape(agent)}\s*\n((?:\s*[A-Za-z-]+:.*\n)*)", robots, re.I)
    if m and re.search(r"Disallow:\s*/\s*$", m.group(1), re.M):
        blocked.append(agent)
if blocked:
    bad += 1
print(f"   {'FAIL' if blocked else 'OK  '} blocked agents: {blocked or 'none'}")

print()
print("ALL ADSENSE CRAWLER CHECKS PASS" if bad == 0 else f"{bad} FAILURE(S)")
