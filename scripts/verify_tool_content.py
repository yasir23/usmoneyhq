#!/usr/bin/env python3
"""Verify every number quoted in lib/toolContent.ts.

A financial site that states a wrong figure in prose is worse than one that
states none: the calculator gives the right answer next to text that contradicts
it. These are the exact inputs used in the worked examples, recomputed
independently.
"""
from decimal import Decimal, getcontext, ROUND_HALF_UP

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

print("\n" + "=" * 68)
failed = checks.count(False)
print(f"  {len(checks) - failed} passed, {failed} failed")
print("=" * 68)
raise SystemExit(1 if failed else 0)
