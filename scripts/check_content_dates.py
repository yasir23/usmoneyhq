#!/usr/bin/env python3
"""
check_content_dates.py — verify lib/content-dates.ts against real git history.

The sitemap's <lastmod> values are hand-maintained, and their whole value is that
they are TRUE. They silently drifted in both directions before this existed:

    guides   claimed 2026-09-18, actual 2026-09-11  (overstated freshness)
    legal    claimed 2026-09-08, actual 2026-08-28  (overstated freshness)
    metros   claimed 2026-09-18, actual 2026-09-22  (understated freshness)

A wrong date is worse than no date: absent <lastmod> means "unknown" to a crawler,
whereas a date that claims recent change and is false spends crawl budget on pages
that did not move, and one that understates hides real updates.

Usage:
    python3 scripts/check_content_dates.py           # exit 1 on drift
    python3 scripts/check_content_dates.py --table    # always print the comparison

DELIBERATELY NOT A BUILD GATE — do not wire this into `npm run build` or CI.
It is run by hand, and that is a decision rather than an omission.

This compares the maintained dates against the last commit touching each group's
paths. That is the right question, but it cannot tell a CONTENT change from any
other edit to a file in those paths. A whitespace fix, a comment, or a refactor
inside pages/guides moves git's date and would demand a <lastmod> bump — which is
exactly what lib/content-dates.ts forbids in its own header ("Do NOT move it
because code was deployed, a build ran, or a template was refactored").

So as a hard gate it would misfire on legitimate commits, and the usual response
to a gate that misfires is to weaken or skip it, which loses the check entirely.
It was unwired and unheard for long enough that three dates sat stale unnoticed
(2026-10-06); the fix for THAT is to actually run it, not to make it fail
deploys. Narrow its semantics to distinguish content edits from code edits before
promoting it to a gate.
"""
from __future__ import annotations

import argparse
import pathlib
import re
import subprocess
import sys

REPO = pathlib.Path(__file__).resolve().parent.parent
DATES_FILE = REPO / "lib" / "content-dates.ts"

# Which files carry the content for each group. This is the same mapping
# documented in content-dates.ts — keep the two in step.
GROUP_FILES = {
    "site": ["pages/about.js", "pages/methodology.js", "pages/index.js",
             "components/SiteShell.jsx"],
    "tools": ["lib/tools.ts", "lib/toolContent.ts"],
    "states": ["lib/states.ts", "lib/stateRates.ts"],
    "amounts": ["lib/amounts.ts"],
    "metros": ["lib/metros.ts"],
    "guides": ["pages/guides", "lib/guides.ts"],
    "legal": ["pages/privacy-policy.js", "pages/terms.js"],
}


def read_shipped() -> dict[str, str]:
    text = DATES_FILE.read_text(encoding="utf-8")
    block = re.search(r"export const CONTENT_DATES = \{(.*?)\} as const", text, re.S)
    if not block:
        print(f"FATAL: could not parse CONTENT_DATES from {DATES_FILE}")
        sys.exit(2)
    return {
        m.group(1): m.group(2)
        for m in re.finditer(r"(\w+)\s*:\s*\"([\d-]{10})\"", block.group(1))
    }


def git_date(paths: list[str]) -> str | None:
    existing = [p for p in paths if (REPO / p).exists()]
    if not existing:
        return None
    r = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", *existing],
        cwd=REPO, capture_output=True, text=True, timeout=60,
    )
    out = (r.stdout or "").strip().splitlines()
    return out[0] if out and r.returncode == 0 else None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--table", action="store_true", help="print every group")
    args = ap.parse_args()

    shipped = read_shipped()
    problems = []
    print("group      sitemap says   git says     status")
    print("-" * 52)
    for group, files in GROUP_FILES.items():
        claimed = shipped.get(group)
        actual = git_date(files)
        if claimed is None:
            status = "MISSING from content-dates.ts"
            problems.append((group, claimed, actual, status))
        elif actual is None:
            status = "no git history (skipped)"
        elif claimed == actual:
            status = "ok"
        elif claimed > actual:
            status = f"DRIFT: claims {claimed} but content last changed {actual} (overstated)"
            problems.append((group, claimed, actual, status))
        else:
            status = f"DRIFT: content changed {actual}, sitemap still says {claimed} (stale)"
            problems.append((group, claimed, actual, status))
        if args.table or status != "ok":
            print(f"{group:10} {str(claimed):14} {str(actual):12} {status}")

    print()
    if problems:
        print(f"{len(problems)} group(s) out of step with git history.")
        print("Fix by setting the real date in lib/content-dates.ts, or by moving the")
        print("content. Do NOT pick a date that merely looks better distributed.")
        return 1
    print("all content dates match git history")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
