#!/usr/bin/env python3
"""Verify every number quoted in lib/toolContent.ts.

A financial site that states a wrong figure in prose is worse than one that
states none: the calculator gives the right answer next to text that contradicts
it. These are the exact inputs used in the worked examples, recomputed
independently.
"""
from decimal import Decimal, getcontext, ROUND_HALF_UP
import math

getcontext().prec = 28


def payment(principal, annual_rate, years):
    r = Decimal(annual_rate) / 12
    n = years * 12
    return principal * r / (1 - (1 + r) ** -n)


def money(d):
    return f"${d.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP):,}"


def dollars(d):
    """Round to the nearest whole dollar, as the content states large totals."""
    return f"${d.quantize(Decimal('1'), rounding=ROUND_HALF_UP):,}"


def thousands(d):
    """Round to the nearest thousand.

    NOTE: Decimal('1000') has exponent 3, so quantize(Decimal('1000')) rounds to
    three DECIMAL PLACES, not to the nearest thousand. The correct quantizer for
    thousands is Decimal('1E3'). This bug made the two ~$227,000 and ~$283,000
    assertions compare a rounded figure against an unrounded one and fail on
    content that was right.
    """
    quantized = d.quantize(Decimal("1E3"), rounding=ROUND_HALF_UP)
    # int() first: formatting a Decimal with a positive exponent yields
    # scientific notation ("$2.27E+5"), which is correct but unreadable here.
    return f"${int(quantized):,}"


checks = []


def check(label, actual, expected):
    ok = actual == expected
    checks.append(ok)
    print(f"  {'PASS' if ok else 'FAIL'}  {label}")
    if not ok:
        print(f"        expected {expected!r}")
        print(f"        actual   {actual!r}")


print("=" * 68)
print("toolContent.ts — ARITHMETIC VERIFICATION")
print("=" * 68)

# --- mortgage-calculator --------------------------------------------------
print("\nmortgage: $400,000 @ 6.5% / 30 years")
M = payment(Decimal(400000), Decimal("0.065"), 30)
check("monthly payment is $2,528.27", money(M), "$2,528.27")

interest1 = Decimal(400000) * Decimal("0.065") / 12
check("interest in payment 1 is $2,166.67", money(interest1), "$2,166.67")

principal1 = M - interest1
check("principal in payment 1 is $361.61", money(principal1), "$361.61")

share = (interest1 / M * 100).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
check("interest share is 85.7%", f"{share}%", "85.7%")

total = M * 360
check("total paid is $910,178", dollars(total), "$910,178")
check("total interest is $510,178", dollars(total - 400000), "$510,178")

# the 15-year comparison cited in "common mistakes"
M15 = payment(Decimal(400000), Decimal("0.065"), 15)
check("15-year payment rounds to $3,484", money(M15), "$3,484.43")
t15 = M15 * 180
check("15-year interest is ~$227,000", thousands(t15 - 400000), "$227,000")
check("30yr vs 15yr interest gap is ~$283,000",
      thousands((total - 400000) - (t15 - 400000)), "$283,000")

# --- paycheck-calculator --------------------------------------------------
print("\npaycheck: $75,000 across four schedules")
g = Decimal(75000)
for divisor, expected in [(12, "$6,250.00"), (24, "$3,125.00"),
                          (26, "$2,884.62"), (52, "$1,442.31")]:
    check(f"{divisor} periods -> {expected}", money(g / divisor), expected)

# --- debt-payoff-calculator ----------------------------------------------
print("\ndebt: $5,000 @ 22% APR")
d_interest = Decimal(5000) * Decimal("0.22") / 12
check("month 1 interest is $91.67", money(d_interest), "$91.67")
check("at $100, principal falls by ~$8",
      money(Decimal(100) - d_interest), "$8.33")
check("at $200, principal falls by ~$108",
      money(Decimal(200) - d_interest), "$108.33")
ratio = ((Decimal(200) - d_interest) / (Decimal(100) - d_interest)
         ).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
check("that is ~13x more principal", f"{ratio}x", "13x")

# --- salary example -------------------------------------------------------
print("\nsalary: layer arithmetic")
check("22% APR quoted monthly is 1.83%",
      f"{(Decimal('0.22') / 12 * 100).quantize(Decimal('0.01'))}%", "1.83%")
check("6.2% + 1.45% = 7.65% FICA (below the wage base)",
      f"{Decimal('6.2') + Decimal('1.45')}%", "7.65%")

