#!/usr/bin/env python3
"""
affordability_study.py — median home value vs median household income, per metro.

Both figures come from the same ACS 2023 5-year release, place level, so the ratio
is like-for-like: no mixing of vintages, no vendor estimates, no rounding drift.

  B19013  median household income   (already pulled by census_city_income.py)
  B25077  median value of owner-occupied housing units

Output goes to data/metro-affordability.json, keyed the same way as
data/metro-income.json so the guide page can join on it.
"""
import csv
import io
import json
import os
import re
import subprocess
import sys
import zipfile

REPO = "/Users/ambusiness/us-calc-tools"
INCOME = os.path.join(REPO, "data/metro-income.json")
GAZ = "/tmp/2023_Gaz_place_national.zip"
OUT = os.path.join(REPO, "data/metro-affordability.json")
URL = ("https://www2.census.gov/programs-surveys/acs/summary_file/2023/"
       "table-based-SF/data/5YRData/acsdt5y2023-b25077.dat")
RAW = "/tmp/acs_b25077.dat"


def download():
    if os.path.exists(RAW) and os.path.getsize(RAW) > 1_000_000:
        return
    print("downloading B25077 ...")
    r = subprocess.run(["curl", "-s", "-m", "300", "-A", "Mozilla/5.0", "-o", RAW,
                        "-w", "%{http_code} %{size_download}", URL],
                       capture_output=True, text=True)
    print("  ", r.stdout)


def load_values():
    out = {}
    with open(RAW, encoding="utf-8", errors="replace") as f:
        head = f.readline().strip().split("|")
        gi = head.index("GEO_ID")
        ei = next(i for i, c in enumerate(head) if re.fullmatch(r"B25077_E\d+", c))
        for line in f:
            p = line.rstrip("\n").split("|")
            if len(p) <= max(gi, ei):
                continue
            gid = p[gi]
            if not gid.startswith("1600000US"):
                continue
            raw = p[ei].strip()
            if not re.fullmatch(r"-?\d+", raw or ""):
                continue
            v = int(raw)
            if v <= 0:
                continue
            out[gid.replace("1600000US", "")] = v
    return out


def main():
    if not os.path.exists(INCOME):
        print("run census_city_income.py first")
        return 1
    download()
    values = load_values()
    print("places with a median home value:", len(values))

    inc = json.load(open(INCOME))["metros"]
    rows = []
    for m in inc:
        gid = m["place_geoid"]
        home = values.get(gid)
        income = m["median_household_income"]
        if not home or not income:
            continue
        rows.append({
            "metro": m["metro"],
            "state": m["state"],
            "place_geoid": gid,
            "median_household_income": income,
            "median_home_value": home,
            "price_to_income": round(home / income, 2),
            "years_of_income": round(home / income, 1),
        })

    rows.sort(key=lambda r: -r["price_to_income"])
    payload = {
        "_meta": {
            "source": "US Census Bureau, ACS 2023 5-year estimates, place level",
            "tables": {"median_household_income": "B19013", "median_home_value": "B25077"},
            "url_income": "https://www2.census.gov/programs-surveys/acs/summary_file/2023/"
                          "table-based-SF/data/5YRData/acsdt5y2023-b19013.dat",
            "url_home_value": URL,
            "retrieved": "2026-10-29",
            "method": "median home value divided by median household income, same "
                      "release, same geography. No vendor estimates, no mixed vintages.",
            "caveat": "Median value and median income describe different households, "
                      "not the same household. The ratio is an area-level affordability "
                      "indicator, not a statement about any individual buyer.",
        },
        "metros": rows,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(payload, open(OUT, "w"), indent=1)
    print("wrote", OUT, "with", len(rows), "metros")

    print("\nleast affordable (price-to-income):")
    for r in rows[:6]:
        print("  %-16s %-14s %.2fx  ($%s home / $%s income)"
              % (r["metro"][:16], r["state"][:14], r["price_to_income"],
                 format(r["median_home_value"], ","),
                 format(r["median_household_income"], ",")))
    print("\nmost affordable:")
    for r in rows[-3:]:
        print("  %-16s %-14s %.2fx" % (r["metro"][:16], r["state"][:14], r["price_to_income"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
