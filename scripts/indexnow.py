#!/usr/bin/env python3
"""indexnow.py — submit every sitemap URL to the IndexNow endpoints.

Why IndexNow and not the "Google Indexing API":
  The Google Indexing API accepts ONLY JobPosting and BroadcastEvent URLs. It has
  no general-purpose submit endpoint, so pointing it at calculator pages returns a
  successful HTTP call that indexes nothing — a pipeline that reports success and
  does no work. IndexNow (Bing, Yandex, Seznam, Naver) is the real general-purpose
  push protocol, and it is the one that can be wired in an afternoon.

The key file already lives in public/8a7abeeab57214612a69473e0b2c4d4c.txt and is
served as text/plain from the domain, which is what the protocol requires.

Usage:
  python3 scripts/indexnow.py            # submit the whole sitemap
  python3 scripts/indexnow.py --dry-run  # list what would be sent
  python3 scripts/indexnow.py --urls https://usmoneyhq.com/about ...

Exit codes: 0 = every batch accepted, 1 = at least one batch rejected.
Silent-on-success is NOT used here: a submission run should leave a one-line
receipt, because the failure mode is "we thought we were submitting".
"""
import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

HOST = "usmoneyhq.com"
SITE = f"https://{HOST}"
KEY = "8a7abeeab57214612a69473e0b2c4d4c"
KEY_LOCATION = f"{SITE}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
BATCH = 10000  # protocol maximum per request


def sitemap_urls() -> list[str]:
    # Cloudflare 403s the default urllib user agent, so name ourselves.
    req = urllib.request.Request(
        f"{SITE}/sitemap.xml",
        headers={"User-Agent": "usmoneyhq-indexnow/1.0 (+https://usmoneyhq.com)"},
    )
    with urllib.request.urlopen(req, timeout=45) as r:
        body = r.read()
    root = ET.fromstring(body)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [loc.text.strip() for loc in root.findall(".//s:loc", ns) if loc.text]


def submit(urls: list[str]) -> int:
    failures = 0
    for i in range(0, len(urls), BATCH):
        chunk = urls[i : i + BATCH]
        payload = json.dumps(
            {"host": HOST, "key": KEY, "keyLocation": KEY_LOCATION, "urlList": chunk}
        ).encode()
        req = urllib.request.Request(
            ENDPOINT,
            data=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                code = r.status
        except urllib.error.HTTPError as e:
            code = e.code
        # 200 = accepted, 202 = accepted/pending key validation. Anything else is a real failure.
        if code in (200, 202):
            print(f"IndexNow batch {i // BATCH + 1}: {len(chunk)} URLs -> HTTP {code}")
        else:
            print(f"IndexNow batch {i // BATCH + 1}: REJECTED HTTP {code}", file=sys.stderr)
            failures += 1
    return failures


def main() -> int:
    args = sys.argv[1:]
    if args and args[0] == "--urls":
        urls = args[1:]
    else:
        urls = sitemap_urls()

    if not urls:
        print("No URLs to submit.", file=sys.stderr)
        return 1

    if "--dry-run" in args:
        print(f"DRY RUN: {len(urls)} URLs would be submitted to {ENDPOINT}")
        for u in urls[:5]:
            print("  ", u)
        return 0

    failures = submit(urls)
    if failures:
        print(f"FAILED: {failures} batch(es) rejected.", file=sys.stderr)
        return 1
    print(f"IndexNow OK: {len(urls)} URLs submitted.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
