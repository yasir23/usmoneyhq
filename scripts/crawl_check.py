#!/usr/bin/env python3
"""Full crawl of usmoneyhq.com sitemap — expect 0 bad (non-200/soft-404)."""
import concurrent.futures as cf
import re
import sys
import urllib.error
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}


def fetch(url):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read()
            return url, r.status, len(body)
    except urllib.error.HTTPError as e:
        return url, e.code, 0
    except Exception as e:
        return url, "ERR", str(e)[:60]


def main():
    sitemap = urllib.request.Request("https://usmoneyhq.com/sitemap.xml", headers=UA)
    xml = urllib.request.urlopen(sitemap, timeout=30).read().decode("utf-8", "ignore")
    urls = re.findall(r"<loc>(.*?)</loc>", xml)
    print(f"total sitemap urls: {len(urls)}", flush=True)
    bad = []
    ok = 0
    with cf.ThreadPoolExecutor(max_workers=24) as ex:
        for i, (url, code, size) in enumerate(ex.map(fetch, urls)):
            if code == 200 and size > 500:
                ok += 1
            else:
                bad.append((url, code, size))
            if (i + 1) % 500 == 0:
                print(f"checked {i+1}/{len(urls)} — ok so far: {ok}, bad: {len(bad)}", flush=True)
    print(f"DONE ok={ok} bad={len(bad)}")
    for b in bad[:50]:
        print("BAD:", b)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
