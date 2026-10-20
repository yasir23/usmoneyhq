#!/usr/bin/env python3
"""Assert public/llms.txt's claims against the page list search engines receive.

The heartbeat caught "llms.txt claims 140 indexable pages; sitemap lists 113"
on four consecutive days. Detection existed; a failing gate did not. This is
the gate — it runs in `npm run build`, so a claim that disagrees with the
sitemap fails the build instead of shipping and being repeated by an AI agent.

Checks (all derived, none retyped):
  1. asserted indexable-page count == <loc> count in the built sitemap
  2. asserted calculator count       == in-scope registry size
  3. every calculator URL in the list resolves to an in-scope registry slug
  4. no out-of-scope slug is advertised anywhere in the file

Usage:
    python3 scripts/verify_llms_txt.py            # built sitemap (CI + local build)
    python3 scripts/verify_llms_txt.py --live     # fetch the live sitemap instead
"""
from __future__ import annotations

import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS_TS = ROOT / "lib" / "tools.ts"
TOPICAL_TS = ROOT / "lib" / "topical.ts"
LLMS = ROOT / "public" / "llms.txt"
BUILT_SITEMAP_CANDIDATES = (
    ROOT / ".next" / "server" / "app" / "sitemap.xml.body",
    ROOT / ".next" / "server" / "app" / "sitemap.xml",
)
LIVE_SITEMAP = "https://usmoneyhq.com/sitemap.xml"
UA = {"User-Agent": "Mozilla/5.0 (compatible; llms-count-check/1.0)"}

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sync_llms_txt import parse_out_of_scope, parse_registry  # noqa: E402


def sitemap_loc_count(live: bool) -> int:
    if live:
        req = urllib.request.Request(LIVE_SITEMAP, headers=UA)
        with urllib.request.urlopen(req, timeout=30) as r:  # noqa: S310
            body = r.read().decode("utf-8", "replace")
        n = len(re.findall(r"<loc>", body))
        if n == 0:
            raise SystemExit("verify_llms_txt: live sitemap returned no <loc> entries")
        return n
    if not any(p.exists() for p in BUILT_SITEMAP_CANDIDATES):
        # A gate that breaks every deploy when Next moves a build artifact is worse
        # than one that reports its own blind spot. The drift case this exists for
        # (artifact present, numbers disagree) still fails below.
        print(
            "LLMS.TXT CLAIM CHECK — SKIP: no built sitemap found at "
            + ", ".join(str(p) for p in BUILT_SITEMAP_CANDIDATES)
            + ". Run `npm run build` first, or pass --live."
        )
        return 0
    body = ""
    for p in BUILT_SITEMAP_CANDIDATES:
        if p.exists():
            body = p.read_text(encoding="utf-8", errors="ignore")
            break
    n = len(re.findall(r"<loc>", body))
    if n == 0:
        raise SystemExit("verify_llms_txt: built sitemap has no <loc> entries")
    return n


def main() -> int:
    live = "--live" in sys.argv
    failures: list[str] = []

    entries = parse_registry(TOOLS_TS.read_text(encoding="utf-8"))
    out_of_scope = parse_out_of_scope(TOPICAL_TS.read_text(encoding="utf-8"))
    in_scope = [s for s, _ in entries if s not in out_of_scope]
    pages = sitemap_loc_count(live)
    text = LLMS.read_text(encoding="utf-8")

    # 1. indexable-page count
    m = re.search(r"(\d[\d,]*)\s+indexable", text)
    if not m:
        failures.append("no 'N indexable' claim found — the header block is missing")
    else:
        claimed = int(m.group(1).replace(",", ""))
        if claimed != pages:
            failures.append(
                f"claims {claimed} indexable pages, sitemap serves {pages} "
                f"({pages - claimed:+d}) — run scripts/sync_llms_txt.py"
            )

    # 2. calculator count
    m = re.search(r"(\d[\d,]*)\s+calculators offered", text)
    if not m:
        failures.append("no 'N calculators offered' claim found")
    else:
        claimed = int(m.group(1).replace(",", ""))
        if claimed != len(in_scope):
            failures.append(
                f"claims {claimed} calculators offered, registry has {len(in_scope)} in scope "
                f"({len(in_scope) - claimed:+d}) — run scripts/sync_llms_txt.py"
            )

    # 3. listed calculator URLs must be real, in-scope slugs. Scope the scan to the
    # calculator SECTION — other sections legitimately list hubs like /states, and a
    # sitewide `^- …: url$` match flagged that as a bad slug on the first run.
    sec = re.search(r"(?ms)^## (?:Core tools|Calculators)\n(.*?)(?=^## )", text)
    listed = re.findall(r"^- .*?: https://usmoneyhq\.com/([a-z0-9\-]+)$", sec.group(1), re.M) if sec else []
    if not listed:
        failures.append("calculator list is empty or the section heading is missing")
    in_scope_set = set(in_scope)
    for slug in listed:
        if slug not in in_scope_set:
            failures.append(f"advertises /{slug} which is not an in-scope tool")

    # 4. nothing out of scope may be advertised as a calculator entry anywhere
    for slug in sorted(out_of_scope):
        if re.search(rf"usmoneyhq\.com/{re.escape(slug)}(?![a-z0-9\-])", text):
            failures.append(f"advertises out-of-scope /{slug}")

    if failures:
        print(f"LLMS.TXT CLAIM CHECK — FAIL ({len(failures)})")
        for f in failures:
            print(f"  FAIL {f}")
        return 1

    print(
        f"LLMS.TXT CLAIM CHECK — OK: {len(in_scope)} in-scope calculators listed, "
        f"{pages} indexable pages asserted (source: {'live sitemap' if live else 'built sitemap'})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
