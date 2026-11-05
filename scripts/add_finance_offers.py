#!/usr/bin/env python3
"""
add_finance_offers.py — extend the offer registry with the high-CPA finance programs.

Every entry added here is a ROADMAP SLOT: live:false, placeholder href, and an `apply` note
naming the network and program. Nothing renders until a tracked URL replaces the placeholder
and live flips to true — the rule the file header states and the reason six offers once
pointed at plain homepages and earned nothing.

program is "direct" for all of them on purpose: the union of program values is closed, and a
new network is a schema change, not a data change. The `network` compliance field carries the
real answer (impact, cj, flexoffers, quinstreet, marketcall, direct).
"""
import re

P = "lib/affiliates.ts"
s = open(P, encoding="utf-8").read()

NEW = [
    # id, name, blurb, network, payout, payoutEvent, apply, tools
    ("everquote-auto", "EverQuote", "Compare auto insurance quotes in one pass.", "impact",
     "$20-60 / qualified lead", "qualified-lead",
     "impact.com -> search EverQuote (also The Zebra, MediaAlpha for the same slot)",
     ["auto-loan-calculator", "dti-calculator"]),
    ("smartasset-advisor", "SmartAsset", "Match with a vetted financial advisor.", "direct",
     "$50-150 / qualified lead", "qualified-lead",
     "smartasset.com partner program (open application); EverQuote Advisor as fallback",
     ["retirement-calculator", "compound-interest-calculator"]),
    ("lendingclub-loan", "LendingClub", "Check a personal loan rate without a hard pull.", "impact",
     "$50-150 / funded loan", "funded-loan",
     "impact.com -> LendingClub; also CJ. Requires business entity + W-8BEN-E.",
     ["debt-payoff-calculator", "credit-card-payoff-calculator"]),
    ("rocket-mortgage", "Rocket Mortgage", "Get a refinance quote in minutes.", "cj",
     "$50-200 / funded loan", "funded-loan",
     "cj.com -> Rocket Mortgage (Quicken Loans). Mortgage leads are state-restricted; declare states.",
     ["mortgage-calculator", "refinance-calculator", "home-affordability-calculator"]),
    ("national-debt-relief", "National Debt Relief", "See if you qualify for debt relief.", "marketcall",
     "$40-120 / qualified call", "qualified-call",
     "marketcall.com or lead economy; pay-per-call, TCPA compliance required on the landing copy",
     ["debt-payoff-calculator", "credit-card-payoff-calculator"]),
    ("augusta-gold", "Augusta Precious Metals", "Compare gold IRA options.", "direct",
     "$100-250 / qualified lead", "qualified-lead",
     "direct affiliate manager; highest CPA in the set, strictest compliance review",
     ["retirement-calculator"]),
    ("acorns-invest", "Acorns", "Start investing with spare change.", "impact",
     "$10-40 / funded signup", "signup",
     "impact.com -> Acorns",
     ["compound-interest-calculator", "cd-calculator"]),
    ("betterment-invest", "Betterment", "Automated investing with low fees.", "impact",
     "$25-100 / funded account", "signup",
     "impact.com -> Betterment",
     ["compound-interest-calculator", "retirement-calculator"]),
    ("thezebra-auto", "The Zebra", "Compare car insurance side by side.", "impact",
     "$15-50 / qualified lead", "qualified-lead",
     "impact.com -> The Zebra (MediaAlpha as alternative)",
     ["auto-loan-calculator"]),
    ("fundrise-reit", "Fundrise", "Invest in private real estate.", "direct",
     "$50-150 / funded investment", "signup",
     "fundrise.com/affiliates (direct application)",
     ["compound-interest-calculator"]),
]

existing = set(re.findall(r'id:\s*"([a-z0-9-]+)"', s))
added = []
block = []
for oid, name, blurb, network, payout, event, apply_note, tools in NEW:
    if oid in existing:
        continue
    slug = "".join(w.capitalize() for w in oid.split("-"))
    block.append("""
  {
    id: "%s",
    name: "%s",
    blurb: "%s",
    href: "about:blank", // PLACEHOLDER — activate after approval, never render
    program: "direct",
    payout: "%s",
    live: false,
    apply: "%s",
    tools: [%s],
    network: "%s",
    payoutEvent: "%s",
    states: ["US"],
    lastReviewed: "2026-11-03",
  },""" % (oid, name, blurb, payout, apply_note,
           ", ".join('"%s"' % t for t in tools), network, event))
    added.append(oid)

if not added:
    print("nothing to add — all present")
    raise SystemExit(0)

# insert before the final closing bracket of the array
start = s.index("export const AFFILIATE_OFFERS")
idx = s.index("\n];", start)
if idx == -1:
    raise SystemExit("could not locate the end of AFFILIATE_OFFERS")
s = s[:idx] + "".join(block) + s[idx:]
open(P, "w", encoding="utf-8").write(s)
print("added %d offers: %s" % (len(added), ", ".join(added)))
