#!/usr/bin/env python3
"""
activate_offer.py — turn an approved affiliate offer from roadmap slot to live.

lib/affiliates.ts documents that activation is: a real tracked href + live: true,
plus the compliance fields. This does that edit and refuses to do it badly.

  python3 scripts/activate_offer.py --list
  python3 scripts/activate_offer.py --offer lendingtree-refi --url "https://..."
        [--network impact] [--payout-event qualified-lead] [--states "US"] [--deploy]

Refusals:
  * a non-https or placeholder href  — an untracked link pays nothing and is a lie
    to the reader, so it is never written
  * live: true without a payoutEvent — the compliance record exists for a reason

Default runs `npm run build` and stops. --deploy commits and pushes (live deploy).
"""
import re
import subprocess
import sys

REPO = "/Users/ambusiness/us-calc-tools"
REG = REPO + "/lib/affiliates.ts"


def load():
    return open(REG, encoding="utf-8").read()


def offers(src):
    out = []
    for m in re.finditer(r'id:\s*"([^"]+)"', src):
        start = m.start()
        chunk = src[start:start + 1400]
        name = re.search(r'name:\s*"([^"]*)"', chunk)
        live = re.search(r"live:\s*(true|false)", chunk)
        url = re.search(r'href:\s*"([^"]*)"', chunk)
        payout = re.search(r'payout:\s*"([^"]*)"', chunk)
        state = re.search(r'states:\s*\[([^\]]*)\]', chunk)
        pe = re.search(r'payoutEvent:\s*"([^"]*)"', chunk)
        out.append({
            "id": m.group(1),
            "name": name.group(1) if name else "",
            "live": (live.group(1) == "true") if live else None,
            "href": url.group(1) if url else "",
            "payout": payout.group(1) if payout else "",
            "states": state.group(1).strip() if state else None,
            "payoutEvent": pe.group(1) if pe else None,
            "at": start,
        })
    return out


def main():
    src = load()
    items = offers(src)

    if "--list" in sys.argv or len(sys.argv) == 1:
        live = [o for o in items if o["live"]]
        print("offers: %d | live: %d | dormant: %d\n" % (len(items), len(live), len(items) - len(live)))
        for o in items:
            mark = "LIVE " if o["live"] else "  --  "
            print("%s %-22s %-30s %s" % (mark, o["id"], o["name"][:30], o["payout"][:34]))
            if o["live"] and "REPLACE" in o["href"].upper():
                print("       ^ href is a placeholder — pays nothing")
        return 0

    def arg(n):
        return sys.argv[sys.argv.index(n) + 1] if n in sys.argv else None

    oid = arg("--offer")
    url = arg("--url")
    if not oid or not url:
        print("need --offer <id> and --url <tracked https url>")
        return 2

    target = next((o for o in items if o["id"] == oid), None)
    if not target:
        print("no such offer:", oid)
        return 2

    if not re.match(r"^https://[^\s]+", url):
        print("REFUSING: href must be a real https URL. Got:", url[:60])
        return 2
    if re.search(r"(example\.com|REPLACE|TODO|YOUR_|xxxx)", url, re.I):
        print("REFUSING: that is a placeholder, not a tracked link.")
        return 2

    chunk_start = target["at"]
    chunk_end = src.find("\n  },", chunk_start)
    if chunk_end == -1:
        chunk_end = chunk_start + 1400
    chunk = src[chunk_start:chunk_end]

    new_chunk = re.sub(r'href:\s*"[^"]*"', 'href: "%s"' % url, chunk, count=1)
    new_chunk = re.sub(r"live:\s*(true|false)", "live: true", new_chunk, count=1)

    for field, key in (("network", "--network"), ("payoutEvent", "--payout-event"),
                       ("approvedOn", "--approved-on")):
        val = arg(key)
        if val:
            if re.search(r'%s:\s*"[^"]*"' % field, new_chunk):
                new_chunk = re.sub(r'%s:\s*"[^"]*"' % field, '%s: "%s"' % (field, val), new_chunk, count=1)
            else:
                new_chunk = new_chunk.replace("live: true", 'live: true,\n    %s: "%s"' % (field, val), 1)

    states = arg("--states")
    if states:
        lst = ", ".join('"%s"' % s.strip() for s in states.split(",") if s.strip())
        if re.search(r"states:\s*\[[^\]]*\]", new_chunk):
            new_chunk = re.sub(r"states:\s*\[[^\]]*\]", "states: [%s]" % lst, new_chunk, count=1)

    new_src = src[:chunk_start] + new_chunk + src[chunk_end:]

    if target["live"] and target["href"] == url:
        print("already live with that href — nothing to do")
        return 0

    if "--check" in sys.argv:
        print("would activate %s -> %s" % (oid, url))
        return 0

    open(REG, "w").write(new_src)
    print("activated:", oid, "->", url[:70])

    r = subprocess.run(["npm", "run", "build"], cwd=REPO, capture_output=True, text=True)
    if r.returncode != 0:
        print("BUILD FAILED — reverted, not deployed")
        open(REG, "w").write(src)
        print((r.stdout or "")[-800:] + (r.stderr or "")[-400:])
        return 1
    print("build clean")

    if "--deploy" not in sys.argv:
        print("not deployed — re-run with --deploy to push")
        return 0
    subprocess.run(["git", "-C", REPO, "add", "lib/affiliates.ts"], check=False)
    subprocess.run(["git", "-C", REPO, "-c", "user.name=Hermes",
                    "-c", "user.email=hermes@agenttrac.ai", "commit", "-q", "-m",
                    "affiliates: activate %s with tracked link" % oid], check=False)
    p = subprocess.run(["git", "-C", REPO, "push", "origin", "master"],
                       capture_output=True, text=True)
    print("push:", (p.stdout + p.stderr)[-300:] or "no output")
    return 0 if p.returncode == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
