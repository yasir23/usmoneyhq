#!/usr/bin/env python3
"""
adsense_live_guard.py — catch ads.txt drift at the SERVING layer.

WHY THIS EXISTS SEPARATELY FROM THE BUILD GATE

scripts/adsense_verify.mjs proves the repository is internally consistent, so a
build cannot produce a broken ads.txt. It cannot see what is actually served.
Between the repo and Google sit a Git push, GitHub Actions, a Docker image, a VPS,
and DNS -- and any of them can serve something other than what was built:

  - a deploy that silently failed, leaving the previous bundle live
  - the host answering /ads.txt with the SPA catch-all instead of the file
  - a redirect added at the edge
  - a certificate error on one of the hostnames
  - ads.txt correct on the apex and missing on www

Every one of those returns HTTP 200 with the wrong bytes, which is why this checks
CONTENT, not status codes. A status check would have called the catch-all incident
healthy.

The expected value is DERIVED from lib/ads.ts -- never typed in here. A guard that
hardcodes the value it is guarding drifts with it, and the previous version of this
check did exactly that.

OUTPUT CONTRACT (cron watchdog)
  clean  -> no stdout, exit 0             (nothing to report, stay quiet)
  drift  -> explanation on stdout, exit 1 (message delivered, and the run is
                                           marked failed so it is visible in
                                           `cronjob list` even when no messaging
                                           channel is connected)

Exit 1 on drift is deliberate. The first version exited 0 with a message, which
relies entirely on a delivery channel existing -- and on this machine none is
connected, so a real drift would have been written to a log nobody reads. A
non-zero exit marks the run itself as failed, which is visible regardless of
delivery, and is the only signal that survives when push notification is down.

Run:      python3 scripts/adsense_live_guard.py
Self-test: python3 scripts/adsense_live_guard.py --selftest

Domains can be overridden for testing with ADSENSE_GUARD_DOMAINS (comma-separated).
"""

import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ADS_TS = ROOT / "lib" / "ads.ts"

# Overridable so the drift path can be exercised against a host that is genuinely
# broken, instead of asserting that a detector detects by reading its own code.
DOMAINS = [
    d.strip()
    for d in os.environ.get(
        "ADSENSE_GUARD_DOMAINS", "usmoneyhq.com,www.usmoneyhq.com"
    ).split(",")
    if d.strip()
]
GOOGLE_CERT = "f08c47fec0942fa0"

UA_ADS = "AdsBot-Google (+http://www.google.com/adsbot.html)"


# ---------------------------------------------------------------------------
# Source of truth
# ---------------------------------------------------------------------------

def expected_line() -> tuple[str, str]:
    """Derive the required ads.txt record from lib/ads.ts. Never hardcode it."""
    body = ADS_TS.read_text(encoding="utf-8")
    m = re.search(r'ADSENSE_PUB_ID\s*=\s*["\'`]([^"\'`]+)["\'`]', body)
    if not m:
        raise SystemExit("adsense_live_guard: cannot read ADSENSE_PUB_ID from lib/ads.ts")
    raw = m.group(1).strip()
    # lib/ads.ts stores "ca-pub-<digits>". Strip the WHOLE prefix, not one half:
    # removing only "ca-" leaves "pub-<digits>", and prefixing that yields
    # "pub-pub-<digits>" — a value that matches no file anywhere and would make
    # this guard alarm on a completely healthy site.
    digits = re.sub(r"^(?:ca-)?pub-", "", raw)
    pub = f"pub-{digits}"
    return pub, f"google.com, {pub}, DIRECT, {GOOGLE_CERT}"


# ---------------------------------------------------------------------------
# Real fetch
# ---------------------------------------------------------------------------

