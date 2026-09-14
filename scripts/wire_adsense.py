#!/usr/bin/env python3
"""
wire_adsense.py — wire real AdSense ad-unit ids (and the GSC token) into the site.

WHY: ad slots shipped with slug-derived data-ad-slot values
("mortgage-calculator-top"), which match no AdSense ad unit, so no slot on any
page could fill. This script is the single, validated path to fix that — it
refuses to write a value that is not a real unit id, because that is exactly the
mistake that shipped and cost every impression.

USAGE
  # what is wired right now + is it live?
  python3 scripts/wire_adsense.py --check

  # preview the edit, change nothing
  python3 scripts/wire_adsense.py --top 1234567890 --mid 1234567891 --bottom 1234567892 --dry-run

  # do it: edit, test, build, commit, push, verify live
  python3 scripts/wire_adsense.py --top 1234567890 --mid 1234567891 --bottom 1234567892

  # GSC ownership token (separate concern, same trip)
  python3 scripts/wire_adsense.py --gsc-token AbC123...

WHERE THE IDS COME FROM
  AdSense -> Ads -> By ad unit -> Display ads -> Create.
  Use the NUMERIC id shown on the unit (~10 digits), NOT the unit's name.
  One unit per POSITION covers the whole site: units are site-wide, not per-URL.
"""
import argparse
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/Users/ambusiness/us-calc-tools")
ADS = ROOT / "lib" / "ads.ts"
VERIF = ROOT / "lib" / "verification.ts"

UNIT_RE = re.compile(r"^\d{6,}$")
VALID_POSITIONS = ("top", "mid", "bottom")


def run(cmd, **kw):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=str(ROOT), **kw)


def read(p):
    return p.read_text(encoding="utf-8")


def current_units():
    """Return {position: value} as currently written in lib/ads.ts."""
    txt = read(ADS)
    out = {}
    for p in VALID_POSITIONS:
        m = re.search(rf'^\s*{p}:\s*"([^"]*)"', txt, re.M)
        out[p] = m.group(1) if m else None
    return out


def current_gsc():
    m = re.search(r'GOOGLE_SITE_VERIFICATION\s*=\s*"([^"]*)"', read(VERIF))
    return m.group(1) if m else None


def live_state():
    """What the deployed site actually renders."""
    html = run("curl -s -A 'Mozilla/5.0' https://usmoneyhq.com/mortgage-calculator") .stdout
    slots = sorted(set(re.findall(r'data-ad-slot="([^"]*)"', html)))
    loader = bool(re.search(r"adsbygoogle\.js\?client=ca-pub-\d+", html))
    home = run("curl -s -A 'Mozilla/5.0' https://usmoneyhq.com/").stdout
    meta = bool(re.search(r"google-site-verification", home))
    return slots, loader, meta


def do_check():
    u = current_units()
    g = current_gsc()
    slots, loader, meta = live_state()
    print("=== repo (lib/ads.ts) ===")
    for p in VALID_POSITIONS:
        v = u.get(p) or ""
        ok = "OK numeric" if UNIT_RE.match(v) else "EMPTY (slots render nothing — safe)" if not v else "!! NOT A UNIT ID"
        print(f"  {p:7} = {v or '(empty)':12} {ok}")
    print(f"  GSC token: {g or '(empty)'}")
    print("\n=== live site ===")
    print(f"  ad-slot values in served HTML: {slots or 'none (expected while units are empty)'}")
    if slots:
        print(f"  numeric? {all(UNIT_RE.match(s) for s in slots)}")
    print(f"  AdSense loader present: {loader}")
    print(f"  google-site-verification meta: {meta}")
    print("\nVERDICT")
    if slots and all(UNIT_RE.match(s) for s in slots):
        print("  manual ad units are wired and live.")
    elif slots:
        print("  !! LIVE SLOTS ARE NON-NUMERIC — this is the dead-slot bug. Wire real unit ids.")
    else:
        print("  no manual ad units wired. Safe: loader present, Auto ads (if enabled) can fill.")
    if not meta:
        print("  GSC meta tag absent — Search Console is unverified, traffic is unmeasured.")
    return 0


def patch_units(ids, dry):
    txt = read(ADS)
    orig = txt
    for pos, val in ids.items():
        txt, n = re.subn(rf'(^\s*{pos}:\s*")[^"]*(")', rf'\g<1>{val}\g<2>', txt, count=1, flags=re.M)
        if n != 1:
            print(f"  !! could not find the `{pos}:` line in lib/ads.ts — aborting", file=sys.stderr)
            return False
    if txt == orig:
        print("  (no change — values identical)")
        return False
    if dry:
        print("  --- would write lib/ads.ts ---")
        for line in txt.splitlines():
            if re.match(r"\s*(top|mid|bottom):", line):
                print("   +" + line)
        return False
    ADS.write_text(txt, encoding="utf-8")
    print("  wrote lib/ads.ts")
    return True


