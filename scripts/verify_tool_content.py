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

# --- dti-calculator -------------------------------------------------------
# The ratio is debt / gross income, and the front-end numerator is a subset of
# the back-end one. Derived here from the definition, not from lib/calc.ts.
print("\ndti: the ratio is debt over gross monthly income")


def dti_back(income, housing, other):
    return (housing + other) / income * 100


check("31.25% back-end on 2,500 / 8,000",
      f"{dti_back(8000, 1800, 700):.2f}%", "31.25%")
check("22.50% front-end on 1,800 / 8,000",
      f"{1800 / 8000 * 100:.2f}%", "22.50%")
check("the two ratios are 8.75 points apart",
      f"{dti_back(8000, 1800, 700) - 1800 / 8000 * 100:.2f}", "8.75")
check("a net denominator pushes it above 39%",
      f"{dti_back(6400, 1800, 700):.4f}%", "39.0625%")
check("front-end is exactly 36% at 2,880 of housing",
      f"{2880 / 8000 * 100:.2f}%", "36.00%")
check("but the back-end is 44.75%",
      f"{dti_back(8000, 2880, 700):.2f}%", "44.75%")
check("1,700 of other debt gives 43.75% back-end",
      f"{dti_back(8000, 1800, 1700):.2f}%", "43.75%")
check("...while that front-end stays at 22.50%",
      f"{1800 / 8000 * 100:.2f}%", "22.50%")

# --- personal-loan-calculator --------------------------------------------
# Uses float64 and the engine's own formula shape (lib/tools.ts
# monthlyPaymentSafe) rather than exact Decimal: the published table multiplies
# the UNROUNDED payment by the term, so an exact-Decimal recomputation differs by
# a cent and reports a failure on content that matches the calculator.
print("\npersonal loan: the term moves the total more than the rate")


def pmt(principal, rate_pct, term_months):
    r = rate_pct / 100 / 12
    p = (1 + r) ** term_months
    return principal * r * p / (p - 1)


p36f = pmt(15000, 11.5, 36)
i36f = p36f * 36 - 15000
check("36-month payment is $494.64", fmoney(p36f), "$494.64")
check("total interest is $2,807.04", fmoney(i36f), "$2,807.04")
check("total cost is $17,807.04", fmoney(p36f * 36), "$17,807.04")
p60f = pmt(15000, 11.5, 60)
i60f = p60f * 60 - 15000
check("60-month payment is $329.89", fmoney(p60f), "$329.89")
check("60-month interest is $4,793.35", fmoney(i60f), "$4,793.35")
check("the long term costs about $1,986 more", f"{i60f - i36f:,.0f}", "1,986")
check("the payment falls by about a third",
      f"{(1 - p60f / p36f) * 100:.1f}%", "33.3%")
check("and the interest rises by about 70%",
      f"{(i60f / i36f - 1) * 100:.1f}%", "70.8%")
check("the total cost is 18.7% above the principal",
      f"{(p36f * 36 / 15000 - 1) * 100:.1f}%", "18.7%")
p22f = pmt(15000, 22, 36)
check("at 22% the payment is $572.86", fmoney(p22f), "$572.86")
check("and the interest is $5,622.84", fmoney(p22f * 36 - 15000), "$5,622.84")
check("that is just over double the 11.5% interest",
      f"{(p22f * 36 - 15000) / i36f:.3f}", "2.003")

# --- fha-mortgage-calculator ---------------------------------------------
print("\nfha: the upfront premium is financed, the annual one never stops")
fha_price = Decimal(300000)
fha_down = fha_price * Decimal("3.5") / 100
fha_base = fha_price - fha_down
fha_ufmip = fha_base * Decimal("0.0175")
fha_loan = fha_base + fha_ufmip
check("down payment is $10,500.00", money(fha_down), "$10,500.00")
check("base loan is $289,500.00", money(fha_base), "$289,500.00")
check("upfront MIP is $5,066.25", money(fha_ufmip), "$5,066.25")
check("the amortised balance is $294,566.25", money(fha_loan), "$294,566.25")
fha_pi = payment(fha_loan, Decimal("0.068"), 30)
fha_pi_base = payment(fha_base, Decimal("0.068"), 30)
check("principal + interest is $1,920.35", money(fha_pi), "$1,920.35")
check("on the base alone it would be $1,887.32", money(fha_pi_base), "$1,887.32")
check("financing the premium costs $33.03 a month",
      money(fha_pi - fha_pi_base), "$33.03")
check("which is $11,890.14 over 360 months",
      money((fha_pi - fha_pi_base) * 360), "$11,890.14")
fha_mip = fha_base * Decimal("0.0055") / 12
check("monthly MIP is $132.69", money(fha_mip), "$132.69")
check("principal, interest and MIP is $2,053.04", money(fha_pi + fha_mip), "$2,053.04")
check("the MIP is $47,767.50 across 360 months", money(fha_mip * 360), "$47,767.50")

