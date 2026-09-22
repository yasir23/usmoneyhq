#!/usr/bin/env python3
"""
revenue.py — the revenue ledger and the weekly scorecard.

Implements two things the 2026-09-22 strategy asks for:
  §3.5  "Create a revenue ledger with separate fields for AdSense, affiliate
         clicks, affiliate conversions, lead revenue, refunds, and net revenue."
  §8    the shared dashboard columns, and the §7 weekly operating cycle.

WHY A LEDGER RATHER THAN A SPREADSHEET
Every monetisation surface on this site reports somewhere else: AdSense in the
Google dashboard, affiliate in Impact, clicks in Cloudflare logs, and until
2026-09-22 affiliate clicks nowhere at all. No single place answered "what did
page X earn this week". Without that number the §7 cycle cannot run, because
every one of its decisions is "reinvest in the highest revenue per visitor".

DESIGN RULE: nothing here invents data. Columns that depend on a source we do
not control (GSC impressions, indexed status) stay EMPTY and are labelled, rather
than being filled with a zero. A zero reads as "measured, and there was nothing";
an empty reads as "not measured yet". Conflating those is how a dashboard becomes
confidently wrong.

USAGE
    python3 scripts/revenue.py init
    python3 scripts/revenue.py add --source affiliate --page mortgage-calculator \
        --clicks 12 --conversions 1 --gross 45.00
    python3 scripts/revenue.py add --source adsense --gross 8.42 --note "week 39"
    python3 scripts/revenue.py report
    python3 scripts/revenue.py scorecard --gsc gsc-export.csv --out scorecard.csv
"""

from __future__ import annotations

import argparse
import csv
import os
import sqlite3
import sys
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DB = os.environ.get("REVENUE_DB") or os.path.join(ROOT, "revenue.db")
PRIORITY = os.path.join(ROOT, "PRIORITY-50.csv")

SOURCES = ("adsense", "affiliate", "lead")

SCHEMA = """
CREATE TABLE IF NOT EXISTS revenue_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    day          TEXT NOT NULL,          -- ISO date the revenue relates to
    source       TEXT NOT NULL,          -- adsense | affiliate | lead
    offer_id     TEXT DEFAULT '',        -- affiliate/lead offers only
    page         TEXT DEFAULT '',        -- page slug, '' = sitewide
    clicks       INTEGER DEFAULT 0,
    conversions  INTEGER DEFAULT 0,
    gross_cents  INTEGER DEFAULT 0,      -- money in, before refunds
    refund_cents INTEGER DEFAULT 0,      -- money back out
    note         TEXT DEFAULT '',
    created      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_day ON revenue_events(day);
CREATE INDEX IF NOT EXISTS idx_page ON revenue_events(page);
"""


def connect() -> sqlite3.Connection:
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con


def cmd_init(args) -> int:
    con = connect()
    con.executescript(SCHEMA)
    con.commit()
    con.close()
    print(f"ledger ready: {DB}")
    print(f"sources: {', '.join(SOURCES)}")
    return 0


def money(text: str) -> int:
    """Parse a money value to cents. Refuses to guess."""
    cleaned = str(text).replace("$", "").replace(",", "").strip()
    if not cleaned:
        return 0
    try:
        return int(round(float(cleaned) * 100))
    except ValueError:
        raise SystemExit(f"not a money value: {text!r}") from None


def cmd_add(args) -> int:
    if args.source not in SOURCES:
        raise SystemExit(f"source must be one of: {', '.join(SOURCES)}")
    con = connect()
    con.executescript(SCHEMA)
    cur = con.execute(
        "INSERT INTO revenue_events (day, source, offer_id, page, clicks, conversions,"
        " gross_cents, refund_cents, note, created) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (args.day or date.today().isoformat(), args.source, args.offer_id or "",
         args.page or "", args.clicks, args.conversions, money(args.gross),
         money(args.refunds), args.note or "", date.today().isoformat()),
    )
    con.commit()
    net = money(args.gross) - money(args.refunds)
    print(f"logged #{cur.lastrowid}: {args.source} net ${net/100:,.2f}")
    con.close()
    return 0


