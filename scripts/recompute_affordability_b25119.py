#!/usr/bin/env python3
"""
recompute_affordability_b25119.py — fix the mixed-population ratio.

The previous study divided median home value (owner-occupied units, B25077) by median
household income (all households, including renters, B19013). A reviewer can dismiss that
in one line, and the review pass flagged it correctly.

B25119 is median household income BY TENURE: E001 all, E002 owner-occupied, E003 renter.
Using E002 puts both sides of the ratio on owner households, which is the defensible
comparison. The old figure is kept alongside so the change is visible rather than silent.
"""
import csv
import json
import os
import re
import subprocess

REPO = "/Users/ambusiness/us-calc-tools"
OLD = os.path.join(REPO, "data/metro-affordability.json")
OUT = os.path.join(REPO, "data/metro-affordability.json")
RAW = "/tmp/acs_b25119.dat"
URL = ("https://www2.census.gov/programs-surveys/acs/summary_file/2023/"
       "table-based-SF/data/5YRData/acsdt5y2023-b25119.dat")

if not (os.path.exists(RAW) and os.path.getsize(RAW) > 1_000_000):
    r = subprocess.run(["curl", "-s", "-m", "300", "-A", "Mozilla/5.0", "-o", RAW,
                        "-w", "%{http_code} %{size_download}", URL], capture_output=True, text=True)
    print("download:", r.stdout)
print("file size:", os.path.getsize(RAW))

owner = {}
with open(RAW, encoding="utf-8", errors="replace") as f:
    head = f.readline().strip().split("|")
    gi = head.index("GEO_ID")
    cols = {c: i for i, c in enumerate(head)}
    e_owner = next((i for c, i in cols.items() if re.fullmatch(r"B25119_E002", c)), None)
    e_all = next((i for c, i in cols.items() if re.fullmatch(r"B25119_E001", c)), None)
    print("owner-income column:", e_owner is not None, "| all-household column:", e_all is not None)
    for line in f:
        p = line.rstrip("\n").split("|")
        if len(p) <= max(gi, e_owner or 0):
            continue
        gid = p[gi]
        if not gid.startswith("1600000US"):
            continue
        try:
            ov = int(p[e_owner])
        except Exception:
            continue
        if ov <= 0:
            continue
        owner[gid.replace("1600000US", "")] = {
            "owner_income": ov,
            "all_income": int(p[e_all]) if e_all is not None and re.fullmatch(r"-?\d+", p[e_all].strip() or "") else None,
        }
print("places with owner-occupied income:", len(owner))

d = json.load(open(OLD))
rows, changed = [], 0
for m in d["metros"]:
    gid = m["place_geoid"]
    o = owner.get(gid)
    if not o:
        continue
    home = m["median_home_value"]
    old_ratio = m["price_to_income"]
    new_ratio = round(home / o["owner_income"], 2)
    if new_ratio != old_ratio:
        changed += 1
    rows.append({
        "metro": m["metro"], "state": m["state"], "place_geoid": gid,
        "median_home_value": home,
        "owner_median_income": o["owner_income"],
        "all_household_median_income": m["median_household_income"],
        "price_to_income": new_ratio,
        "price_to_income_all_households": old_ratio,
    })

rows.sort(key=lambda r: -r["price_to_income"])
d["_meta"]["method"] = (
    "Median home value (B25077, owner-occupied units) divided by median household income "
    "for OWNER-OCCUPIED households (B25119_E002). Both sides describe owners, which is the "
    "defensible comparison; the earlier version divided by all households including renters "
    "and is retained as price_to_income_all_households for transparency.")
d["_meta"]["tables"] = {"median_home_value": "B25077", "owner_median_income": "B25119_E002",
                        "all_household_income": "B19013"}
d["_meta"]["url_owner_income"] = URL
d["_meta"]["revised"] = "2026-10-30"
d["metros"] = rows
json.dump(d, open(OUT, "w"), indent=1)
print("metros:", len(rows), "| ratios changed:", changed)
print("\ntop 6 (owner-based):")
for r in rows[:6]:
    print("  %-14s %-12s %.2fx  (was %.2fx on all-household income)"
          % (r["metro"][:14], r["state"][:12], r["price_to_income"], r["price_to_income_all_households"]))
print("\nbottom 3:")
for r in rows[-3:]:
    print("  %-14s %-12s %.2fx" % (r["metro"][:14], r["state"][:12], r["price_to_income"]))