# --- 401k-contribution-calculator ----------------------------------------
# Reproduces the engine's own monthly loop rather than a closed form: the
# published balance is the loop's output, so the check must walk the same steps.
print("\n401k contribution: the match is a share of SALARY, capped by your own")


def k401_plan(salary, pct, match_pct, current, age, rate=0.07):
    yours = min(salary * pct / 100, 24500)
    match = min(salary * match_pct / 100, yours)
    monthly = (yours + match) / 12
    bal = float(current)
    r = rate / 12
    for _ in range((65 - age) * 12):
        bal = bal * (1 + r) + monthly
    return yours, match, bal


# NOTE: this is deliberately not called `contrib` — the break-even section above
# already binds that name to a number, and shadowing it makes the file's own
# static analysis report the earlier lines as type errors.
_y, _m, _b = k401_plan(90000, 8, 4, 20000, 35)
check("8% of 90,000 is $7,200.00", fmoney(_y), "$7,200.00")
check("the 4% match is $3,600.00", fmoney(_m), "$3,600.00")
check("together $10,800.00", fmoney(_y + _m), "$10,800.00")
check("which is 12.0% of salary", f"{(_y + _m) / 90000 * 100:.1f}%", "12.0%")
check("projected balance is $1,260,303.85", fmoney(_b), "$1,260,303.85")
_y3, _m3, _b3 = k401_plan(90000, 3, 4, 20000, 35)
check("at 3% the match is capped at $2,700.00", fmoney(_m3), "$2,700.00")
check("so $900.00 of match is forfeited", fmoney(_m - _m3), "$900.00")
check("the projection falls to $711,316.90", fmoney(_b3), "$711,316.90")
check("a difference of $548,986.95", fmoney(_b - _b3), "$548,986.95")
check("for $4,500.00 less contributed a year", fmoney(_y - _y3), "$4,500.00")
check("4% misread as a share of 7,200 would be $288.00", fmoney(7200 * 0.04), "$288.00")
check("but 4% of salary is $3,600.00", fmoney(90000 * 0.04), "$3,600.00")
check("a quarter of a 4% match is forfeited at 3%",
      f"{(_m - _m3) / _m * 100:.0f}%", "25%")
check("12% of 250,000 would be $30,000.00", fmoney(250000 * 0.12), "$30,000.00")
_y250, _m250, _b250 = k401_plan(250000, 12, 5, 100000, 45)
check("the deferral stops at $24,500.00", fmoney(_y250), "$24,500.00")
check("the 5% match adds $12,500.00", fmoney(_m250), "$12,500.00")
check("a combined 14.8% of salary",
      f"{(_y250 + _m250) / 250000 * 100:.1f}%", "14.8%")
check("projected balance is $2,010,064.42", fmoney(_b250), "$2,010,064.42")

# --- the 2026-10-07 batch: nine tools that previously shipped no deep content ---

# --- auto-loan-calculator ------------------------------------------------
print("\nauto loan: $30,000 @ 7% / 60 months")
_AL = payment(Decimal(30000), Decimal("0.07"), 5)
check("monthly payment is $594.04", money(_AL), "$594.04")
_al_i1 = Decimal(30000) * Decimal("0.07") / 12
check("month 1 interest is $175.00", money(_al_i1), "$175.00")
check("month 1 principal is $419.04", money(_AL - _al_i1), "$419.04")
_al_share = (_al_i1 / _AL * 100).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
check("interest share of payment 1 is 29.5%", f"{_al_share}%", "29.5%")
_al_total = _AL * 60
check("total paid is $35,642.16", money(_al_total), "$35,642.16")
check("total interest is $5,642.16", money(_al_total - 30000), "$5,642.16")
_AL48 = payment(Decimal(30000), Decimal("0.07"), 4)
check("48-month payment is $718.39", money(_AL48), "$718.39")
_al_i48 = _AL48 * 48 - 30000
check("the 48-month interest gap is $1,159.57",
      money((_al_total - 30000) - _al_i48), "$1,159.57")

# --- concrete-calculator -------------------------------------------------
print("\nconcrete: 10 ft x 20 ft x 4 in slab")
_c_vol = 10 * 20 * (4 / 12)
check("volume is 66.67 cu ft", f"{_c_vol:.2f} cu ft", "66.67 cu ft")
_c_yd = _c_vol / 27
check("volume is 2.47 cu yd", f"{_c_yd:.2f} cu yd", "2.47 cu yd")
check("with 10% waste it is 2.72 cu yd", f"{_c_yd * 1.10:.2f} cu yd", "2.72 cu yd")
check("that is 111 eighty-pound bags", f"{_c_vol / 0.6:.0f} bags", "111 bags")
check("or 148 sixty-pound bags", f"{_c_vol / 0.45:.0f} bags", "148 bags")

