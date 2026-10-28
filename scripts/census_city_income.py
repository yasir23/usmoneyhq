#!/usr/bin/env python3
"""
census_city_income.py — real median household income for each of our 50 metros,
sourced from the Census, no API key.

Why city and not metro: ACS table B19013 in the table-based summary file carries
place-level rows (GEO_ID 1600000US) but no CBSA rows. Our metro pages are named
after their principal city anyway, so place-level is the correct join.

This is the fact that makes a metro page genuinely unique instead of a template
with a city name swapped in — which is the standard this repo set for switching
on any variant family.

Sources (both public, no key):
  ACS 2023 5-year, B19013  .../5YRData/acsdt5y2023-b19013.dat
  2023 Gazetteer places     .../2023_Gazetteer/2023_Gaz_place_national.zip
"""
import csv
import io
import json
import os
import re
import subprocess
import sys
import urllib.request
import zipfile

REPO = "/Users/ambusiness/us-calc-tools"
DAT = "/tmp/acs_b19013.dat"
GAZ = "/tmp/2023_Gaz_place_national.zip"
OUT = os.path.join(REPO, "data/metro-income.json")
METROS = os.path.join(REPO, "public/data/take-home-pay.json")

ACS_URL = ("https://www2.census.gov/programs-surveys/acs/summary_file/2023/"
           "table-based-SF/data/5YRData/acsdt5y2023-b19013.dat")
GAZ_URL = ("https://www2.census.gov/geo/docs/maps-data/data/gazetteer/"
           "2023_Gazetteer/2023_Gaz_place_national.zip")


def need(path, url, minimum=100_000):
    if os.path.exists(path) and os.path.getsize(path) >= minimum:
        return
    print("downloading", url.split("/")[-1])
    subprocess.run(["curl", "-s", "-m", "300", "-A", "Mozilla/5.0", "-o", path, url],
                   check=False)


def load_places():
    """GEOID -> (city, state_code) from the places gazetteer.

    The gazetteer carries the state as a USPS code column, not inside NAME, so the
    name is stripped of its type suffix ("city", "CDP", ...) and paired with USPS.
    """
    z = zipfile.ZipFile(GAZ)
    name = next(n for n in z.namelist() if n.lower().endswith(".txt"))
    text = z.read(name).decode("latin-1")
    out = {}
    for r in csv.DictReader(io.StringIO(text), delimiter="\t"):
        gid = (r.get("GEOID") or "").strip()
        usps = (r.get("USPS") or "").strip()
        nm = (r.get("NAME") or "").strip()
        if not (gid and usps and nm):
            continue
        city = re.sub(r"\s+(city|town|village|CDP|municipality|borough|urban county|"
                      r"consolidated government|metropolitan government|unified government)$",
                      "", nm, flags=re.I).strip()
        out[gid] = (city, usps)
    return out


def load_income():
    """GEOID -> median household income, for place-level rows only."""
    out = {}
    with open(DAT, encoding="utf-8", errors="replace") as f:
        head = f.readline().strip().split("|")
        gi = head.index("GEO_ID")
        ei = next(i for i, c in enumerate(head) if re.fullmatch(r"B19013_E\d+", c))
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
    need(DAT, ACS_URL, 1_000_000)
    need(GAZ, GAZ_URL, 100_000)

    places = load_places()
    income = load_income()
    print("places in gazetteer:", len(places), "| places with income:", len(income))

    metros = json.load(open(METROS))["metros"]
    STATE_CODE = {
        "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
        "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
        "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
        "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
        "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
        "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
        "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
        "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
        "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
        "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
        "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
        "District Of Columbia": "DC",
    }
    index = {}
    for gid, (city, code) in places.items():
        index.setdefault((city.lower(), code), gid)

    found, missing = [], []
    for m in metros:
        _st = (m.get("state") or "").strip()
        code = STATE_CODE.get(_st) or STATE_CODE.get(_st.title()) or _st
        key = ((m.get("metro") or "").strip().lower(), code)
        gid = index.get(key)
        if not gid:
            # fallback: consolidated-city names ("Nashville-Davidson ...", "St. Louis")
            ALIAS = {"washington dc": "washington", "washington, dc": "washington"}
            _m = (m.get("metro") or "").lower()
            want = re.sub(r"[^a-z]", "", ALIAS.get(_m, _m))
            for gg, (city, code) in places.items():
                if code != key[1] or gg not in income:
                    continue
                have = re.sub(r"[^a-z]", "", city.lower())
                if have.startswith(want) or want.startswith(have):
                    gid = gg
                    break
        val = income.get(gid) if gid else None
        if val:
            found.append({
                "metro": m.get("metro"), "state": m.get("state"),
                "place_geoid": gid,
                "median_household_income": val,
            })
        else:
            missing.append("%s, %s" % (m.get("metro"), m.get("state")))

    print("matched metros: %d | unmatched: %d" % (len(found), len(missing)))
    if missing:
        print("unmatched:", ", ".join(missing[:8]))

    payload = {
        "_meta": {
            "source": "US Census Bureau, ACS 2023 5-year estimates, table B19013 "
                      "(Median Household Income), place level",
            "acs_url": ACS_URL,
            "gazetteer_url": GAZ_URL,
            "retrieved": "2026-10-27",
            "join": "Gazetteer place name + state -> ACS GEO_ID 1600000US + place code",
            "why": "Each metro page can state a sourced income figure that differs from "
                   "every other metro in the same state. Without a per-entity fact like "
                   "this, sibling pages measure 83-99.6% identical and must stay noindex.",
        },
        "metros": found,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(payload, open(OUT, "w"), indent=1)
    print("wrote", OUT)

    vals = [f["median_household_income"] for f in found]
    print("\ndistinct income values: %d of %d metros" % (len(set(vals)), len(vals)))
    for f in sorted(found, key=lambda x: -x["median_household_income"])[:5]:
        print("  %-16s %-14s $%s" % (f["metro"][:16], f["state"][:14],
                                     format(f["median_household_income"], ",")))


if __name__ == "__main__":
    main()
