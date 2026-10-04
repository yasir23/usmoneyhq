#!/usr/bin/env python3
"""
thin_breakdown.py — group the heartbeat's THIN_CONTENT findings so the fix
targets the pages that matter.

WHY IT READS --json AND NOT THE PROSE
The first version of this parsed the heartbeat's human-readable output, which
truncates each category at three examples ("... +107 more"). It therefore reported
"THIN PAGES: 3" against a real total of 110 — an undercount of 97%, and it looked
like a clean result. A reporting tool that silently shows a fraction of its input is
worse than no tool, because it turns a large problem into an apparent small one.

--json emits every finding, so there is exactly one definition of "thin" (the
heartbeat's) and this script only groups it. No re-implementation, no drift.
"""
import json
import re
import subprocess
import sys
from collections import Counter, defaultdict

HB = "/Users/ambusiness/us-calc-tools/site_integrity_heartbeat.py"


def load():
    out = subprocess.run(
        ["/usr/local/bin/python3", HB, "--json"],
        capture_output=True, text=True, timeout=900,
    ).stdout
    try:
        return json.loads(out)
    except json.JSONDecodeError as e:
        sys.exit(f"heartbeat --json did not return JSON ({e}). First 400 chars:\n{out[:400]}")


def main():
    data = load()
    findings = data.get("findings", [])
    pat = re.compile(r"^(/\S+):\s+(\d+)\s+words")

    rows = []
    for f in findings:
        if f.get("check") != "THIN_CONTENT":
            continue
        m = pat.match(f.get("detail", ""))
        if m:
            rows.append((f.get("site", "?"), m.group(1), int(m.group(2))))

    print(f"TOTAL FINDINGS : {len(findings)}")
    print(f"THIN_CONTENT   : {len(rows)}")
    if not rows:
        return

    print("\nBY SITE")
    for s, n in Counter(r[0] for r in rows).most_common():
        print(f"  {s:<28} {n}")

    print("\nBY SITE + PATH PREFIX")
    g = defaultdict(list)
    for site, path, w in rows:
        parts = path.strip("/").split("/")
        key = "/" + parts[0] + "/*" if len(parts) > 1 else path
        g[(site, key)].append(w)
    for (site, key), ws in sorted(g.items(), key=lambda kv: -len(kv[1]))[:14]:
        print(f"  {site:<28} {key:<26} {len(ws):>4} pages  {min(ws)}-{max(ws)} words")

    near = sorted([r for r in rows if r[2] >= 390], key=lambda r: -r[2])
    print(f"\nNEAREST MISSES (>=390 words, cheapest to fix): {len(near)}")
    for site, path, w in near[:12]:
        print(f"  {w:>4}  {site}{path}")

    print(f"\nTHINNEST (hardest):   ")
    for site, path, w in sorted(rows, key=lambda r: r[2])[:8]:
        print(f"  {w:>4}  {site}{path}")


if __name__ == "__main__":
    main()