def patch_gsc(token, dry):
    txt = read(VERIF)
    txt2, n = re.subn(r'(GOOGLE_SITE_VERIFICATION\s*=\s*")[^"]*(")', rf'\g<1>{token}\g<2>', txt)
    if n != 1:
        print("  !! could not find GOOGLE_SITE_VERIFICATION in lib/verification.ts", file=sys.stderr)
        return False
    if dry:
        print(f'  --- would set GOOGLE_SITE_VERIFICATION = "{token}" ---')
        return False
    VERIF.write_text(txt2, encoding="utf-8")
    print("  wrote lib/verification.ts")
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--top")
    ap.add_argument("--mid")
    ap.add_argument("--bottom")
    ap.add_argument("--gsc-token")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--skip-deploy", action="store_true")
    a = ap.parse_args()

    if a.check:
        return do_check()

    given = {k: v for k, v in (("top", a.top), ("mid", a.mid), ("bottom", a.bottom)) if v}
    if not given and not a.gsc_token:
        print("nothing to do. Pass --top/--mid/--bottom and/or --gsc-token, or use --check.")
        return 2

    # VALIDATE — refuse anything that is not a real unit id
    for pos, val in given.items():
        if not UNIT_RE.match(val.strip()):
            print(f"REFUSING: --{pos} '{val}' is not an ad unit id.", file=sys.stderr)
            print("  A unit id is the ~10-digit NUMBER on the unit in AdSense "
                  "(Ads -> By ad unit). A name like 'mortgage-calculator-top' matches "
                  "no unit and makes the slot permanently dead — that is the bug we are "
                  "fixing, so this script will not write it.", file=sys.stderr)
            return 2
    if a.gsc_token and not re.match(r"^[A-Za-z0-9_\-]{10,}$", a.gsc_token.strip()):
        print("REFUSING: --gsc-token does not look like a GSC content value.", file=sys.stderr)
        return 2

    print("=== planned change ===")
    for pos, val in given.items():
        print(f"  {pos:7} -> {val.strip()}")
    if a.gsc_token:
        print(f"  GSC token -> {a.gsc_token.strip()}")

    changed = False
    if given:
        changed |= patch_units({k: v.strip() for k, v in given.items()}, a.dry_run)
    if a.gsc_token:
        changed |= patch_gsc(a.gsc_token.strip(), a.dry_run)

    if a.dry_run:
        print("\ndry run — nothing written, nothing deployed.")
        return 0
    if not changed:
        print("\nnothing changed.")
        return 0

    if a.skip_deploy:
        print("\n--skip-deploy set; edit written only.")
        return 0

    print("\n=== tests ===")
    t = run("node lib/calc.test.ts")
    if "FAIL" in t.stdout or t.returncode != 0:
        print(t.stdout[-1500:]); print("TESTS FAILED — not deploying", file=sys.stderr); return 1
    print("  pass")

    print("\n=== build ===")
    b = run("npm run build")
    if b.returncode != 0:
        print(b.stdout[-2000:]); print("BUILD FAILED — not deploying", file=sys.stderr); return 1
    print("  clean")

    print("\n=== commit + push ===")
    msg = "AdSense: wire real ad unit ids" + (" + GSC verification token" if a.gsc_token else "")
    run(f'git add lib/ads.ts lib/verification.ts && git commit -q -m "{msg}"')
    p = run("git push origin master")
    print("  " + (p.stdout.strip().splitlines()[-1] if p.stdout.strip() else p.stderr.strip()[-200:]))

    print("\n=== verify live (waiting ~110s for Actions + CDN) ===")
    time.sleep(110)
    slots, loader, meta = live_state()
    ok = True
    if given:
        numeric = [s for s in slots if UNIT_RE.match(s)]
        print(f"  numeric ad-slot values live: {numeric or 'NONE'}")
        if not numeric:
            print("  !! slots not showing numeric ids yet — re-run --check in a couple of minutes")
            ok = False
    if a.gsc_token:
        print(f"  google-site-verification meta live: {meta}")
        if not meta:
            print("  !! meta tag not visible yet — re-run --check in a couple of minutes")
            ok = False
    print("  loader present:", loader)
    print("\n" + ("DONE — wired and live." if ok else "EDIT PUSHED — live check inconclusive, re-run --check."))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
