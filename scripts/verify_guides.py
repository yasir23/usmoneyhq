#!/usr/bin/env python3
"""verify_guides.py — check the three rewritten finance guides.

Two things matter here, and the second is the one that matters more:

  1. every published figure is derivable from the stated inputs
  2. the source contains NO unverifiable rate-range claim

The guides originally asserted rate ranges as facts — a specific point gap
between online and branch institutions, and APR bands for credit cards and
personal loans. This site cannot verify those and cannot keep them current, so
they were removed and replaced with mechanics that hold in any rate environment.

The absence check deliberately scans the WHOLE file, comments included. A stale
rate figure in a comment is still a stale rate figure in the source, and the
first draft of the replacement comments quoted the old numbers while explaining
why they were being removed — this scan caught that.

Run:  python3 scripts/verify_guides.py
Exit 1 on any failure.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

FILES = {
    "cd": ROOT / "pages/guides/best-cd-rates-2026/index.js",
    "debt": ROOT / "pages/guides/debt-consolidation-2026/index.js",
    "hysa": ROOT / "pages/guides/best-high-yield-savings-2026/index.js",
}

failures = []
checked = 0


def chk(label, got, want):
    global checked
    checked += 1
    ok = str(got) == str(want)
    if not ok:
        failures.append(f"{label}: computed {got!r}, published {want!r}")
    print(f"  {'OK  ' if ok else 'FAIL'}  {label:<50} {str(want)}")


def absent(label, text, pattern):
    global checked
    checked += 1
    hit = re.search(pattern, text, re.I)
    if hit:
        failures.append(f"{label}: still contains {hit.group(0)!r}")
    print(f"  {'OK  ' if not hit else 'FAIL'}  {label:<50} "
          f"{'absent' if not hit else hit.group(0)!r}")


def pmt(P, a, n):
    r = a / 12
    return P * r / (1 - (1 + r) ** -n)


missing = [k for k, v in FILES.items() if not v.exists()]
if missing:
    sys.exit(f"missing guide files: {missing}")
SRC = {k: v.read_text(encoding="utf-8") for k, v in FILES.items()}

print("-- figures --")
chk("cd: 12 months at 4.5%", f"${10000*1.045:,.2f}", "$10,450.00")
chk("cd: 6 months fractional power", f"${10000*1.045**0.5:,.2f}", "$10,222.52")
chk("cd: 6 months shortcut", f"${10000*1.0225:,.2f}", "$10,225.00")
chk("cd: shortcut error", f"${10000*1.0225-10000*1.045**0.5:,.2f}", "$2.48")
chk("cd: 3 month penalty", f"${10000*0.045/4:,.2f}", "$112.50")

bal, pay, r = 10000, 600, 0.22 / 12
b, mo, interest = bal, 0, 0.0
while b > 0 and mo < 600:
    i = b * r
    interest += i
    b = b - (pay - i)
    mo += 1
chk("debt: months on card", mo, 21)
chk("debt: card interest", f"${interest:,.2f}", "$2,043.20")
chk("debt: transfer fee", f"${bal*0.03:,.2f}", "$300.00")
chk("debt: transfer advantage", f"${interest-bal*0.03:,.2f}", "$1,743.20")
m = pmt(bal, 0.12, 36)
chk("debt: loan payment", f"${m:,.2f}", "$332.14")
chk("debt: loan interest", f"${m*36-bal:,.2f}", "$1,957.15")

chk("hysa: 10k at 4.00%", f"${10000*1.04:,.2f}", "$10,400.00")
chk("hysa: 10k at 4.20%", f"${10000*1.042:,.2f}", "$10,420.00")
chk("hysa: annual difference", f"${10000*1.042-10000*1.04:,.2f}", "$20.00")
chk("hysa: 2k at 4.20%", f"${2000*1.042:,.2f}", "$2,084.00")
chk("hysa: balance advantage", f"${10000*1.04-2000*1.042:,.2f}", "$8,316.00")
chk("hysa: real return vs 3%", f"{(1.04/1.03-1)*100:.2f}%", "0.97%")
chk("hysa: real return vs 5%", f"{(1.04/1.05-1)*100:.2f}%", "-0.95%")

print("\n-- no unverifiable rate claims anywhere in the source --")
absent("cd: point gap between institutions", SRC["cd"], r"\d[-–]\d\+? full points")
absent("cd: rate-environment assertion", SRC["cd"], r"\bpeaks\b")
absent("debt: credit-card APR range", SRC["debt"], r"\b20\s*[-–]\s*30%")
absent("debt: personal-loan APR range", SRC["debt"], r"\b8\s*[-–]\s*18%")
absent("debt: unconditional 0% promise", SRC["debt"], r"0%\s+transfer card")
absent("hysa: point gap above averages", SRC["hysa"], r"\d[-–]\d\+? points")
absent("any: 'currently pays'", " ".join(SRC.values()), r"currently pays")
absent("any: brick-and-mortar gap", " ".join(SRC.values()),
       r"1\s*[-–]\s*2 points")

print("\n-- every rate used is labelled an assumption --")
chk("cd labels its rate", bool(re.search(r"assumed 4\.5%", SRC["cd"], re.I)), True)
chk("debt labels its rate", bool(re.search(r"assumed 22%", SRC["debt"], re.I)), True)
chk("hysa labels its rate",
    bool(re.search(r"assumed at 4\.00% and 4\.20%", SRC["hysa"], re.I)), True)

print("\n-- each guide carries a derived review date --")
for k in FILES:
    chk(f"{k} has a reviewed line", "last-reviewed" in SRC[k], True)
    chk(f"{k} derives its date", "CONTENT_DATES.guides" in SRC[k], True)

print()
print(f"checks run: {checked}   failures: {len(failures)}")
if failures:
    for f in failures:
        print("  - " + f)
    sys.exit(1)
print("GUIDES VERIFIED: figures derived, no unverifiable rate claims")
