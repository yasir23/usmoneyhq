#!/usr/bin/env python3
"""
cfpb_aggregate.py — real complaint counts from the CFPB public bulk file.

Source: https://files.consumerfinance.gov/ccdb/complaints.csv.zip (reachable from this machine;
the CFPB API itself is Akamai-blocked here). Roughly 360 MB compressed.

What is produced: complaint counts by product and year, and by state for the mortgage and
credit-card products, restricted to 2023-2026. Nothing is estimated — every number is a row
count in the file. Aggregates land in data/cfpb-complaints.json for the guide to read at build
time.
"""
import collections
import csv
import io
import json
import os
import subprocess
import sys
import zipfile

URL = "https://files.consumerfinance.gov/ccdb/complaints.csv.zip"
ZIP = "/tmp/cfpb_complaints.zip"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "data", "cfpb-complaints.json")
YEARS = {"2023", "2024", "2025", "2026"}
KEEP = {"Credit card", "Credit card or prepaid card", "Mortgage", "Checking or savings account",
        "Debt collection", "Student loan", "Vehicle loan or lease", "Payday loan, title loan, "
        "personal loan, or advance loan", "Money transfer, virtual currency, or money service"}


def download():
    if os.path.exists(ZIP) and os.path.getsize(ZIP) > 300_000_000:
        print("zip present, %.0f MB" % (os.path.getsize(ZIP) / 1e6))
        return
    print("downloading %.0f MB ..." % 360)
    subprocess.run(["curl", "-sL", "-m", "1200", "-o", ZIP, URL], check=True)
    print("downloaded %.0f MB" % (os.path.getsize(ZIP) / 1e6))


def main():
    download()
    zf = zipfile.ZipFile(ZIP)
    name = zf.namelist()[0]
    print("member:", name)

    by_product_year = collections.Counter()
    by_state = collections.defaultdict(collections.Counter)
    by_product_company = collections.defaultdict(collections.Counter)
    issue_by_product = collections.defaultdict(collections.Counter)
    total = 0
    kept = 0

    with zf.open(name) as fh:
        rdr = csv.DictReader(io.TextIOWrapper(fh, encoding="utf-8", errors="replace"))
        for row in rdr:
            total += 1
            date = row.get("Date received") or row.get("Date Received") or ""
            year = date[:4]
            if year not in YEARS:
                continue
            product = (row.get("Product") or "").strip()
            if product not in KEEP:
                continue
            kept += 1
            by_product_year[(product, year)] += 1
            state = (row.get("State") or "").strip().upper()
            if state and len(state) == 2:
                by_state[product][state] += 1
            issue = (row.get("Issue") or "").strip()
            if issue:
                issue_by_product[product][issue] += 1
            if total % 500000 == 0:
                print("  scanned %d rows, kept %d" % (total, kept), flush=True)

    data = {
        "_meta": {
            "source": "CFPB Consumer Complaint Database bulk export",
            "url": URL,
            "retrieved": "2026-11-03",
            "method": "row counts by product and year; state counts restricted to 2-letter codes",
            "rows_scanned": total,
            "rows_counted": kept,
            "years": sorted(YEARS),
            "note": "Complaints are unverified allegations, not findings. Counts reflect volume, "
                    "not wrongdoing.",
        },
        "by_product_year": [{"product": p, "year": y, "complaints": n}
                            for (p, y), n in sorted(by_product_year.items())],
        "top_states": {p: c.most_common(10) for p, c in by_state.items()},
        "top_issues": {p: c.most_common(5) for p, c in issue_by_product.items()},
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(data, open(OUT, "w"), indent=1)
    print("wrote", OUT)
    print("products:", len(by_product_year))
    for (p, y), n in sorted(by_product_year.items(), key=lambda kv: -kv[1])[:12]:
        print("  %-28s %s %8d" % (p[:28], y, n))


if __name__ == "__main__":
    main()
