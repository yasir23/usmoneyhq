#!/usr/bin/env python3
"""keyword_research.py — per-tool keyword research for US Money HQ.
Harvests real Google autocomplete suggestions (free, no API key) for all 64
calculator slugs, then writes keywords/KEYWORD_RESEARCH.md with short-tail +
long-tail keyword lists per tool.

Usage: python3 scripts/keyword_research.py
"""
import json
import os
import re
import time
import urllib.parse
import urllib.request

# slug -> primary search phrase (short-tail)
TOOLS = {
    "mortgage-calculator": ["mortgage calculator", "home loan calculator"],
    "auto-loan-calculator": ["auto loan calculator", "car payment calculator"],
    "salary-after-tax-calculator": ["salary after tax calculator", "take home pay calculator"],
    "paycheck-calculator": ["paycheck calculator", "paycheck tax calculator"],
    "debt-payoff-calculator": ["debt payoff calculator", "debt repayment calculator"],
    "dti-calculator": ["debt to income ratio calculator", "dti calculator"],
    "pmi-calculator": ["pmi calculator", "private mortgage insurance calculator"],
    "heloc-calculator": ["heloc calculator", "home equity line of credit calculator"],
    "refinance-calculator": ["refinance calculator", "mortgage refinance calculator"],
    "retirement-calculator": ["retirement calculator", "retirement savings calculator"],
    "tax-calculator": ["tax calculator", "income tax calculator"],
    "credit-card-payoff-calculator": ["credit card payoff calculator", "credit card payment calculator"],
    "child-support-calculator": ["child support calculator", "child support estimate calculator"],
    "concrete-calculator": ["concrete calculator", "concrete yard calculator"],
    "tdee-calculator": ["tdee calculator", "maintenance calories calculator"],
    "water-intake-calculator": ["water intake calculator", "how much water should i drink"],
    "sleep-calculator": ["sleep calculator", "what time should i go to bed"],
    "body-fat-calculator": ["body fat calculator", "body fat percentage calculator"],
    "paint-calculator": ["paint calculator", "how much paint do i need"],
    "mulch-calculator": ["mulch calculator", "how much mulch do i need"],
    "salary-percentile-calculator": ["salary percentile calculator", "income percentile calculator"],
    "home-affordability-calculator": ["how much house can i afford", "home affordability calculator"],
    "gpa-calculator": ["gpa calculator", "college gpa calculator"],
    "due-date-calculator": ["due date calculator", "pregnancy due date calculator"],
    "grade-calculator": ["final grade calculator", "grade calculator"],
    "percentage-calculator": ["percentage calculator", "percent calculator"],
    "compound-interest-calculator": ["compound interest calculator", "compound interest formula"],
    "cd-calculator": ["cd calculator", "certificate of deposit calculator"],
    "overtime-calculator": ["overtime calculator", "time and a half calculator"],
    "tip-calculator": ["tip calculator", "gratuity calculator"],
    "student-loan-calculator": ["student loan calculator", "student loan payment calculator"],
    "loan-calculator": ["loan calculator", "personal loan calculator"],
    "savings-goal-calculator": ["savings calculator", "savings goal calculator"],
    "net-worth-calculator": ["net worth calculator", "calculate my net worth"],
    "hourly-to-salary-calculator": ["hourly to salary calculator", "hourly to annual calculator"],
    "gas-cost-calculator": ["gas cost calculator", "trip gas calculator"],
    "square-footage-calculator": ["square footage calculator", "square feet calculator"],
    "electricity-cost-calculator": ["electricity cost calculator", "appliance electricity calculator"],
    "bmi-calculator": ["bmi calculator", "body mass index calculator"],
    "simple-interest-calculator": ["simple interest calculator", "simple interest loan calculator"],
    "budget-calculator": ["budget calculator", "50 30 20 calculator"],
    "discount-calculator": ["discount calculator", "percent off calculator"],
    "sales-tax-calculator": ["sales tax calculator", "sales tax calculator by state"],
    "inflation-calculator": ["inflation calculator", "inflation rate calculator"],
    "miles-per-gallon-calculator": ["mpg calculator", "miles per gallon calculator"],
    "rent-vs-buy-calculator": ["rent vs buy calculator", "rent vs buy a house"],
    "401k-calculator": ["401k calculator", "401k contribution calculator"],
    "emergency-fund-calculator": ["emergency fund calculator", "emergency savings calculator"],
    "closing-costs-calculator": ["closing costs calculator", "home closing cost calculator"],
    "car-affordability-calculator": ["car affordability calculator", "how much car can i afford"],
    "dividend-calculator": ["dividend calculator", "dividend income calculator"],
    "property-tax-calculator": ["property tax calculator", "property tax estimator"],
    "capital-gains-calculator": ["capital gains tax calculator", "capital gains calculator"],
    "salary-to-hourly-calculator": ["salary to hourly calculator", "annual to hourly calculator"],
    "amortization-schedule-calculator": ["amortization calculator", "amortization schedule calculator"],
    "roi-calculator": ["roi calculator", "return on investment calculator"],
    "markup-calculator": ["markup calculator", "markup percentage calculator"],
    "margin-calculator": ["margin calculator", "profit margin calculator"],
    "529-calculator": ["529 calculator", "college savings calculator"],
    "home-equity-calculator": ["home equity calculator", "home equity loan calculator"],
    "tax-bracket-calculator": ["tax bracket calculator", "marginal tax rate calculator"],
    "investment-calculator": ["investment calculator", "stock investment calculator"],
    "rule-of-72-calculator": ["rule of 72", "rule of 72 calculator"],
    "salary-raise-calculator": ["salary raise calculator", "pay raise calculator"],
}


def suggest(q: str) -> list:
    url = "https://suggestqueries.google.com/complete/search?client=firefox&q=" + urllib.parse.quote(q)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        raw = urllib.request.urlopen(req, timeout=8).read().decode("utf-8", "ignore")
        data = json.loads(raw)
        return [s for s in data[1] if isinstance(s, str)]
    except Exception:
        return []


def main():
    out = ["# US Money HQ — Keyword Research (per tool)", "", "Harvested from Google autocomplete. Short-tail = primary target; long-tail = secondary pages/content angles.", ""]
    total = 0
    for slug, heads in TOOLS.items():
        out.append(f"## {slug}")
        out.append("")
        out.append("Short-tail: " + " | ".join(heads))
        long = []
        for h in heads[:1]:
            for variant in [h, h + " 2026", h + " how much", h + " free", h + " with taxes"]:
                for s in suggest(variant):
                    s2 = s.lower().strip()
                    if s2 not in long and len(s2) > len(h):
                        long.append(s2)
                    elif s2 not in long:
                        long.append(s2)
                time.sleep(0.25)
        out.append("Long-tail (autocomplete):")
        for k in long[:20]:
            out.append(f"- {k}")
        out.append("")
        total += len(long)
    os.makedirs("keywords", exist_ok=True)
    with open("keywords/KEYWORD_RESEARCH.md", "w") as f:
        f.write("\n".join(out))
    print(f"Wrote keywords/KEYWORD_RESEARCH.md — {len(TOOLS)} tools, {total} long-tail keywords")


if __name__ == "__main__":
    main()