# --- cd-calculator ---------------------------------------------------------
# The whole point of the CD fix: an APY is a yield, so one year is a single
# multiplication. These reproduce the definition, not the implementation.
print("\ncd: APY already includes the compounding")


def fmoney(x):
    """Money from a float, matching the engine (which computes in float64).

    Sign goes before the currency symbol, as the content writes it: -$5.00, not
    $-5.00. The first version of this helper produced the latter and reported a
    content failure that was really its own formatting bug.
    """
    return ("-$" if x < 0 else "$") + f"{abs(x):,.2f}"


cd_1y = 25000 * (1 + 4.5 / 100)
check("25,000 at 4.5% APY for 12 months is $26,125.00", fmoney(cd_1y), "$26,125.00")
check("interest is $1,125.00", fmoney(cd_1y - 25000), "$1,125.00")
check("6 months is $25,556.31", fmoney(25000 * 1.045 ** 0.5), "$25,556.31")
check("3 months is $25,276.62", fmoney(25000 * 1.045 ** 0.25), "$25,276.62")
old_cd = 25000 * (1 + 4.5 / 100 / 12) ** 12
check("the superseded formula returned $26,148.50", fmoney(old_cd), "$26,148.50")
check("so it overstated the return by $23.50", fmoney(old_cd - cd_1y), "$23.50")

# The CD FAQ quoted 459.40 for 10,000 at 4.5% — the same double-compounded
# figure. Under the corrected reading the annual interest is 450.00.
check("10,000 at 4.5% APY earns $450.00 for the year",
      fmoney(10000 * 1.045 - 10000), "$450.00")
_nom = ((1.045 ** (1 / 12)) - 1) * 12 * 100
check("the APY-equivalent nominal monthly rate is ~4.41%", f"{_nom:.2f}%", "4.41%")

# --- roi-calculator --------------------------------------------------------
print("\nroi: total return versus annualised")
check("2,500 on 10,000 is 25.00%", f"{2500 / 10000 * 100:.2f}%", "25.00%")
ann = (12500 / 10000) ** (1 / 3) - 1
check("annualised over 3 years is 7.72%", f"{ann * 100:.2f}%", "7.72%")
check("the exact rate is 7.7217%", f"{ann * 100:.4f}%", "7.7217%")

# --- emergency-fund-calculator --------------------------------------------
print("\nemergency fund: target is linear in both inputs")
check("3,500 x 6 months is $21,000.00", fmoney(3500 * 6), "$21,000.00")
check("3,500 x 3 months is $10,500.00", fmoney(3500 * 3), "$10,500.00")
check("3,500 x 12 months is $42,000.00", fmoney(3500 * 12), "$42,000.00")

# --- break-even-calculator ------------------------------------------------
print("\nbreak-even: contribution per unit, then round up")
contrib = 25 - 10
check("contribution per unit is $15.00", fmoney(contrib), "$15.00")
raw_units = 50000 / contrib
check("raw break-even is 3333.33 units", f"{raw_units:.2f}", "3333.33")
check("rounded up it is 3334 units", f"{math.ceil(raw_units)}", "3334")
check("revenue at break-even is $83,350.00", fmoney(3334 * 25), "$83,350.00")
check("3,333 units leaves a $5.00 loss", fmoney(3333 * 15 - 50000), "-$5.00")
check("4,000 units gives $10,000.00", fmoney((4000 - raw_units) * 15), "$10,000.00")

# --- 401k-calculator ------------------------------------------------------
print("\n401k: the cap is a percentage of salary, not of the contribution")
check("6% of 85,000 is $5,100 a year", fmoney(85000 * 0.06), "$5,100.00")
check("which is $425.00 a month", fmoney(85000 * 0.06 / 12), "$425.00")
check("500 + 425 is $925.00", fmoney(500 + 425), "$925.00")
check("the match adds $127,500 over 300 months", fmoney(425 * 300), "$127,500.00")
_r = 0.07 / 12
_n = 300
_fv = 25000 * (1 + _r) ** _n + 925 * (((1 + _r) ** _n - 1) / _r)
check("projected balance is $892,451.77", fmoney(_fv), "$892,451.77")

print("\n" + "=" * 68)
failed = checks.count(False)
print(f"  {len(checks) - failed} passed, {failed} failed")
print("=" * 68)
raise SystemExit(1 if failed else 0)
