#!/usr/bin/env python3
"""backlink_kit.py — US Money HQ backlink acquisition kit.

Generates a prospect list + personalized outreach email drafts for link building.
Sends NOTHING — drafts are for manual sending (automated link emails = spam folder).

Usage: python3 scripts/backlink_kit.py
Output: backlinks/OUTREACH_KIT.md  (prospects + 4 email templates)
"""
import os
from datetime import date

SITE = "usmoneyhq.com"
BRAND = "US Money HQ"
OUT = os.path.join(os.path.dirname(__file__), "..", "backlinks", "OUTREACH_KIT.md")

# Target categories + the search queries used to find real prospects
PROSPECT_CATEGORIES = [
    ("Calculator roundup posts", "best financial calculators OR free mortgage calculator list", "30-40% open-friendly"),
    ("Personal finance blogs", "\"calculator\" site:blog + personal finance resources page", "Resource page add"),
    ("University .edu finance pages", "site:.edu financial calculator resources", "High authority, slow"),
    ("Money/career communities", "salary calculator tools list", "Guest post or roundup"),
    ("Comparison/review sites", "best money tools 2026", "They curate lists"),
    ("Tool directories", "free online tools directory finance", "Easy wins, low value"),
]

TEMPLATES = {
    "resource": """Subject: Free calculator to add to your [PAGE] resource list

Hi [NAME],

I noticed your [PAGE] page lists free money tools for your readers. I run {Brand} ({site}) — 30 free calculators including mortgage, salary-after-tax, TDEE, and compound interest. All run instantly in-browser, no sign-up, no data collected.

If it's a fit, I'd love to be added to your list. Happy to tailor the description to your audience.

Either way, thanks for the great resource.

[YOUR NAME]
{Brand} — {site}""".format(Brand=BRAND, site=SITE),

    "unlinked": """Subject: Quick fix — unlinked mention of {site}

Hi [NAME],

You mention {site}/[BRAND] on your [PAGE] page but it's not linked. Would you add the link? It points to our mortgage calculator:

https://usmoneyhq.com/mortgage-calculator

Takes 10 seconds. Thanks!""".format(site=SITE, Brand=BRAND),

    "roundup": """Subject: Free calculator for your next tools roundup

Hi [NAME],

Writing a roundup of free financial tools? [BRAND] just launched 30 in-browser calculators — mortgage, salary by state, debt payoff, TDEE, concrete, and more. Zero sign-up, works on mobile.

If you include us, I can share a custom summary your readers would find useful.

Thanks,
[YOUR NAME]
{site}""".format(site=SITE, Brand=BRAND),

    "guest": """Subject: Guest post idea for [BLOG]

Hi [NAME],

I follow [BLOG] and have a data-backed post idea: "The Real Cost of a $400K Mortgage in 2026" (or similar) — original numbers from our calculator data, useful to your readers.

Would that fit? Happy to write it to your standards.

[YOUR NAME]
{site}""".format(site=SITE),
}

def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    lines = []
    lines.append(f"# Backlink Outreach Kit — {BRAND}")
    lines.append(f"Generated: {date.today().isoformat()} | Target: 20-30 links in 90 days (Tier 1 easy wins first)")
    lines.append("")
    lines.append("## Tier 1 — Easy wins (week 1-2)")
    lines.append("- Free tool directories (50+): submit usmoneyhq.com once each")
    lines.append("- Profile links: Medium, Quora, GitHub, About.me, Pinterest bio -> site")
    lines.append("- Social signals: Pinterest pin every calculator (we already post daily)")
    lines.append("")
    lines.append("## Tier 2 — Outreach (week 2-12, send 10-15/week manually)")
    lines.append("")
    for name, query, note in PROSPECT_CATEGORIES:
        lines.append(f"### {name}")
        lines.append(f"- Find with: \"{query}\"")
        lines.append(f"- Note: {note}")
        lines.append("")
    lines.append("## Email Templates (personalize [NAME]/[PAGE]/[BLOG] before sending)")
    lines.append("")
    for key, body in TEMPLATES.items():
        lines.append(f"### {key}")
        lines.append("```")
        lines.append(body)
        lines.append("```")
        lines.append("")
    lines.append("## Cadence")
    lines.append("1. Week 1: directories + profiles (bulk, low value, fast)")
    lines.append("2. Week 2-6: 15 resource-page emails/week")
    lines.append("3. Week 4+: roundup + unlinked-mention emails")
    lines.append("4. Month 3: 3-5 guest posts on DR40+ personal finance blogs")
    lines.append("")
    lines.append("## Tracker")
    lines.append("| Date | Target | Type | Email | Status | Link? |")
    lines.append("|------|--------|------|-------|--------|-------|")
    with open(OUT, "w") as f:
        f.write("\n".join(lines))
    print(f"Written: {OUT}")
    print(f"Prospect categories: {len(PROSPECT_CATEGORIES)} | Email templates: {len(TEMPLATES)}")

if __name__ == "__main__":
    main()