# --- credit-card-payoff-calculator --------------------------------------
print("\ncredit card: $5,000 @ 22% APR")
_cc_r = Decimal("0.22") / 12
_cc_i1 = Decimal(5000) * _cc_r
check("month 1 interest is $91.67", money(_cc_i1), "$91.67")
check("the 2.5% minimum is $125.00",
      money(Decimal(5000) * Decimal("0.025")), "$125.00")
check("principal at the minimum is $33.33",
      money(Decimal(125) - _cc_i1), "$33.33")


def payoff_months(balance, monthly_rate, payment_amt):
    val = 1 - float(monthly_rate) * float(balance) / float(payment_amt)
    return math.ceil(-math.log(val) / math.log(1 + float(monthly_rate)))


check("$150 a month pays off in 52 months",
      f"{payoff_months(5000, _cc_r, 150)} months", "52 months")
check("total paid at $150 is $7,800.00", money(Decimal(150) * 52), "$7,800.00")
check("interest at $150 is $2,800.00",
      money(Decimal(150) * 52 - 5000), "$2,800.00")
check("$500 a month pays off in 12 months",
      f"{payoff_months(5000, _cc_r, 500)} months", "12 months")
check("interest at $500 is $1,000.00",
      money(Decimal(500) * 12 - 5000), "$1,000.00")

# --- debt-snowball-calculator -------------------------------------------
print("\ndebt snowball: one month, two debts, a $200 surplus")
check("debt A monthly interest is $7.50",
      money(Decimal(500) * Decimal("0.18") / 12), "$7.50")
check("debt B monthly interest is $60.00",
      money(Decimal(3000) * Decimal("0.24") / 12), "$60.00")
check("minimums total $85.00", money(Decimal(25) + Decimal(60)), "$85.00")
check("the outlay is $285.00", money(Decimal(85) + Decimal(200)), "$285.00")
check("the surplus avoids $1.00 a month",
      money(Decimal(200) * (Decimal("0.24") - Decimal("0.18")) / 12), "$1.00")
check("interest is 23.7% of the outlay",
      f"{(Decimal('67.50') / Decimal('285') * 100).quantize(Decimal('0.1'))}%",
      "23.7%")

# --- home-affordability-calculator --------------------------------------
print("\nhome affordability: $100,000 income, $300,000 house")
_ha_gross = Decimal(100000) / 12
check("gross monthly income is $8,333.33", money(_ha_gross), "$8,333.33")
_ha_cap = _ha_gross * Decimal("0.28")
check("the 28% front-end cap is $2,333.33", money(_ha_cap), "$2,333.33")
_ha_pi = payment(Decimal(240000), Decimal("0.065"), 30)
check("principal and interest is $1,516.96", money(_ha_pi), "$1,516.96")
check("property tax is $300.00 a month",
      money(Decimal(300000) * Decimal("0.012") / 12), "$300.00")
check("insurance is $125.00 a month", money(Decimal(1500) / 12), "$125.00")
_ha_total = _ha_pi + Decimal(300) + Decimal(125)
check("total housing cost is $1,941.96", money(_ha_total), "$1,941.96")
check("headroom is $391.37", money(_ha_cap - _ha_total), "$391.37")
check("that is 23.3% of gross income",
      f"{(_ha_total / _ha_gross * 100).quantize(Decimal('0.1'))}%", "23.3%")
check("the 36% back-end cap is $3,000.00",
      money(_ha_gross * Decimal("0.36")), "$3,000.00")
check("leaving $2,580.00 for housing after a $420 car payment",
      money(_ha_gross * Decimal("0.36") - Decimal(420)), "$2,580.00")


def _piti(price):
    return (payment(price * Decimal("0.8"), Decimal("0.065"), 30)
            + price * Decimal("0.012") / 12 + Decimal(1500) / 12)


_lo, _hi = Decimal(100000), Decimal(900000)
for _ in range(90):
    _mid = (_lo + _hi) / 2
    if _piti(_mid) > _ha_cap:
        _hi = _mid
    else:
        _lo = _mid
check("the maximum price at the cap is about $364,619", dollars(_lo), "$364,619")

# --- overtime-calculator -------------------------------------------------
print("\novertime: $25 an hour, 50 hours in a workweek")
check("40 straight hours pay $1,000.00", money(Decimal(40) * 25), "$1,000.00")
check("the overtime rate is $37.50", money(Decimal(25) * Decimal("1.5")), "$37.50")
check("10 overtime hours pay $375.00",
      money(Decimal(10) * Decimal("37.50")), "$375.00")
check("total gross pay is $1,375.00",
      money(Decimal(1000) + Decimal(375)), "$1,375.00")
