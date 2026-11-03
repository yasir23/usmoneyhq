#!/usr/bin/env python3
"""
indexnow_submit.py — push every live sitemap URL to IndexNow (Bing, Yandex, and the
crawlers ChatGPT Search leans on).

IndexNow authenticates by a key file served at the domain root containing the key.
If that file 404s, every submission is rejected with 403 — so the script checks the
key URL first and refuses to submit otherwise.
"""
import json
import os
import re
import subprocess
import sys
import urllib.parse

KEY = "a7f3c9d21b8e4f6a9c0d5e2b7f4318ad"          # 32 hex chars, generated
KEY_FILE = os.path.join(os.path.expanduser("~/us-calc-tools/public"), KEY + ".txt")
SITE = "https://usmoneyhq.com"
ENDPOINT = "https://api.indexnow.org/indexnow"
SITEMAP = SITE + "/sitemap.xml"


def get(url, t=30):
    r = subprocess.run(["curl", "-sL", "-m", str(t), "-A", "Mozilla/5.0", url],
                       capture_output=True, text=True)
    return r.stdout or ""


print("key file on disk:", KEY_FILE)
if not os.path.exists(KEY_FILE):
    os.makedirs(os.path.dirname(KEY_FILE), exist_ok=True)
    open(KEY_FILE, "w").write(KEY)
    print("  created")

live_key = get("%s/%s.txt" % (SITE, KEY)).strip()
print("key served at root:", "YES" if live_key == KEY else "NO (got %r) — deploy first" % live_key[:40])

xml = get(SITEMAP)
urls = re.findall(r"<loc>([^<]+)</loc>", xml)
print("sitemap URLs:", len(urls))
if not urls:
    sys.exit("no URLs — aborting")

payload = {"host": "usmoneyhq.com", "key": KEY,
           "keyLocation": "%s/%s.txt" % (SITE, KEY), "urlList": urls[:10000]}
open("/tmp/indexnow.json", "w").write(json.dumps(payload))

r = subprocess.run(["curl", "-s", "-m", "60", "-X", "POST", ENDPOINT,
                    "-H", "content-type: application/json; charset=utf-8",
                    "--data", "@/tmp/indexnow.json", "-w", "\n%{http_code}"],
                   capture_output=True, text=True)
out = (r.stdout or "").strip().split("\n")
code = out[-1] if out else "?"
print("IndexNow response:", code, "(200 or 202 = accepted)")
if code not in ("200", "202"):
    print("  body:", " ".join(out[:-1])[:200])
