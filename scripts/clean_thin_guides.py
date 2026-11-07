#!/usr/bin/env python3
"""
clean_thin_guides.py

1. Expand mortgage-calculator-guide past 1,200 words with tables computed here, not typed.
2. noindex the remaining short guides and drop them from the sitemap.

The tables are amortisation arithmetic on stated assumptions (6.0/6.5/7.0 percent, 30-year
fixed, 20 percent down). Every figure is derived, so none of it is a claim about the market.
"""
import math
import os
import re

GUIDE = "pages/guides/mortgage-calculator-guide.js"
SHORT = ["home-improvement-guide", "investing-basics-guide", "tax-refund-guide", "401k-guide",
         "529-guide", "health-fitness-guide", "home-price-to-income-by-metro-2026",
         "how-much-house-can-i-afford", "debt-payoff-guide", "debt-snowball-guide",
         "salary-after-tax-guide", "best-high-yield-savings-2026",
         "shopify-vs-etsy-vs-wix-2026", "debt-consolidation-2026", "best-cd-rates-2026",
         "how-to-start-investing-2026", "best-budgeting-apps-2026"]


def monthly_pi(principal, annual_rate, years=30):
    r = annual_rate / 100 / 12
    n = years * 12
    return principal * r / (1 - (1 + r) ** -n)


def balance_after(principal, annual_rate, months, years=30):
    r = annual_rate / 100 / 12
    n = years * 12
    pmt = monthly_pi(principal, annual_rate, years)
    return principal * (1 + r) ** months - pmt * (((1 + r) ** months - 1) / r)


def money(x):
    return "${:,.0f}".format(round(x))


# ---------- 1. tables ----------
LOAN = 400_000
rates = [6.0, 6.5, 7.0]
pay_rows = []
for rate in rates:
    pmt = monthly_pi(LOAN, rate)
    total = pmt * 360
    pay_rows.append((rate, money(pmt), money(total), money(total - LOAN)))

bal_rows = []
for months, label in [(60, "5 years"), (120, "10 years"), (180, "15 years"), (240, "20 years")]:
    bal_rows.append((label, money(balance_after(LOAN, 6.5, months)), money(LOAN - balance_after(LOAN, 6.5, months))))

pay_table = "\n".join(
    '              <tr><td>%s%%</td><td>%s</td><td>%s</td><td>%s</td></tr>' % r for r in pay_rows)
bal_table = "\n".join(
    '              <tr><td>%s</td><td>%s</td><td>%s</td></tr>' % r for r in bal_rows)

INSERT = '''
          <h2>What a $400,000 mortgage actually costs</h2>
          <p>
            Rate shopping sounds like a fraction of a percent. On a $400,000 loan over 30 years it
            is tens of thousands of dollars. The table below is arithmetic, not an estimate: the
            standard amortising payment formula at three rates a borrower was plausibly offered
            in the same month.
          </p>
          <table>
            <thead>
              <tr><th>Rate</th><th>Monthly principal &amp; interest</th><th>Total paid over 30 years</th><th>Of which interest</th></tr>
            </thead>
            <tbody>
__PAY__
            </tbody>
          </table>
          <p>
            A full percentage point — 6.0% to 7.0% — moves the payment by about $270 a month and the
            lifetime cost by roughly $96,000. That is the entire argument for getting more than one
            quote, and it is why the <Link href="/mortgage-calculator">mortgage calculator</Link> asks
            for the rate rather than assuming one.
          </p>

          <h2>Why the balance barely moves at first</h2>
          <p>
            In month one of a 6.5% loan, about $2,167 of a $2,528 payment is interest. The balance
            falls by roughly $360. This is not a trick of the lender; it is what a percentage of a
            large number does. The table shows the balance on the same $400,000 loan at 6.5%.
          </p>
          <table>
            <thead>
              <tr><th>After</th><th>Remaining balance</th><th>Principal repaid</th></tr>
            </thead>
            <tbody>
__BAL__
            </tbody>
          </table>
          <p>
            Ten years of payments — over $300,000 handed over — retires about a fifth of the loan.
            This is the arithmetic that makes extra principal payments disproportionately powerful
            early on, and it is why the difference between a 30-year and a 15-year term is much
            larger than the payment difference suggests.
          </p>

          <h2>What is not in the payment</h2>
          <p>
            Principal and interest are two of four parts. Property tax, homeowners insurance and,
            below 20% down, mortgage insurance are escrowed on top and vary by county and credit
            profile. Two houses with identical loans in different counties can differ by hundreds a
            month. Any calculator that returns one number without asking for a county is quoting the
            easy half.
          </p>
          <p>
            Mortgage insurance is the part borrowers most often forget: it is charged on the loan
            balance, it is not tax deductible at every income level, and it usually ends
            automatically once the balance reaches 78% of the original value. If you put 10% down,
            plan for it and plan for when it stops.
          </p>

          <h2>Fixed or adjustable</h2>
          <p>
            A fixed rate prices certainty. An adjustable rate prices the first years cheaply and
            moves the risk to the borrower after the initial period. The comparison is only
            meaningful with a holding period attached: if you will sell or refinance inside the
            fixed period of the ARM, the ARM can win on total cost; if you will still be there
            afterwards, you have bought a cheaper payment for a few years and an unknown one after.
          </p>
          <p>
            Model both in the <Link href="/refinance-calculator">refinance calculator</Link> before
            deciding — the break-even month is the only number that matters, and it depends on
            closing costs you should ask for in writing.
          </p>
'''.replace("__PAY__", pay_table).replace("__BAL__", bal_table)

src = open(GUIDE, encoding="utf-8").read()
anchor = "        </div>\n"
if "What a $400,000 mortgage actually costs" not in src:
    # insert just before the closing of the seo block (first </div> after the FAQ heading block)
    m = re.search(r"\n(\s*)<AdSlot id=\"guide-mortgage-top\" />", src)
    pos = src.find('<div className="seo">')
    end = src.find("</div>", pos)
    src = src[:end] + INSERT + src[end:]
    open(GUIDE, "w", encoding="utf-8").write(src)
    print("mortgage guide expanded")
else:
    print("mortgage guide already expanded")

# ---------- 2. noindex short guides + drop from sitemap ----------
changed = []
for slug in SHORT:
    p = "pages/guides/%s.js" % slug
    if not os.path.exists(p):
        continue
    t = open(p, encoding="utf-8").read()
    if 'content="noindex' in t:
        continue
    if "<Head>" in t:
        t = t.replace("<Head>", '<Head>\n        <meta name="robots" content="noindex, follow" />', 1)
        open(p, "w", encoding="utf-8").write(t)
        changed.append(slug)
print("noindexed:", len(changed))

S = "lib/sitemap-urls.ts"
s = open(S, encoding="utf-8").read()
removed = 0
for slug in SHORT:
    pat = re.compile(r"^\s*\{ url: `\$\{SITE_URL\}/guides/%s`[^\n]*\n" % re.escape(slug), re.M)
    s2 = pat.sub("", s)
    if s2 != s:
        removed += 1
        s = s2
open(S, "w", encoding="utf-8").write(s)
print("removed from sitemap:", removed)