def cmd_report(args) -> int:
    con = connect()
    con.executescript(SCHEMA)
    rows = con.execute(
        "SELECT source, SUM(clicks) c, SUM(conversions) v,"
        " SUM(gross_cents) g, SUM(refund_cents) r, COUNT(*) n"
        " FROM revenue_events WHERE day >= ? GROUP BY source ORDER BY source",
        ((date.today() - timedelta(days=args.days)).isoformat(),),
    ).fetchall()

    print(f"REVENUE LEDGER — last {args.days} days")
    print("=" * 68)
    if not rows:
        print("no entries. Nothing has been recorded yet — which is the honest")
        print("state, not a measurement of zero.")
        con.close()
        return 0

    print(f"{'SOURCE':<12}{'EVENTS':>7}{'CLICKS':>8}{'CONV':>6}{'GROSS':>11}{'REFUNDS':>10}{'NET':>11}")
    tg = tr = 0
    for r in rows:
        g, rf = r["g"] or 0, r["r"] or 0
        tg += g
        tr += rf
        print(f"{r['source']:<12}{r['n']:>7}{r['c'] or 0:>8}{r['v'] or 0:>6}"
              f"{g/100:>11,.2f}{rf/100:>10,.2f}{(g-rf)/100:>11,.2f}")
    print("-" * 68)
    print(f"{'TOTAL':<12}{'':>7}{'':>8}{'':>6}{tg/100:>11,.2f}{tr/100:>10,.2f}{(tg-tr)/100:>11,.2f}")

    # Per-page is where the §7 decisions actually get made.
    pages = con.execute(
        "SELECT page, SUM(gross_cents)-SUM(refund_cents) net FROM revenue_events"
        " WHERE day >= ? AND page != '' GROUP BY page HAVING net != 0"
        " ORDER BY net DESC LIMIT 15",
        ((date.today() - timedelta(days=args.days)).isoformat(),),
    ).fetchall()
    if pages:
        print("\nTOP PAGES BY NET REVENUE")
        for p in pages:
            print(f"  {(p['net'] or 0)/100:>10,.2f}  {p['page']}")
    else:
        print("\nNo per-page revenue yet. Until /api/go attributes a click to a page")
        print("AND a conversion is recorded, the §7 cycle has nothing to optimise.")

    con.close()
    return 0


def load_gsc(path: str) -> dict:
    """
    Read a Search Console export if one is present.

    Accepts the Pages export (top queries/pages CSV). Returns {page_path: row}.
    Returns {} when no file is given — never fabricates an impressions figure,
    because a fabricated zero and a real zero drive opposite decisions.
    """
    if not path:
        return {}
    if not os.path.exists(path):
        print(f"NOTE: GSC export {path} not found — impressions/indexed stay blank.")
        return {}
    out = {}
    with open(path, newline="", encoding="utf-8-sig") as fh:
        for row in csv.DictReader(fh):
            url = (row.get("Top pages") or row.get("Page") or row.get("url") or "").strip()
            if not url:
                continue
            key = url.replace("https://usmoneyhq.com", "").strip("/") or "(home)"
            out[key] = {
                "impressions": row.get("Impressions", ""),
                "clicks": row.get("Clicks", ""),
            }
    return out