check("the effective average rate is $27.50", money(Decimal(1375) / 50), "$27.50")
check("the overtime premium is $125.00",
      money(Decimal(10) * Decimal("12.50")), "$125.00")
check("the wrong all-hours method would give $1,875.00",
      money(Decimal(50) * 25 * Decimal("1.5")), "$1,875.00")

# --- self-employment-tax-calculator -------------------------------------
print("\nself-employment tax: $80,000 of net profit")
_se_base = Decimal(80000) * Decimal("0.9235")
check("the 92.35% base is $73,880.00", money(_se_base), "$73,880.00")
_se_ss = _se_base * Decimal("0.124")
check("Social Security at 12.4% is $9,161.12", money(_se_ss), "$9,161.12")
_se_med = _se_base * Decimal("0.029")
check("Medicare at 2.9% is $2,142.52", money(_se_med), "$2,142.52")
_se_tot = _se_ss + _se_med
check("total self-employment tax is $11,303.64", money(_se_tot), "$11,303.64")
check("the effective rate on profit is 14.13%",
      f"{(Decimal('11303.64') / 80000 * 100).quantize(Decimal('0.01'))}%", "14.13%")
check("the above-the-line deduction is $5,651.82", money(_se_tot / 2), "$5,651.82")
_se40 = Decimal(40000) * Decimal("0.9235") * Decimal("0.153")
check("at $40,000 the tax is $5,651.82", money(_se40), "$5,651.82")
check("and the deduction is $2,825.91", money(_se40 / 2), "$2,825.91")
check("applying 15.3% directly would give $12,240.00",
      money(Decimal(80000) * Decimal("0.153")), "$12,240.00")
check("an overstatement of $936.36",
      money(Decimal(80000) * Decimal("0.153") - _se_tot), "$936.36")

# --- social-security-calculator -----------------------------------------
print("\nsocial security: claiming-age adjustments on a $2,000 benefit")
check("claiming at 62 gives $1,400.00",
      money(Decimal(2000) * Decimal("0.70")), "$1,400.00")
check("claiming at 70 gives $2,480.00",
      money(Decimal(2000) * Decimal("1.24")), "$2,480.00")
check("the monthly difference is $1,080.00",
      money(Decimal(2480) - Decimal(1400)), "$1,080.00")
check("eight years of forgone payments is $134,400",
      dollars(Decimal(1400) * 12 * 8), "$134,400")
check("the recovery period is 10.4 years",
      f"{(Decimal(134400) / (Decimal(1080) * 12)).quantize(Decimal('0.1'))} years",
      "10.4 years")
_e_red = Decimal(36) * Decimal(5) / Decimal(9) + Decimal(12) * Decimal(5) / Decimal(12)
check("four years early costs 25%", f"{_e_red.quantize(Decimal('1'))}%", "25%")
check("four years late adds 32%", f"{Decimal(4) * 8}%", "32%")

# --- tip-calculator ------------------------------------------------------
print("\ntip: a $64.50 bill")
check("the 10% anchor is $6.45", money(Decimal("64.50") / 10), "$6.45")
check("15% is $9.68", money(Decimal("64.50") * Decimal("0.15")), "$9.68")
check("18% is $11.61", money(Decimal("64.50") * Decimal("0.18")), "$11.61")
check("20% is $12.90", money(Decimal("64.50") * Decimal("0.20")), "$12.90")
check("the total at 20% is $77.40",
      money(Decimal("64.50") * Decimal("1.20")), "$77.40")
check("split four ways the tip is $3.23", money(Decimal("12.90") / 4), "$3.23")
check("and each total is $19.35", money(Decimal("77.40") / 4), "$19.35")
check("22% is $14.19", money(Decimal("64.50") * Decimal("0.22")), "$14.19")
check("the 15% to 22% range is $4.51",
      money(Decimal("14.19") - Decimal("9.68")), "$4.51")
check("15% against 20% is about 81 cents a person",
      money((Decimal("12.90") - Decimal("9.68")) / 4), "$0.81")
check("the 8% sales tax is $5.16",
      money(Decimal("64.50") * Decimal("0.08")), "$5.16")
check("20% of the post-tax total is $13.93",
      money(Decimal("64.50") * Decimal("1.08") * Decimal("0.20")), "$13.93")
check("which is $1.03 more", money(Decimal("13.93") - Decimal("12.90")), "$1.03")
check("an effective 21.6% of the pre-tax bill",
      f"{(Decimal('13.93') / Decimal('64.50') * 100).quantize(Decimal('0.1'))}%",
      "21.6%")

print("\n" + "=" * 68)
failed = checks.count(False)
print(f"  {len(checks) - failed} passed, {failed} failed")
print("=" * 68)
raise SystemExit(1 if failed else 0)
