#!/usr/bin/env python3
"""
set_ad_units.py — wire real AdSense slot ids into lib/ads.ts and gate the deploy.

The moment AdSense approval lands, the remaining work is three numeric ids. This
removes the hand-editing and the chance of shipping a slug where an id belongs.

  python3 set_ad_units.py --top 1234567890 --mid 1234567891 --bottom 1234567892
  python3 set_ad_units.py --all 1234567890
  python3 set_ad_units.py --check          # report current state, change nothing

Default patches the file and runs `npm run build` (six verifiers). It does NOT
push. Add --deploy to commit and push after a clean build, which is a live deploy.

Refuses anything that is not a 6+ digit numeric id, because that is exactly how
this site previously rendered data-ad-slot="mortgage-calculator-top" on every page
while earning nothing.
"""
import re
import subprocess
import sys

REPO = "/Users/ambusiness/us-calc-tools"
ADS = REPO + "/lib/ads.ts"
POSITIONS = ("top", "mid", "bottom")


def current():
    src = open(ADS, encoding="utf-8").read()
    block = src.split("AD_UNITS", 1)[-1]
    found = dict(re.findall(r'^\s*(top|mid|bottom):\s*"([^"]*)"', block, re.M))
    return found


def arg(name):
    if name in sys.argv:
        i = sys.argv.index(name)
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return None


def main():
    cur = current()
    print("current AD_UNITS:", {k: (v or "(empty)") for k, v in cur.items()})

    if "--check" in sys.argv or len(sys.argv) == 1:
        filled = [k for k, v in cur.items() if re.fullmatch(r"\d{6,}", v or "")]
        print("filled: %d of %d" % (len(filled), len(POSITIONS)))
        print("state: %s" % ("WIRED — ads can serve" if filled else "NOT WIRED — site earns $0"))
        return 0

    values = {}
    if arg("--all"):
        v = arg("--all").strip()
        values = {p: v for p in POSITIONS}
    else:
        for p in POSITIONS:
            v = arg("--" + p)
            if not v:
                print("missing --%s (or use --all)" % p)
                return 2
            values[p] = v.strip()

    bad = [p for p, v in values.items() if not re.fullmatch(r"\d{6,}", v)]
    if bad:
        print("REFUSING: these are not numeric AdSense unit ids:", bad)
        print("A non-numeric slot matches no ad unit and renders nothing. This site has")
        print("already shipped slug-derived slots once; it will not happen again.")
        return 2

    src = open(ADS, encoding="utf-8").read()
    new = src
    for p in POSITIONS:
        new = re.sub(r'(\b%s:\s*)"[^"]*"' % p, r'\g<1>"%s"' % values[p], new, count=1)

    if new == src:
        print("no change written — pattern did not match, inspect lib/ads.ts")
        return 1

    open(ADS, "w").write(new)
    print("\npatched AD_UNITS:", values)
    print("now:", {k: v for k, v in current().items()})

    print("\nrunning the gate: npm run build")
    r = subprocess.run(["npm", "run", "build"], cwd=REPO, capture_output=True, text=True)
    tail = (r.stdout or "")[-1500:] + (r.stderr or "")[-800:]
    if r.returncode != 0:
        print("BUILD FAILED — not deployed. Tail:")
        print(tail[-1200:])
        return 1
    print("build clean (adsense_verify, claims_verify, verify_guides, next build,")
    print("static schema, llms.txt all passed)")

    if "--deploy" not in sys.argv:
        print("\nNot deployed. Review the diff, then re-run with --deploy to push.")
        return 0

    subprocess.run(["git", "-C", REPO, "add", "lib/ads.ts"], check=False)
    subprocess.run(["git", "-C", REPO, "-c", "user.name=Hermes",
                    "-c", "user.email=hermes@agenttrac.ai", "commit", "-q", "-m",
                    "ads: wire numeric AdSense unit ids (top/mid/bottom)\n\n"
                    "Slots were empty strings, so AdSlot rendered nothing and the site\n"
                    "could not earn regardless of traffic."], check=False)
    p = subprocess.run(["git", "-C", REPO, "push", "origin", "master"],
                       capture_output=True, text=True)
    print("push:", (p.stdout + p.stderr)[-400:] or "no output")
    print("GitHub Actions will build, hard-gate on live 200 + ads.txt, then IndexNow.")
    return 0 if p.returncode == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