def real_fetch(url: str) -> tuple[int, str, bytes]:
    req = urllib.request.Request(url, headers={"User-Agent": UA_ADS, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, (r.headers.get("Content-Type") or ""), r.read()
    except urllib.error.HTTPError as e:
        return e.code, (e.headers.get("Content-Type") or "" if e.headers else ""), b""
    except Exception as e:  # noqa: BLE001 - report any transport failure as a finding
        return 0, f"__TRANSPORT__ {type(e).__name__}: {e}", b""


# ---------------------------------------------------------------------------
# The check itself -- pure, testable, no network of its own
# ---------------------------------------------------------------------------

def problems_for(host: str, want: str, fetch=real_fetch) -> list[str]:
    """
    Everything wrong with the ads.txt served by one host.

    Returns a list of human-readable problems; empty means correct.
    """
    out: list[str] = []
    want_pub = want.split(",")[1].strip()
    url = f"https://{host}/ads.txt"
    status, ctype, raw = fetch(url)
    ctype_main = (ctype or "").split(";")[0].strip().lower()

    if status != 200:
        out.append(f"{url} -> HTTP {status}")
        return out

    # The catch-all failure mode: the host answers 200 with the app shell.
    if "text/plain" not in ctype_main:
        snippet = raw[:80].decode("utf-8", "replace").replace("\n", " ")
        out.append(
            f"{url} -> 200 but Content-Type is {ctype_main or 'absent'}, not "
            f"text/plain. Google reads this as no valid ads.txt "
            f"(first bytes: {snippet!r})"
        )
        return out

    if raw[:3] == b"\xef\xbb\xbf":
        out.append(f"{url} -> served with a UTF-8 BOM, so the first record's "
                   f"domain byte-matches nothing")

    if b"\r\n" in raw:
        out.append(f"{url} -> served with CRLF line endings")

    text = raw.decode("utf-8", "replace")
    if not text.endswith("\n"):
        out.append(f"{url} -> last record is unterminated (no trailing newline)")

    records = [l.strip() for l in text.splitlines() if l.strip() and not l.strip().startswith("#")]

    if not records:
        out.append(f"{url} -> served no records at all")

    found_ids = set()
    for rec in records:
        parts = [p.strip() for p in rec.split(",")]
        if len(parts) != 4:
            out.append(f"{url} -> malformed record ({len(parts)} fields): {rec!r}")
            continue
        found_ids.add(parts[1])
        if parts[1] != want_pub:
            out.append(
                f"{url} -> record declares {parts[1]} but the site's source of "
                f"truth is {want_pub}. A mismatch is the "
                f"single most common cause of a permanent 'Not found'."
            )

    if want not in text:
        if not found_ids:
            out.append(f"{url} -> contains no publisher id")
        elif not any(p.startswith(f"{url} -> record declares") for p in out):
            out.append(f"{url} -> does not contain the expected record {want!r}")

    return out


def page_problems(host: str, pub: str, fetch=real_fetch) -> list[str]:
    """The pages must announce the same publisher id ads.txt declares."""
    out: list[str] = []
    url = f"https://{host}/"
    status, ctype, raw = fetch(url)
    if status != 200:
        out.append(f"{url} -> HTTP {status}")
        return out
    html = raw.decode("utf-8", "replace")
    ids = {m.group(0).replace("ca-", "") for m in re.finditer(r"\b(?:ca-)?pub-\d{10,20}\b", html)}
    wrong = {i for i in ids if i != pub}
    if wrong:
        out.append(
            f"{url} -> page announces {', '.join(sorted(wrong))} but ads.txt "
            f"declares {pub}"
        )
    if not ids:
        out.append(f"{url} -> page announces no publisher id at all")
    return out


# ---------------------------------------------------------------------------
# Offline self-test -- prove the detector detects, without touching the network
# ---------------------------------------------------------------------------

def selftest() -> int:
    pub, want = expected_line()
    good = (200, "text/plain; charset=UTF-8", (want + "\n").encode())

    def mk(status, ctype, body):
        return lambda url: (status, ctype, body)

    cases = [
        ("correct file is silent", mk(*good), 0),
        ("SPA catch-all (text/html, 200)", mk(200, "text/html; charset=utf-8", b"<!DOCTYPE html><html>"), 1),
        ("404", mk(404, "text/html", b""), 1),
        ("wrong publisher id", mk(200, "text/plain", b"google.com, pub-1111111111111111, DIRECT, f08c47fec0942fa0\n"), 1),
        ("empty file", mk(200, "text/plain", b""), 1),
        ("BOM", mk(200, "text/plain", b"\xef\xbb\xbf" + (want + "\n").encode()), 1),
        ("CRLF", mk(200, "text/plain", (want + "\r\n").encode()), 1),
        ("no trailing newline", mk(200, "text/plain", want.encode()), 1),
        ("three fields", mk(200, "text/plain", b"google.com, pub-2473684818960461, DIRECT\n"), 1),
        ("transport failure", mk(0, "__TRANSPORT__ boom", b""), 1),
        ("content-type absent", mk(200, "", (want + "\n").encode()), 1),
    ]

    failed = 0
    print(f"self-test — expected record derived from lib/ads.ts: {want!r}\n")
    for name, fetch, want_problems in cases:
        got = problems_for("example.test", want, fetch=fetch)
        ok = (len(got) == 0) == (want_problems == 0)
        if not ok:
            failed += 1
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
        for g in got:
            print(f"         -> {g}")

    # The page check: correct id is silent, a different id is caught.
    ok_html = f'<meta name="google-adsense-account" content="ca-{pub}"/>'.encode()
    bad_html = b'<meta name="google-adsense-account" content="ca-pub-9998887776665555"/>'
    for name, body, want_problems in (("page id matches", ok_html, 0), ("page id differs", bad_html, 1)):
        got = page_problems("example.test", pub, fetch=mk(200, "text/html", body))
        ok = (len(got) == 0) == (want_problems == 0)
        if not ok:
            failed += 1
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
        for g in got:
            print(f"         -> {g}")

    total = len(cases) + 2
    print(f"\n{total - failed}/{total} passed")
    return 1 if failed else 0


# ---------------------------------------------------------------------------

def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()

    pub, want = expected_line()
    found: list[str] = []

    for host in DOMAINS:
        found += problems_for(host, want)
        found += page_problems(host, pub)

    if not found:
        return 0  # silent: nothing to report

    print(f"ADSENSE ADS.TXT DRIFT — usmoneyhq.com | publisher id {pub}\n")
    for f in found:
        print(f"  - {f}")
    print(
        "\nThe site's source of truth is correct, so this is a serving-layer change: "
        "a failed deploy, a bad redirect, a host answering with the app shell, or a "
        "DNS change. Nothing to change in the AdSense dashboard.\n"
        "Diagnose with: python3 scripts/adsense_crawler_check.py"
    )
    # Non-zero so the run is marked failed and is visible even with no delivery channel.
    return 1


if __name__ == "__main__":
    sys.exit(main())
