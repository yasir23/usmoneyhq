#!/usr/bin/env python3
"""Expand debt-payoff-guide and how-much-house-can-i-afford past 1,200 static words.

All tables are computed here from stated assumptions. Nothing is a claim about current
market rates; the inputs are printed alongside so a reader can check the arithmetic.
"""
import os
import re


def money(x):
    return "${:,.0f}".format(round(x))


def months_at_min(balance, apr, pct=0.02, floor=25.0):
    """Months to clear a balance paying max(pct of balance, floor) each month."""
    r = apr / 100 / 12
    m = 0
    bal = balance
    while bal > 0 and m < 1200:
        pay = max(bal * pct, floor)
        interest = bal * r
        if pay <= interest:
            return None
        bal = bal + interest - pay
        m += 1
    return m


def total_paid_at_min(balance, apr):
    r = apr / 100 / 12
    m = 0
    bal = balance
    paid = 0.0
    while bal > 0 and m < 1200:
        pay = max(bal * 0.02, 25.0)
        interest = bal * r
        if pay <= interest:
            return None, None
        bal = bal + interest - pay
        paid += pay
        m += 1
    return m, paid


# ---------- debt payoff tables ----------
bal_rows = []
for b in (15_000, 25_000, 40_000):
    for apr in (20, 24, 28):
        m, paid = total_paid_at_min(b, apr)
        first_interest = b * apr / 100 / 12
        if m:
            bal_rows.append((money(b), "%d%%" % apr, money(first_interest),
                             "%d yr %d mo" % (m // 12, m % 12), money(paid), money(paid - b)))
        else:
            # 2% of the balance equals the monthly interest at 24%: the balance never falls.
            bal_rows.append((money(b), "%d%%" % apr, money(first_interest),
                             "never clears", money(b), "unbounded"))
# a 3% minimum does clear the same balances; show the contrast
clear3 = []
for b in (15_000, 25_000, 40_000):
    m3 = months_at_min(b, 24, pct=0.03)
    clear3.append((money(b), "%d yr %d mo" % (m3 // 12, m3 % 12) if m3 else "never"))
debt_table = "\n".join(
    "              <tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>" % r
    for r in bal_rows)

# avalanche vs snowball: 15k on card A at 24%, 8k on card B at 18%, 1,000/mo total
def simulate(debts, monthly):
    debts = [list(d) for d in debts]
    months = 0
    interest = 0.0
    while any(d[0] > 0 for d in debts) and months < 1200:
        for d in debts:
            if d[0] > 0:
                i = d[0] * d[1] / 100 / 12
                d[0] += i
                interest += i
        pool = monthly
        for d in debts:
            if d[0] > 0 and pool > 0:
                pay = min(pool, d[0])
                d[0] -= pay
                pool -= pay
        debts.sort(key=lambda x: (-x[1] if AVALANCHE else x[0]))
        months += 1
    return months, interest


DEBTS = [(15_000, 24), (8_000, 18)]
AVALANCHE = True
av_m, av_i = simulate(DEBTS, 1000)
AVALANCHE = False
sn_m, sn_i = simulate(DEBTS, 1000)

# ---------- affordability tables ----------
def max_housing(income, dti):
    return income * dti / 100 / 12


def loan_from_payment(payment, rate=6.5, years=30):
    r = rate / 100 / 12
    n = years * 12
    return payment * (1 - (1 + r) ** -n) / r


aff_rows = []
for inc in (60_000, 90_000, 120_000, 160_000):
    front = max_housing(inc, 28)
    back = max_housing(inc, 36)
    loan = loan_from_payment(front * 0.78)     # 22% of payment to tax+insurance+PMI
    aff_rows.append((money(inc), money(front), money(back), money(loan)))
aff_table = "\n".join(
    "              <tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>" % r for r in aff_rows)

# PMI sensitivity on a 400k loan
PRICE = 400_000
down10 = PRICE * 0.10
loan10 = PRICE - down10
base_pi = loan_from_payment(1)  # per dollar of payment
pmi_month = loan10 * 0.6 / 100 / 12      # 0.6% annual, common range 0.3-1.5%
pmt10 = loan10 * (6.5 / 100 / 12) / (1 - (1 + 6.5 / 100 / 12) ** -360)

DEBT_INSERT = '''
          <h2>What a balance actually costs at minimum payments</h2>
          <p>
            The minimum payment is designed to keep an account current, not to clear it. Most cards
            ask for 2% of the balance or $25, whichever is greater — and at 24% APR, 2% of the
            balance barely covers the interest. The table below is the arithmetic of paying only
            that minimum, with no new spending.
          </p>
          <table>
            <thead>
              <tr><th>Balance</th><th>APR</th><th>Interest in month one</th><th>Time to clear</th><th>Total paid</th><th>Of which interest</th></tr>
            </thead>
            <tbody>
__DEBT__
            </tbody>
          </table>
          <p>
            At 24%, 2% of a $25,000 balance is $500 a month and the interest is $500 a month — the
            balance never falls, which is why the table above says "never clears". At 20% the same
            balance clears in __Y25__ and costs about __I25__ in interest. The difference between a
            20% card and a 24% card is not 4 percentage points; it is solvency versus a treadmill. That is the trap: the payment feels manageable because it is
            small, and the balance is nearly static because almost all of the small payment is the
            cost of having it.
          </p>

          <h2>Avalanche versus snowball, measured</h2>
          <p>
            Two cards: $15,000 at 24% and $8,000 at 18%, with $1,000 a month to throw at them.
            Avalanche orders by rate; snowball orders by balance.
          </p>
          <table>
            <thead>
              <tr><th>Method</th><th>Months to clear both</th><th>Total interest</th></tr>
            </thead>
            <tbody>
              <tr><td>Avalanche (highest rate first)</td><td>__AVM__</td><td>__AVI__</td></tr>
              <tr><td>Snowball (smallest balance first)</td><td>__SNM__</td><td>__SNI__</td></tr>
            </tbody>
          </table>
          <p>
            Avalanche is cheaper by __DIFF__ and faster by __DM__ months. Snowball is not irrational —
            it clears an account sooner, and the behaviour change from closing one card is real — but
            anyone claiming it is the cheaper method is wrong by the figure above.
          </p>

          <h2>When the balance is too large to pay down</h2>
          <p>
            At some point the monthly payment required to clear a balance in a reasonable time
            exceeds what the household has. That is the point at which settlement, consolidation or
            advice enters, and it is a threshold rather than an opinion: if the minimum payment is
            more than a fifth of take-home pay, paying it down is no longer a budgeting problem. The
            <Link href="/quiz/debt-relief-check">debt relief eligibility check</Link> routes on that
            number — $10,000 or more points one way, less than that points the other, because
            settlement fees exceed the saving on small balances.
          </p>
          <p>
            Our <Link href="/guides/cfpb-complaints-2026">CFPB complaint study</Link> is the reason to
            treat the routing seriously rather than as a funnel: debt collection complaints rose 316%
            in two years, and the largest single issue inside credit cards is a disputed charge. Both
            are downstream of a balance that stopped being payable.
          </p>
'''

HOUSE_INSERT = '''
          <h2>What lenders actually compute</h2>
          <p>
            Affordability is not a feeling; it is two ratios. Front-end DTI is housing cost divided
            by gross monthly income — conventionally capped at 28%. Back-end DTI adds every other
            debt payment and is conventionally capped at 36%. The table applies both to four incomes,
            then converts the front-end payment into a loan at 6.5% over 30 years, reserving 22% of
            the payment for tax, insurance and mortgage insurance.
          </p>
          <table>
            <thead>
              <tr><th>Gross income</th><th>28% front-end payment</th><th>36% back-end ceiling</th><th>Implied loan</th></tr>
            </thead>
            <tbody>
__AFF__
            </tbody>
          </table>
          <p>
            Households routinely qualify above 28/36 — automated underwriting allows higher ratios
            with compensating factors — but the number that matters is not what you can borrow. It is
            what remains after the payment. Two households on $120,000 can carry very different
            payments depending on whether they have a car loan and a student loan inside that 36%.
          </p>

          <h2>Why the same loan costs different amounts in different counties</h2>
          <p>
            On a $400,000 purchase with 10% down, the loan is $360,000 and principal and interest at
            6.5% is __PMT__ a month. Mortgage insurance at 0.6% of the balance adds about __PMI__ on
            top, and property tax in a high-rate county can add more than the insurance does. Flush
            the down payment to 20% and the mortgage insurance disappears entirely — worth
            __PMIYR__ a year, which is why the last few percent of a down payment are worth more than
            their face value.
          </p>
          <p>
            This is where the metro study earns its keep: our
            <Link href="/guides/home-price-to-income-by-metro-2026">49-metro affordability analysis</Link>
            compares median home value to owner-occupied household income from the same ACS release,
            so it is a like-for-like ratio rather than two different populations divided by each
            other. It shows Los Angeles at 6.82 times income and Detroit at 1.54 — the same rule,
            radically different outcomes.
          </p>

          <h2>What to do with the result</h2>
          <p>
            Take the 36% back-end ceiling, subtract your existing debt payments, and you have the
            housing payment a lender will likely approve. Subtract tax, insurance and mortgage
            insurance from that, and you have principal and interest. Feed that into the
            <Link href="/home-affordability-calculator">home affordability calculator</Link> to get a
            price, and check the
            <Link href="/mortgage-calculator">mortgage calculator</Link> for the payment at your
            actual quoted rate — the difference between 6.0% and 7.0% is about $270 a month on a
            $400,000 loan.
          </p>
'''

# ---- apply to debt guide ----
DP = "pages/guides/debt-payoff-guide.js"
s = open(DP, encoding="utf-8").read()
if "Avalanche versus snowball, measured" not in s:
    m25 = total_paid_at_min(25_000, 20)
    yrs = "%d years %d months" % (m25[0] // 12, m25[0] % 12) if m25 and m25[0] else "decades"
    m25 = m25 or (0, 25_000)
    block = (DEBT_INSERT.replace("__DEBT__", debt_table)
             .replace("__Y25__", yrs)
             .replace("__I25__", money(max(0, (m25[1] or 25_000) - 25_000)))
             .replace("__AVM__", str(av_m)).replace("__AVI__", money(av_i))
             .replace("__SNM__", str(sn_m)).replace("__SNI__", money(sn_i))
             .replace("__DIFF__", money(sn_i - av_i))
             .replace("__DM__", str(sn_m - av_m)))
    s = s.replace('<meta name="robots" content="noindex, follow" />\n', "")
    s = s.replace('<meta name="robots" content="noindex, follow" />', "")
    pos = s.find('<div className="seo">')
    end = s.find("</div>", pos)
    s = s[:end] + block + s[end:]
    open(DP, "w", encoding="utf-8").write(s)
    print("debt guide expanded; avalanche %d mo / %s vs snowball %d mo / %s"
          % (av_m, money(av_i), sn_m, money(sn_i)))
else:
    print("debt guide already expanded")

# ---- apply to affordability guide ----
HP = "pages/guides/how-much-house-can-i-afford.js"
s = open(HP, encoding="utf-8").read()
if "What lenders actually compute" not in s:
    block = (HOUSE_INSERT.replace("__AFF__", aff_table)
             .replace("__PMT__", money(pmt10))
             .replace("__PMI__", money(pmi_month))
             .replace("__PMIYR__", money(pmi_month * 12)))
    s = s.replace('<meta name="robots" content="noindex, follow" />\n', "")
    s = s.replace('<meta name="robots" content="noindex, follow" />', "")
    pos = s.find('<div className="seo">')
    end = s.find("</div>", pos)
    s = s[:end] + block + s[end:]
    open(HP, "w", encoding="utf-8").write(s)
    print("affordability guide expanded")
else:
    print("affordability guide already expanded")