def cmd_scorecard(args) -> int:
    """Emit the §8 columns. Blank means not measured — never a fake zero."""
    con = connect()
    con.executescript(SCHEMA)
    gsc = load_gsc(args.gsc)

    rev = {}
    for r in con.execute(
        "SELECT page, SUM(clicks) c, SUM(conversions) v,"
        " SUM(gross_cents)-SUM(refund_cents) net FROM revenue_events"
        " WHERE page != '' GROUP BY page"
    ):
        rev[r["page"]] = {"clicks": r["c"] or 0, "conv": r["v"] or 0, "net": (r["net"] or 0) / 100}
    con.close()

    seeds = []
    if os.path.exists(PRIORITY):
        with open(PRIORITY, newline="") as fh:
            for r in csv.DictReader(fh):
                seeds.append({"slug": r["tool_slug"], "intent": r["intent_score"]})
    else:
        print(f"NOTE: {PRIORITY} missing — run the priority ranking first.")

    cols = ["url", "topic", "intent", "index_status", "impressions", "clicks",
            "sessions", "calc_completions", "outbound_clicks", "leads",
            "conversion_rate", "revenue", "last_update", "owner", "next_experiment"]

    out_path = args.out or os.path.join(ROOT, "scorecard.csv")
    with open(out_path, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        for s in seeds[: args.limit]:
            slug = s["slug"]
            g = gsc.get(slug, {})
            r = rev.get(slug, {})
            conv = r.get("conv", 0)
            out_clicks = r.get("clicks", 0) or 0
            # Denominator must be the click count we actually control. Using GSC
            # clicks here left this column blank on every row that had real
            # affiliate clicks but no Search Console data — a rate that silently
            # never computes is worse than no column at all.
            denom = out_clicks or int(g.get("clicks") or 0)
            w.writerow({
                "url": f"https://usmoneyhq.com/{slug}",
                "topic": slug,
                "intent": s["intent"],
                "index_status": "measured in GSC" if gsc else "",
                "impressions": g.get("impressions", ""),
                "clicks": g.get("clicks", ""),
                "sessions": "",                       # needs the px beacon or GA4
                "calc_completions": "",               # needs a completion event
                "outbound_clicks": out_clicks or "",
                "leads": conv or "",
                "conversion_rate": (f"{conv/denom*100:.2f}%" if denom and conv else ""),
                "revenue": f"{r.get('net', 0):.2f}" if r.get("net") else "",
                "last_update": "", "owner": "",
                "next_experiment": "",
            })
    print(f"scorecard -> {out_path} ({min(len(seeds), args.limit)} rows)")
    print("Blank columns are NOT measured yet, not measured-as-zero.")
    print("  index_status/impressions  -> feed a Search Console export with --gsc")
    print("  sessions                  -> /api/px beacons (Cloudflare logs), or GA4")
    print("  calc_completions          -> /api/px rows with event=calc_complete")
    print("                               (fired on the first input change, once per")
    print("                               pageview). Not wired into this CSV yet —")
    print("                               export those rows and add them here.")
    return 0


def cmd_offers(args) -> int:
    """
    Per-offer economics — the numbers the 30-day test actually decides on.

    The strategy's rule is to keep only offers that produce acceptable NET
    revenue per qualified visitor, and explicitly warns that "a lower-paying
    offer with a strong approval rate can outperform a high-payout offer that
    rejects most traffic". Neither number is visible in the source or page
    reports, so this exists to make that comparison possible.

    Rates are blank when the denominator is zero, never 0%. A 0% approval rate
    and "no applications yet" are different facts and drive opposite decisions.
    """
    con = connect()
    con.executescript(SCHEMA)
    rows = con.execute(
        "SELECT offer_id, SUM(clicks) c, SUM(conversions) v, SUM(gross_cents) g,"
        " SUM(refund_cents) r FROM revenue_events"
        " WHERE day >= ? AND offer_id != '' GROUP BY offer_id ORDER BY offer_id",
        ((date.today() - timedelta(days=args.days)).isoformat(),),
    ).fetchall()

    print(f"OFFER ECONOMICS — last {args.days} days")
    print("=" * 92)
    if not rows:
        print("No offer rows recorded yet. Attribution exists (subId2 per page,")
        print("clicks logged to /api/go) but nothing has flowed through it.")
        con.close()
        return 0

    print(f"{'OFFER':<24}{'CLICKS':>7}{'CONV':>6}{'APPR%':>7}{'GROSS':>10}{'REFUNDS':>9}"
          f"{'NET':>10}{'NET/CLICK':>10}{'NET/QV':>9}")
    print("-" * 92)
    for r in rows:
        c, v = r["c"] or 0, r["v"] or 0
        g, rf = r["g"] or 0, r["r"] or 0
        net = g - rf
        appr = f"{v/c*100:.1f}%" if c else ""
        per_click = f"{net/c/100:.2f}" if c else ""
        per_qv = f"{net/v/100:.2f}" if v else ""
        print(f"{r['offer_id']:<24}{c:>7}{v:>6}{appr:>7}{g/100:>10,.2f}{rf/100:>9,.2f}"
              f"{net/100:>10,.2f}{per_click:>10}{per_qv:>9}")

    print("\nKEEP an offer only if NET/QV is acceptable — not if GROSS or the")
    print("advertised payout is large. Rank with rankOffers() in lib/affiliates.ts,")
    print("which reports an offer as unrankable rather than guessing its inputs.")
    con.close()
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(
        prog="revenue",
        description="revenue ledger and weekly scorecard for US Money HQ",
    )
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init").set_defaults(func=cmd_init)

    p = sub.add_parser("add")
    p.add_argument("--source", required=True)
    p.add_argument("--day", default="")
    p.add_argument("--offer-id", default="")
    p.add_argument("--page", default="")
    p.add_argument("--clicks", type=int, default=0)
    p.add_argument("--conversions", type=int, default=0)
    p.add_argument("--gross", default="0")
    p.add_argument("--refunds", default="0")
    p.add_argument("--note", default="")
    p.set_defaults(func=cmd_add)

    p = sub.add_parser("report")
    p.add_argument("--days", type=int, default=30)
    p.set_defaults(func=cmd_report)

    p = sub.add_parser("offers")
    p.add_argument("--days", type=int, default=30)
    p.set_defaults(func=cmd_offers)

    p = sub.add_parser("scorecard")
    p.add_argument("--gsc", default="")
    p.add_argument("--out", default="")
    p.add_argument("--limit", type=int, default=50)
    p.set_defaults(func=cmd_scorecard)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
