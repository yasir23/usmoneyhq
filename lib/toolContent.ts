/**
 * Deep content for the core tool pages.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * AdSense rejected usmoneyhq.com for "Low value content", asking for "substantial
 * unique value". Pruning the near-duplicate variant pages was necessary but not
 * sufficient: measured 2026-09-26, the surviving core pages were still thin.
 *
 *   /mortgage-calculator            452 words
 *   /guides/401k-guide              560 words
 *   /guides/best-budgeting-apps     570 words
 *
 * A calculator plus a paragraph is not "substantial". The variant problem was
 * about duplication; this problem is about depth, and they need separate fixes.
 *
 * ── WHAT GOES HERE ──────────────────────────────────────────────────────────
 * Material a reader cannot get from the calculator itself:
 *   - how the maths actually works, so the output is interpretable
 *   - a worked example with arithmetic that can be checked by hand
 *   - what genuinely changes the answer, and by how much
 *   - the mistakes that produce a wrong number
 *
 * ── RULES FOR ADDING TO THIS FILE ───────────────────────────────────────────
 * 1. Every number must be verifiable by hand from the stated inputs. Figures
 *    below were computed, not recalled. If you cannot show the arithmetic, do
 *    not state the figure.
 * 2. Tax RATES change annually and vary by state. This file describes MECHANICS
 *    (what FICA is, how withholding works) and defers to the calculator for
 *    amounts. Do not hard-code bracket thresholds here — they go stale silently
 *    and this is a financial site.
 * 3. No advice. Explain how a figure is produced; never tell a reader what to do
 *    with their money.
 * 4. Do not restate the tool's FAQ (lib/tools.ts) or the guide FAQ
 *    (lib/guideFaq.ts). Three copies of one answer competes with itself.
 */
export type WorkedRow = { label: string; value: string; note?: string };

export type ToolContent = {
  /** One paragraph of framing — what this tool answers and why it is not obvious. */
  intro: string;
  /** How the maths works. Two to four short blocks. */
  mechanics: { title: string; body: string }[];
  /** A worked example whose arithmetic the reader can check. */
  example: { title: string; setup: string; rows: WorkedRow[]; conclusion: string };
  /** Errors that produce a wrong answer, not errors of judgement. */
  mistakes: { title: string; body: string }[];
};

export const TOOL_CONTENT: Record<string, ToolContent> = {
  "mortgage-calculator": {
    intro:
      "A mortgage payment is not one number. It is four, and only one of them builds equity. This calculator separates them so you can see what you are actually buying over 30 years — which is usually a house plus a second house's worth of interest.",
    mechanics: [
      {
        title: "The payment formula",
        body: "Your principal-and-interest payment comes from M = P x r / (1 - (1 + r)^-n), where P is the loan amount, r is the monthly interest rate (annual rate divided by 12) and n is the number of monthly payments. The formula does not care about the house price, your income or your credit score — only those three numbers. Everything else changes which numbers you put in.",
      },
      {
        title: "Why the first years feel like nothing is happening",
        body: "Interest is charged on the balance that is still outstanding. At the start that balance is the whole loan, so interest is at its largest and almost the entire payment goes to it. As the balance falls, the interest share falls with it and the principal share rises — slowly at first, then faster. This is amortisation: the payment is fixed, the split inside it is not.",
      },
      {
        title: "What the calculator leaves out",
        body: "Property tax and homeowners insurance are usually collected monthly as escrow, and they rise with assessed value and rebuild cost rather than with your loan. Mortgage insurance applies if you put down less than 20% and is calculated on the loan, not the price. HOA dues are separate again. Two houses at the same price in different counties can differ by hundreds per month on these alone.",
      },
    ],
    example: {
      title: "Worked example: $400,000 at 6.5% over 30 years",
      setup:
        "Loan amount $400,000. Annual rate 6.5%, so the monthly rate is 0.065 / 12 = 0.00541667. Term 30 years = 360 payments. No down payment is modelled because the loan amount is already given.",
      rows: [
        { label: "Monthly payment (P&I)", value: "$2,528.27", note: "400000 x 0.00541667 / (1 - (1.00541667)^-360)" },
        { label: "Interest in payment 1", value: "$2,166.67", note: "0.00541667 x 400000 — the whole balance" },
        { label: "Principal in payment 1", value: "$361.61", note: "2528.27 - 2166.67" },
        { label: "Share of payment 1 that is interest", value: "85.7%", note: "2166.67 / 2528.27" },
        { label: "Total paid over the term", value: "$910,178", note: "2528.27 x 360" },
        { label: "Total interest over the term", value: "$510,178", note: "910178 - 400000" },
      ],
      conclusion:
        "You borrow $400,000 and repay $910,178. Of the first payment, $361.61 — 14.3% — reduces what you owe; the other 85.7% rents the money for one month. That ratio inverts around year 19 on a 30-year term, which is why an extra payment made early is worth far more than the same payment made later.",
    },
    mistakes: [
      {
        title: "Entering the purchase price as the loan amount",
        body: "The formula takes the amount borrowed, not the price. Put 20% down on a $400,000 house and the loan is $320,000 — entering $400,000 overstates the payment by 25%.",
      },
      {
        title: "Comparing a 15-year payment to a 30-year payment at the same rate",
        body: "The shorter term has a higher payment but a far lower total cost. At 6.5%, $400,000 over 15 years costs about $3,484 a month and roughly $227,000 in interest — versus $910,178 total on the 30-year. The monthly difference is real; so is the $283,000 you do not pay.",
      },
      {
        title: "Ignoring escrow when budgeting",
        body: "Principal and interest is the part the bank collects for lending. Tax and insurance commonly add 20-40% on top of it, and they are not fixed for the life of the loan.",
      },
    ],
  },

  "salary-after-tax-calculator": {
    intro:
      "Gross salary is what you negotiate. Take-home pay is what you spend. The gap is not one tax — it is federal income tax, FICA, and a state layer that varies from nothing at all to among the highest in the country.",
    mechanics: [
      {
        title: "Three separate systems, one payslip",
        body: "Federal income tax is progressive: the rate applies to income within each band, not to the whole amount, so moving into a higher bracket never reduces your take-home. FICA is flat and separate — it funds Social Security and Medicare, and unlike income tax it is not progressive across its whole range. State tax is a third system with its own rules; some states levy no income tax at all, some levy a flat rate, and some are as progressive as the federal scale.",
      },
      {
        title: "Withholding versus liability",
        body: "The amount withheld from each payslip is an estimate. It is calculated from your W-4 answers, which describe your situation rather than your final income. Get it roughly right and you settle up at filing; get it badly wrong and you either hand over an interest-free loan all year or owe a lump sum with a possible underpayment penalty.",
      },
      {
        title: "What moves the number most",
        body: "Pre-tax deductions — a traditional 401(k), an HSA, qualifying health premiums — reduce taxable income before the calculation, so they cut both income tax and, in most cases, state tax. Roth contributions do not, because they are taxed now. Filing status changes the brackets themselves, which is usually a larger effect than any single deduction.",
      },
    ],
    example: {
      title: "Worked example: reading the three layers on $75,000",
      setup:
        "Gross $75,000, single, standard deduction, no pre-tax deductions, one illustrative state rate. Federal brackets and state rates change each year, so this shows the STRUCTURE rather than quoting a current-year outcome — the calculator uses the live figures.",
      rows: [
        { label: "Gross", value: "$75,000", note: "starting point" },
        { label: "Less pre-tax deductions", value: "-$0", note: "none in this example" },
        { label: "Federal income tax", value: "progressive", note: "each band taxed at its own rate" },
        { label: "Social Security", value: "6.2%", note: "of covered wages, up to the annual wage base" },
        { label: "Medicare", value: "1.45%", note: "no wage cap; +0.9% above the additional-Medicare threshold" },
        { label: "State income tax", value: "0% to ~13%", note: "depends entirely on the state" },
      ],
      conclusion:
        "Two salaries of $75,000 in different states are not the same job. Because FICA is fixed and federal tax is identical, the state layer is the entire difference — and it can be several thousand dollars a year. Choose the state using the calculator, not from memory.",
    },
    mistakes: [
      {
        title: "Applying your marginal rate to your whole salary",
        body: "If part of your income sits in a higher band, only that part is taxed at the higher rate. Multiplying the top rate by total income overstates the bill substantially and is the single most common error here.",
      },
      {
        title: "Assuming a raise can lower your take-home",
        body: "Under progressive brackets it cannot. Crossing into a higher bracket raises the rate on the income above the threshold only. Only a benefit phase-out can produce that effect, and that is a different mechanism.",
      },
      {
        title: "Forgetting that 401(k) contributions come out pre-tax",
        body: "A 10% contribution on $75,000 removes $7,500 from taxable income now. The effect on take-home is smaller than the contribution itself, because the tax that would have been paid on it is not paid. Roth contributions work the opposite way.",
      },
    ],
  },

  "paycheck-calculator": {
    intro:
      "The same annual salary produces different payslips depending on how often you are paid and when the pay period ends. This calculator answers the question people actually ask — how much arrives, and on which dates.",
    mechanics: [
      {
        title: "Frequency does not change the annual total",
        body: "Biweekly means 26 paychecks a year; semimonthly means 24. Multiply either by the per-paycheck figure and you reach the same annual amount. What changes is the size of each payment and, twice a year, which month receives three payments instead of two.",
      },
      {
        title: "The three-paycheck months",
        body: "On a biweekly schedule, most months contain two paydays but two months a year contain three. Those months are not a bonus — they are the same annual salary arriving unevenly. They are, however, the cheapest months to make an extra debt payment, because the budget has already been built around two.",
      },
      {
        title: "Why per-paycheck amounts are not simply annual divided by 26",
        body: "Deductions can be per-period or per-annualised limits. A deduction capped at an annual figure — a 401(k) contribution limit, for example — is spread across the remaining pay periods, so the per-paycheck amount changes once the cap is reached and stops. Health premiums are usually per-period and do not.",
      },
    ],
    example: {
      title: "Worked example: $75,000 the same salary, three schedules",
      setup: "Gross annual $75,000, no deductions modelled, to isolate the effect of frequency alone.",
      rows: [
        { label: "Monthly (12)", value: "$6,250.00", note: "75000 / 12" },
        { label: "Semimonthly (24)", value: "$3,125.00", note: "75000 / 24" },
        { label: "Biweekly (26)", value: "$2,884.62", note: "75000 / 26" },
        { label: "Weekly (52)", value: "$1,442.31", note: "75000 / 52" },
        { label: "Annual, any schedule", value: "$75,000", note: "identical — only the slices differ" },
      ],
      conclusion:
        "Biweekly pay feels smaller per paycheck and produces two three-paycheck months a year. The annual figure never changes. If you are budgeting against a biweekly income, divide by 26 but plan on 24 — the other two are where the slack comes from.",
    },
    mistakes: [
      {
        title: "Budgeting from one paycheck and multiplying by 24",
        body: "If you are paid biweekly you receive 26, not 24. Budgeting on 24 is a deliberate buffer; believing you are only paid 24 is an error worth two months of income per year.",
      },
      {
        title: "Treating a three-paycheck month as extra income",
        body: "It is a timing effect, not additional pay. Treating it as a windfall means the following month is short.",
      },
      {
        title: "Comparing a biweekly paycheck to a semimonthly one directly",
        body: "A biweekly paycheck is smaller and arrives more often. Compare annual totals, or convert both to the same frequency first.",
      },
    ],
  },

  "tax-calculator": {
    intro:
      "Income tax is progressive, which means the average rate you pay is always lower than the rate on your last dollar. Confusing the two is the most common source of a wrong estimate, in both directions.",
    mechanics: [
      {
        title: "Marginal and effective are different numbers",
        body: "Your marginal rate applies to the next dollar you earn. Your effective rate is total tax divided by total income, and it is always lower because the earlier bands were taxed less. A single filer can have a marginal rate well above their effective rate without anything unusual happening.",
      },
      {
        title: "Deductions act before the brackets",
        body: "A deduction reduces taxable income, so its value depends on the bracket it comes off. The same $1,000 deduction is worth more to a higher earner, which is why deductions and credits are not interchangeable. A credit reduces the tax itself and is worth the same to everyone who can use it.",
      },
      {
        title: "FICA sits outside this entirely",
        body: "Social Security and Medicare are calculated on wages with their own rates and their own ceilings, and the standard deduction does not reduce them. A paystub mixes the two systems; they are not one calculation.",
      },
    ],
    example: {
      title: "Worked example: why the average rate is lower",
      setup:
        "Illustrative bands, shown only to demonstrate the mechanism. Real thresholds change every year and vary by filing status — the calculator applies the live figures.",
      rows: [
        { label: "Band 1", value: "10%", note: "applies only to income inside band 1" },
        { label: "Band 2", value: "12%", note: "applies only to income inside band 2" },
        { label: "Band 3", value: "22%", note: "applies only to income inside band 3" },
        { label: "Marginal rate", value: "the top band you reach", note: "what the next dollar costs" },
        { label: "Effective rate", value: "total tax / total income", note: "always below the marginal rate" },
      ],
      conclusion:
        "Only the income inside each band is taxed at that band's rate. This is why a raise always increases take-home pay, and why quoting your marginal rate as your tax bill is wrong by a wide margin.",
    },
    mistakes: [
      {
        title: "Multiplying total income by the top bracket rate",
        body: "That treats every dollar as if it were the last dollar. It overstates the bill and is the reason people expect a raise to cost them money.",
      },
      {
        title: "Confusing a deduction with a credit",
        body: "A $1,000 deduction saves you $1,000 multiplied by your marginal rate; a $1,000 credit saves you $1,000. Assuming a deduction is worth its face value overstates the benefit.",
      },
      {
        title: "Using last year's brackets",
        body: "Thresholds are adjusted most years. A figure recalled from a previous filing season can be wrong by enough to change the answer.",
      },
    ],
  },

  "debt-payoff-calculator": {
    intro:
      "Two debts with the same balance are not equally expensive. What determines how much a debt costs — and how long it holds you — is the interest rate, and then how much of each payment goes to reducing the balance rather than servicing it.",
    mechanics: [
      {
        title: "Minimum payments are designed around interest, not principal",
        body: "A minimum payment is usually a small percentage of the balance, which means as the balance falls the payment falls with it — and the principal barely moves. This is why a card can sit near its limit for years on minimums. The payment shrinking is the mechanism, not bad luck.",
      },
      {
        title: "Interest accrues daily on most cards",
        body: "Card interest typically compounds daily on the average daily balance. A rate quoted as annual is divided across the year and applied continuously, so the effective annual cost is slightly higher than the quoted rate. The higher the balance and the longer it sits, the more that difference matters.",
      },
      {
        title: "One extra payment changes the curve",
        body: "An extra payment reduces the balance immediately, which reduces every subsequent interest charge, which sends more of every future payment to principal. The effect compounds. This is why a modest regular extra payment outperforms a larger one-off made later.",
      },
    ],
    example: {
      title: "Worked example: a $5,000 balance at 22% APR",
      setup:
        "Balance $5,000. APR 22%, so the monthly rate is 0.22 / 12 = 0.0183333. Interest in month one is 5000 x 0.0183333 = $91.67. Compared at two payment levels.",
      rows: [
        { label: "Interest, month 1", value: "$91.67", note: "0.0183333 x 5000" },
        { label: "At $100/month", value: "principal falls by ~$8", note: "100 - 91.67" },
        { label: "At $200/month", value: "principal falls by ~$108", note: "200 - 91.67" },
        { label: "The difference", value: "~13x more principal", note: "for 2x the payment" },
      ],
      conclusion:
        "At $100 a month, almost the entire payment is rent on the balance — you are clearing about $8 of debt in month one. Doubling the payment does not halve the term; it clears roughly thirteen times more principal in the first month. That is why the payoff curve is steep at first and flattens as it works.",
    },
    mistakes: [
      {
        title: "Comparing balances and ignoring rates",
        body: "A $2,000 balance at 29% costs more per year than a $5,000 balance at 9%. Ranking debts by size rather than rate gets the order wrong.",
      },
      {
        title: "Assuming the quoted APR is the monthly cost",
        body: "An APR is annual. Divided by 12 it becomes the monthly rate — 22% APR is about 1.83% per month, not 22% per month. Reading it as monthly makes every projection wildly wrong.",
      },
      {
        title: "Ignoring that minimum payments shrink",
        body: "Projecting a fixed minimum payment forward overstates how fast the debt clears. On a percentage-based minimum, the payment falls as the balance does, so the real payoff date is later than a fixed-payment model suggests.",
      },
    ],
  },

  "cd-calculator": {
    intro:
      "A CD quote is a yield, not an interest rate, and the two are not interchangeable. Enter an APY into a formula that expects a nominal rate and you compound the compounding — the answer comes out slightly too high, in your favour, which is the kind of error that never gets double-checked.",
    mechanics: [
      {
        title: "APY already includes the compounding",
        body: "APY stands for annual percentage yield. By definition it is the total return over one year with compounding already folded in, which is exactly why a bank advertises it rather than a nominal rate. So one year at 4.5% APY grows a deposit by precisely 1.045 — no monthly step is needed, because the monthly step is what produced the 4.5% in the first place.",
      },
      {
        title: "Part-year terms use a fractional power",
        body: "A six-month term at 4.5% APY does not earn half of 4.5%. It earns 1.045^(6/12) - 1, about 2.23%, because the yield is a compounded annual figure and half a year is half a year of compounded growth. Dividing the APY by two is the common shortcut and it is close, but it is not the same number.",
      },
      {
        title: "What is not modelled",
        body: "Early-withdrawal penalties, the fact that many CDs renew automatically at whatever rate is then on offer, and tax on the interest. Interest on a CD is generally taxable in the year it is credited, even if the term runs past that year, so the maturity value is not the same as what you keep.",
      },
    ],
    example: {
      title: "Worked example: $25,000 at 4.5% APY for 12 months",
      setup:
        "Deposit $25,000. Quoted APY 4.5%. Term 12 months, so the growth factor is 1.045 over the full year.",
      rows: [
        { label: "Maturity value", value: "$26,125.00", note: "25000 x 1.045" },
        { label: "Interest earned", value: "$1,125.00", note: "26125 - 25000" },
        { label: "Effective return", value: "4.5%", note: "the quoted APY, by definition" },
      ],
      conclusion:
        "The whole calculation is one multiplication, because the compounding is already inside the APY. Treating 4.5% as a monthly-compounded nominal rate instead would give $26,148.50 — $23.50 more, and wrong.",
    },
    mistakes: [
      {
        title: "Compounding an APY as if it were a nominal rate",
        body: "Take 4.5%, divide by 12, compound for twelve months, and you have applied compounding twice: once when the bank calculated the yield and once in your own arithmetic. On $25,000 that is a $23.50 overstatement, and it scales with the deposit.",
      },
      {
        title: "Comparing a CD APY to a savings account's nominal rate",
        body: "An APY and a nominal rate with the same number are not the same deal. 4.5% APY beats 4.5% nominal compounded monthly, because the APY figure has already banked the monthly compounding. Compare APY to APY.",
      },
      {
        title: "Assuming the maturity value is what you keep",
        body: "Interest credited during the term is generally taxable that year. The maturity figure is the balance before tax, and for a deposit large enough for the interest to matter, the after-tax difference is real.",
      },
    ],
  },

  "roi-calculator": {
    intro:
      "A 25% return sounds like a 25% return until you ask over how long. The same gain is excellent over one year, respectable over three, and worse than a savings account over fifteen — which is why total return and annualised return have to be read together.",
    mechanics: [
      {
        title: "Total return is the simple ratio",
        body: "ROI is gain divided by what you put in: invest $10,000, end with $12,500, and the gain is $2,500 on $10,000, so 25%. It compares the endpoints and ignores everything that happened between them, including how long the money was committed.",
      },
      {
        title: "Annualising is what makes returns comparable",
        body: "To put a return on the same footing as any other, you annualise it: (end / start)^(1 / years) - 1. The exponent is what makes it a rate rather than a total. A 25% total gain over three years is 1.25^(1/3) - 1, which is about 7.72% a year.",
      },
      {
        title: "What ROI cannot tell you",
        body: "It has no view on risk, on how long the capital was tied up beyond the annualisation, on cash flows in and out during the period, or on tax and fees. It is a comparison of two numbers, and it is honest about being only that.",
      },
    ],
    example: {
      title: "Worked example: $10,000 becomes $12,500 over 3 years",
      setup:
        "Investment $10,000. Gain $2,500. Holding period 3 years. The annualised figure applies the same growth rate to each year, which is what makes it comparable to a quoted rate elsewhere.",
      rows: [
        { label: "Total gain", value: "$2,500.00", note: "12500 - 10000" },
        { label: "ROI", value: "25.00%", note: "2500 / 10000" },
        { label: "Annualised return", value: "7.72%", note: "1.25^(1/3) - 1, displayed rounded" },
        { label: "Exact annualised rate", value: "7.7217%", note: "10000 x 1.077217^3 = 12500.00" },
      ],
      conclusion:
        "The 25% headline and the 7.72% annualised return describe the same outcome. If the same $2,500 gain had taken one year, the annualised figure would also be 25% — the annualisation is what separates the two cases, and the total return cannot.",
    },
    mistakes: [
      {
        title: "Comparing annualised returns to total returns",
        body: "A 25% total over three years and a 25% annual return differ by a factor of about three in outcome. Putting them side by side without annualising one of them reverses which is the better result.",
      },
      {
        title: "Adding contributions to the gain instead of to the basis",
        body: "If you invested $10,000 and later added $5,000, the denominator is not $10,000. Money added partway through also was not invested for the whole period, so a simple ROI on total contributions overstates the return.",
      },
      {
        title: "Ignoring the holding period when the term is short",
        body: "A 10% gain in three months annualises to roughly 46%. That number is arithmetically correct and often misleading, because a short run is not evidence of a repeatable rate. Annualising amplifies short periods in both directions.",
      },
    ],
  },

  "emergency-fund-calculator": {
    intro:
      "The size of an emergency fund is not a number anyone can hand you — it is your monthly essential spending multiplied by how long you think it would take to replace your income. Change either input and the answer moves, which is why the useful question is which of the two you should be changing.",
    mechanics: [
      {
        title: "It is a multiplication, not a rule",
        body: "Target equals essential monthly expenses multiplied by the number of months of cover you want. There is no data in the calculation at all — no interest, no inflation, no market return. The entire answer is your two inputs, which is why the number is only as good as they are.",
      },
      {
        title: "Which expenses count",
        body: "The input should be what you must pay to keep living: housing, food, utilities, transport, insurance, minimum debt payments. Discretionary spending does not need covering during a gap, and including it inflates the target enough that people abandon the goal. Excluding debt minimums does the opposite and understates it.",
      },
      {
        title: "Why the months multiplier varies so much",
        body: "A household with one income and specialised skills needs more months than one with two incomes in transferable work. The range typically cited runs from three months to twelve. It is a judgement about how long a search would take, not a figure that a calculator can derive for you.",
      },
    ],
    example: {
      title: "Worked example: $3,500 a month, 6 months of cover",
      setup:
        "Essential monthly expenses $3,500. Chosen cover 6 months. Nothing else enters the calculation.",
      rows: [
        { label: "Emergency fund target", value: "$21,000.00", note: "3500 x 6" },
        { label: "Months covered", value: "6", note: "the second input, carried through" },
        { label: "At 3 months of cover instead", value: "$10,500.00", note: "3500 x 3" },
        { label: "At 12 months of cover", value: "$42,000.00", note: "3500 x 12" },
      ],
      conclusion:
        "The target is linear in both inputs, so doubling the months doubles the number. That is why the honest answer to \"how much should I have\" is a range driven by the cover you want, not a single figure — and why $10,500 and $42,000 are both defensible for the same household.",
    },
    mistakes: [
      {
        title: "Budgeting from income instead of expenses",
        body: "The fund replaces spending, not earnings. Someone earning $6,000 and spending $3,500 needs to cover $3,500 a month; sizing from income overstates the target by about 70% and makes the goal look unachievable.",
      },
      {
        title: "Leaving out irregular costs",
        body: "Insurance premiums paid annually, car maintenance and property tax are essential and easy to omit because they do not appear in a normal month. Divide each by twelve and add it, or the monthly figure is too low in exactly the month it matters.",
      },
      {
        title: "Counting the fund as an investment",
        body: "A fund held in something that can fall is not a fund. The purpose is availability on a bad day, which caps the return you should be chasing. Its job is to stop one bad month becoming debt, and that is a real return even though it does not appear in the percentage.",
      },
    ],
  },

  "break-even-calculator": {
    intro:
      "Break-even is the point where contribution covers fixed cost, and the number that matters is not revenue — it is how many units of contribution you need. That distinction decides whether a business is viable more often than the price does.",
    mechanics: [
      {
        title: "Contribution per unit",
        body: "Price minus variable cost. Sell something for $25 that costs $10 to make and deliver, and each sale contributes $15 toward fixed costs. Variable cost is the part that only exists because the sale happened; fixed cost is the part that exists either way.",
      },
      {
        title: "Dividing fixed cost by contribution",
        body: "Units to break even equals total fixed cost divided by contribution per unit. Since you cannot sell a fraction of a unit, the answer rounds up — and that rounding is not cosmetic, because the last unit is the one that tips the business from loss to zero.",
      },
      {
        title: "What break-even does not mean",
        body: "Hitting it means profit is zero, not that the business is healthy. It says nothing about whether you can sell that many units, whether demand exists at that price, or whether fixed costs stay fixed as volume rises. It is a threshold, not a forecast.",
      },
    ],
    example: {
      title: "Worked example: $50,000 fixed costs, $25 price, $10 variable cost",
      setup:
        "Fixed costs $50,000. Selling price $25 per unit. Variable cost $10 per unit. Contribution per unit is therefore $15, and every unit beyond the break-even point adds $15 to profit.",
      rows: [
        { label: "Contribution per unit", value: "$15.00", note: "25 - 10" },
        { label: "Units to break even", value: "3334", note: "50000 / 15 = 3333.33, rounded up" },
        { label: "Revenue at break-even", value: "$83,350.00", note: "3334 x 25" },
        { label: "Profit at 3333 units", value: "-$5.00", note: "3333 x 15 = 49995, so 5 short of fixed cost" },
        { label: "Profit at 4000 units", value: "$10,000.00", note: "(4000 - 3333.33) x 15" },
      ],
      conclusion:
        "The business breaks even at 3,334 units and $83,350 of revenue. Rounding down to 3,333 leaves it a few dollars short — the fractional unit is the difference between a loss and zero, which is why the tool rounds up rather than to nearest.",
    },
    mistakes: [
      {
        title: "Using gross revenue as the contribution",
        body: "Fixed costs are not covered by the full selling price, only by the margin left after variable cost. Dividing $50,000 by the $25 price gives 2,000 units — about 40% fewer than the true figure, and a break-even that never breaks even.",
      },
      {
        title: "Treating a step-fixed cost as fixed",
        body: "Hiring another shift, renting more space or adding a machine moves fixed cost in steps. The break-even you calculate is valid only up to the volume where the next step happens — beyond that, the whole calculation has a different answer.",
      },
      {
        title: "Reading break-even as the target",
        body: "Break-even is where profit is zero. A plan whose goal is break-even is a plan to work for nothing. The useful number is break-even plus the profit you need, in units.",
      },
    ],
  },

  "401k-calculator": {
    intro:
      "The employer match is the part of a 401(k) where the return is immediate and unrelated to markets. Getting it right is mostly about one threshold — the cap — and understanding that contributions above it do nothing to the match.",
    mechanics: [
      {
        title: "The match has a cap, and the cap is a percentage of salary",
        body: "Employers typically match a percentage of what you contribute, but only up to a set percentage of your salary. On an $85,000 salary with a 6% cap, the employer will match contributions on the first $5,100 a year — $425 a month. That threshold is the number worth knowing.",
      },
      {
        title: "Below the cap, above the cap, and in between",
        body: "Contribute less than $425 a month and you leave matched money on the table. Contribute exactly $425 and you capture all of it. Contribute more and the extra still grows tax-deferred, but it earns no additional match — the calculator shows the monthly total the match produces, not a limit on what you may contribute.",
      },
      {
        title: "What the projection assumes",
        body: "A constant annual return, compounded monthly, with the same contribution every month for the whole period. Real returns vary and the order matters: the same average return delivered as early losses rather than early gains produces a lower balance. The projection is a straight line through a path that will not be straight.",
      },
    ],
    example: {
      title: "Worked example: $25,000 balance, $500 a month, 6% cap, 25 years",
      setup:
        "Current balance $25,000. Contribution $500 a month. Employer matches 100% of contributions up to 6% of an $85,000 salary. Assumed return 7% a year compounded monthly, for 25 years (300 months).",
      rows: [
        { label: "Max matched contribution", value: "$425.00/mo", note: "85000 x 0.06 / 12" },
        { label: "Employer match per month", value: "$425.00", note: "contribution exceeds the cap, so the full cap is matched" },
        { label: "Monthly total going in", value: "$925.00", note: "500 + 425" },
        { label: "Projected balance in 25 years", value: "$892,451.77", note: "engine output: 300 monthly periods at 7%/12 on a 25,000 start" },
        { label: "Of which employer match", value: "$127,500", note: "425 x 300, before any growth on it" },
      ],
      conclusion:
        "Contributing $500 captures the entire $425 match, because the cap is set by salary rather than by contribution. The match alone adds $127,500 of contributions over 25 years, before the growth it earns — which is why the cap, not the contribution rate, is the number to check first.",
    },
    mistakes: [
      {
        title: "Reading the cap as a percentage of your contribution",
        body: "A 6% cap is 6% of salary, not 6% of what you pay in. Treating it as a share of the contribution understates the monthly match and makes the threshold look far higher than it is.",
      },
      {
        title: "Assuming the match continues above the cap",
        body: "Contributions beyond the capped amount receive no further match. They still grow tax-deferred, but the immediate return from the match stops at the threshold — which is why the two halves of a contribution decision are usually separate questions.",
      },
      {
        title: "Projecting a constant return as if it were certain",
        body: "The balance assumes the same 7% every month for 25 years. Markets do not deliver that, and the sequence of returns changes the answer: two portfolios with identical average returns end with different balances if one has its bad years early. Read the figure as a model, not a forecast.",
      },
    ],
  },

  "dti-calculator": {
    intro:
      "A debt-to-income ratio is the one number a lender works out about you without seeing your credit score, your savings or your job title. It compares what you already owe each month with what you earn before tax, and it decides whether the rest of your application is read at all.",
    mechanics: [
      {
        title: "Front-end and back-end answer different questions",
        body: "The front-end ratio divides your housing payment by your gross monthly income. The back-end ratio divides housing PLUS every other minimum debt payment by that same income. The front-end measures the house; the back-end measures you. Underwriting leans on the back-end, because a borrower with a modest house and three car loans is a worse risk than the ratio on the house alone suggests.",
      },
      {
        title: "The denominator is gross income, not take-home pay",
        body: "Lenders start from income before tax and payroll deductions. A ratio you build from your net pay uses a number that is typically 20-30% smaller, so it overstates the ratio and makes an approvable file look unapprovable. Variable income is treated just as carefully: overtime, commission and bonus are averaged, usually over two years, and counted only where they are likely to continue.",
      },
      {
        title: "Which debts count, and which do not",
        body: "Minimum payments on credit cards, car loans, student loans, personal loans and court-ordered child support all count. Groceries, utilities, phone bills, insurance held outside escrow and subscription services do not. Deferred student loans are the awkward case: many lenders impute a payment rather than accept the reported zero.",
      },
    ],
    example: {
      title: "Worked example: $8,000 of income, $1,800 housing, $700 of other debt",
      setup:
        "Gross monthly income $8,000. Housing payment $1,800, counted the way a lender counts it — principal, interest, taxes and insurance. Other minimum debt payments $700. Every figure below is the calculator's own output for those three inputs.",
      rows: [
        { label: "Gross monthly income", value: "$8,000", note: "the denominator" },
        { label: "Housing payment", value: "$1,800", note: "front-end numerator" },
        { label: "Other minimum debt", value: "$700", note: "added only to the back-end" },
        { label: "Front-end DTI", value: "22.5%", note: "1800 / 8000" },
        { label: "Back-end DTI", value: "31.25%", note: "2500 / 8000" },
        { label: "Mortgage qualification", value: "Likely ✓", note: "the calculator's verdict" },
      ],
      conclusion:
        "Both ratios sit under the 28/36 guideline and the back-end is comfortably below the 43% ceiling most conventional loans are written to. The two ratios are 8.75 points apart: the same $700 of car and card payments is entirely invisible to the front-end number, which is why a good front-end ratio on its own says very little.",
    },
    mistakes: [
      {
        title: "Building the ratio from take-home pay",
        body: "Run the same $2,500 of debt against a net figure of $6,400 instead of $8,000 gross and the back-end ratio rises above 39% — 2,500 divided by 6,400 — while the debt itself is unchanged. Nothing about the borrower moved; only the denominator did. Lenders use gross.",
      },
      {
        title: "Assuming a good front-end ratio is enough",
        body: "At $8,000 of income with a $2,880 housing payment the front-end ratio is exactly 36%, which reads as acceptable in isolation. Add $700 of other debt and the back-end reaches 44.75% — past the 43% line — and the calculator returns a borderline verdict. The housing payment is only part of what is measured.",
      },
      {
        title: "Treating 43% as a target rather than a ceiling",
        body: "43% is roughly where conventional underwriting stops, not where it aims, and two files at the same back-end ratio are not equal. A borrower at $8,000 with a $1,800 housing payment and $1,700 of card and car debt shows 22.5% front-end and 43.75% back-end: the housing leg is sustainable and the revolving debt is the part they can actually fix.",
      },
    ],
  },

  "personal-loan-calculator": {
    intro:
      "A personal loan is unsecured, which means the lender's only protection is the interest rate. That is why the same $15,000 costs wildly different amounts at different credit scores, and why the term you choose moves the total more than the rate you negotiate.",
    mechanics: [
      {
        title: "The payment is an amortising payment, not a flat charge",
        body: "Each monthly payment covers the interest that accrued on the outstanding balance and applies whatever is left over to the balance itself. Early payments are therefore mostly interest; the split shifts toward principal as the balance falls. The arithmetic is the same amortisation formula a mortgage uses — only the term is shorter and the rate is higher.",
      },
      {
        title: "Term is the bigger lever",
        body: "Stretching the term lowers the payment because the principal is spread over more months, but interest then accrues for longer on a larger average balance. On a $15,000 loan at 11.5% the payment falls by about a third when the term goes from 36 to 60 months, while the total interest rises by roughly 70%. The payment is the visible number; the total cost is the real one.",
      },
      {
        title: "The APR includes the fee; the rate does not",
        body: "Origination fees are commonly 1-8% of the amount borrowed and are baked into the APR rather than the rate. That means a 10% loan with a large fee can carry a higher APR than an 11% loan with none. Compare APRs, then ask what the fee is and whether it is deducted from the proceeds.",
      },
    ],
    example: {
      title: "Worked example: $15,000 at 11.5% over 36 months",
      setup:
        "Loan amount $15,000. Annual rate 11.5%, so the monthly rate is 0.115 / 12 = 0.00958333. Term 36 months. The 60-month comparison uses the identical loan and rate — only the term changes.",
      rows: [
        { label: "Loan amount", value: "$15,000.00", note: "principal" },
        { label: "Monthly payment", value: "$494.64", note: "36-month term" },
        { label: "Total interest", value: "$2,807.04", note: "494.64 x 36 - 15,000" },
        { label: "Total cost", value: "$17,807.04", note: "494.64 x 36" },
        { label: "Payment over 60 months", value: "$329.89", note: "about a third lower" },
        { label: "Interest over 60 months", value: "$4,793.35", note: "about 70% higher" },
      ],
      conclusion:
        "You repay $17,807.04 on a $15,000 loan — 18.7% more than you borrowed. Moving to 60 months cuts the monthly payment by a third but raises the interest to $4,793.35 — about $1,986 more than the shorter term. The 60-month loan feels cheaper every month and is more expensive overall.",
    },
    mistakes: [
      {
        title: "Comparing the payment instead of the total cost",
        body: "$329.89 looks better than $494.64 on a monthly budget, but the longer loan costs about $1,986 more in interest for nothing except the right to pay later. If the shorter payment is genuinely unaffordable, the honest question is whether the loan amount is too large — not whether the term can be stretched.",
      },
      {
        title: "Budgeting for the rate you want rather than the rate you qualify for",
        body: "Personal loan APRs span roughly 6% to 36%. On the same $15,000 over 36 months, 22% instead of 11.5% raises the payment to $572.86 and the total interest to $5,622.84 — just over double, for identical terms. The rate is set by credit, not by negotiation, so comparing several lenders matters more than talking one down.",
      },
      {
        title: "Consolidating credit cards and then using them again",
        body: "The saving here comes from the APR gap, and it only survives if the cards stay at zero. Once they carry a balance again you are servicing the loan and the cards at the same time, and the fixed payment you took on has removed the flexibility you would have had without it.",
      },
    ],
  },

  "fha-mortgage-calculator": {
    intro:
      "An FHA loan lets you buy with 3.5% down, and it charges for that privilege twice — once up front and once every month. Comparing the FHA note rate with a conventional one without the mortgage insurance is the most common way this loan gets mispriced by borrowers.",
    mechanics: [
      {
        title: "Two mortgage insurance charges, not one",
        body: "There is an upfront premium of 1.75% of the base loan amount, and an annual premium charged monthly. The upfront premium is normally financed rather than paid in cash, which means it joins the balance and you pay interest on it for the whole term. The annual premium is a separate line in the payment, not part of principal and interest.",
      },
      {
        title: "How the payment is assembled",
        body: "The base loan is the price minus the down payment. The upfront premium is 1.75% of that base. The amortised payment is then calculated on base plus upfront premium. The monthly mortgage insurance is charged separately, on the base loan. What leaves your account is principal and interest plus that monthly premium, before property tax and homeowners insurance, which this calculator does not model.",
      },
      {
        title: "Why the insurance does not go away",
        body: "On a loan with less than 10% down the annual premium runs for the life of the loan. That is the sharpest difference from conventional PMI, which must be cancelled automatically once the loan reaches 78% of the original value. The only exit from FHA insurance is to refinance into a conventional loan once there is enough equity to qualify.",
      },
    ],
    example: {
      title: "Worked example: $300,000 at 3.5% down, 6.8%, 30 years",
      setup:
        "Home price $300,000. Down payment 3.5% = $10,500, so the base loan is $289,500. Annual rate 6.8%, so the monthly rate is 0.068 / 12. The upfront premium is financed into the loan.",
      rows: [
        { label: "Down payment (3.5%)", value: "$10,500.00", note: "300,000 x 0.035" },
        { label: "Base loan amount", value: "$289,500.00", note: "300,000 - 10,500" },
        { label: "Upfront MIP (1.75%)", value: "$5,066.25", note: "289,500 x 0.0175, financed" },
        { label: "Principal + interest", value: "$1,920.35", note: "on 294,566.25 over 360 months" },
        { label: "Annual MIP (monthly)", value: "$132.69", note: "289,500 x 0.0055 / 12" },
        { label: "Total monthly payment", value: "$2,053.04", note: "principal, interest and MIP" },
      ],
      conclusion:
        "The balance actually amortised is $294,566.25 — $5,066.25 more than the house-minus-down figure most buyers budget for. Financing the upfront premium costs $33.03 a month and $11,890.14 over the 360 months, so paying it in cash is worth $11,890 of interest. The monthly insurance alone is $132.69, and across the term that is $47,767.50 on a loan where it does not stop.",
    },
    mistakes: [
      {
        title: "Budgeting the base loan rather than the financed balance",
        body: "The 1.75% upfront premium is usually rolled into the loan. Principal and interest on $294,566.25 is $1,920.35 a month; on the $289,500 base it would be $1,887.32. The $33.03 difference is the price of not paying the premium in cash, and over 30 years it compounds to $11,890.14.",
      },
      {
        title: "Assuming the mortgage insurance will cancel like PMI",
        body: "It will not. Below 10% down the annual premium is charged for the life of the loan, and it is not removed at 78% or 80% loan-to-value the way conventional private mortgage insurance is. Refinancing out of the FHA loan is the mechanism, and that has its own closing costs.",
      },
      {
        title: "Reading the monthly premium as fixed for the whole term",
        body: "This calculator holds the premium constant at 0.55% of the original base loan, which is close to the first years and slightly conservative later: FHA recalculates the annual premium each year on the outstanding balance, so it drifts down as the loan is paid off. Treat the monthly figure as an upper bound rather than a constant.",
      },
    ],
  },

  "401k-contribution-calculator": {
    intro:
      "The 401(k) decision most people get wrong is not whether to save — it is saving just below the employer match. A 4% match against a 3% contribution leaves a quarter of the free money unclaimed, and the deferral cap quietly decides how much of the rest you are allowed to shelter.",
    mechanics: [
      {
        title: "The match is a percentage of salary, capped by what you put in",
        body: "The employer rate applies to your salary, not to your contribution, and it is limited by how much you defer. A 4% match on $90,000 is $3,600 — but only if you contribute at least 4% yourself. Contribute 3% and the match is capped at your own $2,700; contribute 10% and the match is still $3,600. The first few percent of salary therefore carry a return no investment can match.",
      },
      {
        title: "The deferral limit is on your money, not the employer's",
        body: "Elective deferrals are capped at $24,500 for anyone under 50 in 2026, and the employer match sits outside that cap. At a high salary the percentage stops being the controlling number: 12% of $250,000 is $30,000, but only $24,500 can be deferred. Above that point the cap, not your chosen rate, sets the contribution.",
      },
      {
        title: "What the projection assumes",
        body: "The balance grows at 7% a year compounded monthly, with contributions added monthly until age 65. It does not model fund fees, salary growth, or the fact that the deferral limit changes over time. A fund fee is taken out of the return before you see it, so an expense ratio of 1% is a straight cut to the assumed 7% — over 30 years that is the difference between a large balance and a much larger one.",
      },
    ],
    example: {
      title: "Worked example: $90,000 salary, 8% contribution, 4% match, age 35",
      setup:
        "Salary $90,000. You elect 8%. The employer matches 4% of salary. Current balance $20,000, age 35, so 30 years of contributions. The balance compounds at 7% a year with monthly contributions.",
      rows: [
        { label: "Your annual contribution", value: "$7,200.00", note: "90,000 x 8%" },
        { label: "Employer match (annual)", value: "$3,600.00", note: "90,000 x 4%, fully collected" },
        { label: "Total annual (you + match)", value: "$10,800.00", note: "you keep the whole match" },
        { label: "Contribution rate of salary", value: "12.0%", note: "10,800 / 90,000" },
        { label: "Projected balance at 65", value: "$1,260,303.85", note: "7% a year, monthly compounding" },
      ],
      conclusion:
        "The $3,600 match is half of what you put in — an immediate 50% return before any investment performance, which is why the first 4% of salary is the highest-return contribution available to you. Elect 3% instead and the match is capped at your own $2,700 rather than the full $3,600, and the projection falls to $711,316.90: $548,986.95 less at 65 for $4,500 less contributed a year, before tax.",
    },
    mistakes: [
      {
        title: "Contributing below the match rate",
        body: "At 3% against a 4% match the employer's contribution is capped at your own $2,700, so $900 of the available match is simply forfeited every year. That is the one part of the account that costs you nothing to collect, and it is lost silently — there is no statement line for money that was never contributed.",
      },
      {
        title: "Reading the match as a share of your contribution",
        body: "A 4% match means 4% of salary, not 4% of what you defer. On $7,200 of deferrals a 4%-of-contribution reading would predict a $288 match; the figure is $3,600. The two interpretations differ by more than twelve times, and the mistake runs in the direction that makes saving look less valuable than it is.",
      },
      {
        title: "Treating a percentage as a plan at high income",
        body: "At $250,000, electing 12% implies $30,000 of deferrals, but the elective deferral limit stops it at $24,500. The percentage is no longer the controlling number, and a 5% match adds $12,500 on top for a combined 14.8% of salary — worth checking against the separate combined limit if you are also making after-tax contributions.",
      },
    ],
  },

  "percentage-calculator": {
    intro:
      "A percentage question is really three different questions, and mixing them up is the most common arithmetic error there is. Finding a share of a number, finding what share one number is of another, and applying a change all use the same symbol, and none of them use the same operation.",
    mechanics: [
      {
        title: "Three questions, three operations",
        body: "Finding 18% of 250 multiplies: 250 x 0.18. Finding what percent 45 is of 250 divides: 45 / 250. Raising 250 by 18% multiplies by 1.18, which is the original plus the increase; lowering it multiplies by 0.82, which is the original less the increase. The sign is notation, not an instruction — the operation comes from the sentence around it.",
      },
      {
        title: "A percentage without a base means nothing",
        body: "In 18% of 250 the base is 250. Every percentage is meaningless until the base is named: 10% of 250 is 25, while 10% of 2,500 is 250, a tenfold difference from the same percentage. Reporting that drops the base, such as prices rose 10%, is only interpretable because the base is understood to be the previous price.",
      },
      {
        title: "Percentage points are not percent",
        body: "A move from 4% to 6% is a rise of two percentage points, but it is a 50% increase, because 2 / 4 = 0.5. The same event described the two ways differs by a factor of twenty-five in the number quoted. Financial reporting keeps them separate for exactly this reason, and conflating them is a common way a small change is made to sound large.",
      },
    ],
    example: {
      title: "Worked example: one base, 250",
      setup:
        "Base 250. All three questions are asked of the same number so the operations can be compared directly rather than across different examples.",
      rows: [
        { label: "18% of 250", value: "$45.00", note: "250 x 0.18" },
        { label: "45 as a share of 250", value: "18.0%", note: "45 / 250 = 0.18" },
        { label: "250 raised by 18%", value: "$295.00", note: "250 x 1.18, or 250 + 45" },
        { label: "250 lowered by 18%", value: "$205.00", note: "250 x 0.82, or 250 - 45" },
        { label: "295 lowered by 18% (the round trip)", value: "$241.90", note: "295 x 0.82" },
      ],
      conclusion:
        "Raising by 18% and then lowering by 18% does not return you to 250: it lands on 241.90, a net fall of 8.10 or 3.24%. The second move is computed on 295, not on the original 250, so the two percentages act on different bases. The same asymmetry means a 25% loss needs a 33.33% gain to recover, because from 75 the missing 25 is 25 / 75 of what remains.",
    },
    mistakes: [
      {
        title: "Applying the percentage to the wrong base",
        body: "To raise a number by 18% you multiply the number by 1.18. Adding 18% of the increase, or applying 18% to a figure that has already been changed, compounds an error that grows with the size of the move. The base is the value before the change, always.",
      },
      {
        title: "Subtracting after adding instead of multiplying once",
        body: "To lower 250 by 18% the single operation is 250 x 0.82 = 205.00. Computing 250 - 45 gives the same answer here, which is why the shortcut feels safe, but it breaks the moment the change is applied more than once or the base itself moves.",
      },
      {
        title: "Reading a percentage-point move as a percentage change",
        body: "An interest rate going from 4% to 6% is not a 2% increase. It is a rise of two percentage points and an increase of 50%. The two readings differ by a factor of twenty-five, and the gap widens as the base shrinks, so it is largest precisely where it matters most.",
      },
    ],
  },

  "percentage-change-calculator": {
    intro:
      "A percentage change compares two values against the value you started from, not the value you ended at. That single choice is why a fall and a rise of the same size do not cancel out, and why a 50% drop needs a 100% gain to undo.",
    mechanics: [
      {
        title: "The denominator is the starting value",
        body: "From 80 to 92 the change is (92 - 80) / 80 = 12 / 80 = 15.0%. From 120 to 90 it is (90 - 120) / 120 = -30 / 120 = -25.0%. Dividing by the finishing value instead is a different measure entirely, and the size of the error depends on which direction the change went, so it does not cancel out across a series.",
      },
      {
        title: "Why equal and opposite changes do not cancel",
        body: "120 down 25% is 90. From 90, a 25% rise is 112.50, giving a net change of (112.50 - 120) / 120 = -6.25%. Each percentage is applied to whatever the value currently is, and after a fall that base is smaller, so the recovery move operates on less and recovers less.",
      },
      {
        title: "The recovery gain is always the larger number",
        body: "Undoing a fall of p requires a gain of p / (1 - p). A 25% fall needs 0.25 / 0.75 = 33.33%. A 50% fall needs 0.50 / 0.50 = 100%. A 75% fall needs 0.75 / 0.25 = 300%. The relationship is not linear and it becomes brutal at the extremes, which is the arithmetic behind the observation that losses are easier to make than to reverse.",
      },
    ],
    example: {
      title: "Worked example: 80 to 92, and 120 to 90",
      setup:
        "Both changes are measured against the starting value, then the second is run as a round trip to show the asymmetry.",
      rows: [
        { label: "80 to 92, absolute change", value: "+12", note: "92 - 80" },
        { label: "80 to 92, percentage change", value: "+15.0%", note: "12 / 80" },
        { label: "120 to 90, absolute change", value: "-30", note: "90 - 120" },
        { label: "120 to 90, percentage change", value: "-25.0%", note: "-30 / 120" },
        { label: "90 back up 25%, to", value: "$112.50", note: "90 x 1.25" },
        { label: "Net after the round trip", value: "-6.25%", note: "(112.50 - 120) / 120" },
      ],
      conclusion:
        "The round trip loses 6.25% because the +25% is charged on 90 rather than on 120. To actually get back to 120 from 90 requires a gain of 30 / 90 = 33.33%, not 25%. The same arithmetic underlies why a 20% portfolio loss needs a 25% gain, and a 50% loss needs 100%.",
    },
    mistakes: [
      {
        title: "Dividing by the finishing value",
        body: "Using the new value as the denominator gives (92 - 80) / 92 = 13.04% instead of the correct 15.0%. The error is small for small changes, which is what makes it survive review, and it grows quickly: for a doubling, the wrong method reports 50% where the change is 100%.",
      },
      {
        title: "Assuming a rise and a fall of the same size cancel",
        body: "They do not, and the residual is not rounding. A 10% fall followed by a 10% rise leaves you 1% down; a 25% fall followed by a 25% rise leaves you 6.25% down. The gap widens with the size of the swing, so it matters most in volatile series.",
      },
      {
        title: "Comparing percentage changes across different bases",
        body: "A rise from 1% to 2% is a 100% increase, and so is a rise from 1,000 to 2,000. Stated as percentage changes the two look identical, which is why rates that start near zero should be reported in percentage points instead. This is arithmetic, not a presentational preference.",
      },
    ],
  },

  "margin-calculator": {
    intro:
      "Margin is profit measured against the selling price. It answers what share of each dollar of revenue you keep, which is why it can never reach 100% — and why a 40% margin and a 40% markup are two different prices for the same item.",
    mechanics: [
      {
        title: "Margin divides by price",
        body: "Margin = (price - cost) / price. At a cost of 60 and a price of 100 the gross profit is 40 and the margin is 40 / 100 = 40.0%. The denominator is the revenue, so the result reads as the fraction of each sale you retain rather than the fraction you added on top.",
      },
      {
        title: "Why it cannot exceed 100%",
        body: "The numerator is a part of the denominator, so the ratio is bounded at 100% by construction. As cost approaches zero the margin approaches 100% without ever reaching it, and as cost rises above price the margin turns negative. A margin above 100% is not a good result, it is a sign the two figures were mixed up.",
      },
      {
        title: "Margins cannot be averaged across products",
        body: "A 50% margin on a 10 dollar item and a 10% margin on a 1,000 dollar item average to 30% if you take the simple mean, but the true blended margin is total profit over total revenue: (5 + 100) / (10 + 1,000) = 105 / 1,010 = 10.4%. The simple average overstates it by nearly three times because it gives the small sale the same weight as the large one.",
      },
    ],
    example: {
      title: "Worked example: cost 60, price 100",
      setup:
        "One sale, described both as a margin and as a markup, so the difference between the two measures is visible on identical inputs.",
      rows: [
        { label: "Gross profit", value: "$40.00", note: "100 - 60" },
        { label: "Margin", value: "40.0%", note: "40 / 100 — measured against price" },
        { label: "Markup", value: "66.67%", note: "40 / 60 — measured against cost" },
        { label: "Cost as a share of price", value: "60.0%", note: "60 / 100" },
        { label: "Margin plus cost share", value: "100.0%", note: "40.0 + 60.0" },
      ],
      conclusion:
        "Margin and the cost share of price always sum to 100%, because together they describe the whole of the selling price. Markup has no such ceiling and is the larger number: 66.67% against 40.0%. To convert markup to margin, use margin = markup / (1 + markup): 0.6667 / 1.6667 = 40.0%.",
    },
    mistakes: [
      {
        title: "Substituting markup for margin",
        body: "Adding 40% to a cost of 60 gives 84.00, which is a 28.57% margin — not 40%. The gap widens as the percentage rises, so the error is largest on the most profitable lines. To hit a 40% margin the price is 60 / 0.60 = 100.00, which is a 66.67% markup.",
      },
      {
        title: "Averaging margins across products of different prices",
        body: "As the mechanics above show, a 50% margin on a 10 dollar sale and a 10% margin on a 1,000 dollar sale give a simple average of 30% against a true blended margin of 10.4%. Weight by revenue, not by product count, or the average will describe a business that does not exist.",
      },
      {
        title: "Reading gross margin as the profit left over",
        body: "Gross margin covers the cost of the goods only. Operating expenses, payment processing, returns, and any marketplace fee sit below it. A 40% gross margin on a sale with a 15% platform fee and 3% processing is closer to 22% before a single overhead, and treating the gross figure as take-home is how a profitable-looking product is not.",
      },
    ],
  },

  "markup-calculator": {
    intro:
      "Markup is profit measured against cost. It answers how much you add on top of what you paid, which is the number a buyer needs, and it is always the larger of the two percentages describing the same sale.",
    mechanics: [
      {
        title: "Markup divides by cost",
        body: "Markup = (price - cost) / cost. At a cost of 60 and a price of 100 the gross profit is 40 and the markup is 40 / 60 = 66.67%. Because the denominator is the cost rather than the revenue, the result is not bounded at 100% — the same item can carry a 200% markup and still be profitable to sell.",
      },
      {
        title: "Converting between markup and margin",
        body: "The two are related by margin = markup / (1 + markup) and markup = margin / (1 - margin). A 40% margin is 0.40 / 0.60 = 66.67% markup. A 50% markup is 0.50 / 1.50 = 33.33% margin. Both directions work on the same underlying sale, so a conversion that does not round-trip means one of the inputs was wrong.",
      },
      {
        title: "They converge only at small numbers",
        body: "At a 10% markup the margin is 0.10 / 1.10 = 9.09%, a gap of under one point. At 50% the gap is nearly seventeen points, and at 100% markup the margin is 50%. The two measures are close exactly where the numbers are small, which is why someone who works only in low-margin categories can use them interchangeably for years and be caught out the first time they price something with real margin in it.",
      },
    ],
    example: {
      title: "Worked example: cost 60, 40% markup",
      setup:
        "A 40% markup is applied to a cost of 60, then the resulting margin is measured on the price produced.",
      rows: [
        { label: "Markup amount", value: "$24.00", note: "60 x 0.40" },
        { label: "Price", value: "$84.00", note: "60 x 1.40" },
        { label: "Gross profit at that price", value: "$24.00", note: "84 - 60" },
        { label: "Resulting margin", value: "28.57%", note: "24 / 84" },
        { label: "Price needed for a 40% margin", value: "$100.00", note: "60 / (1 - 0.40)" },
      ],
      conclusion:
        "A 40% markup produces a 28.57% margin, roughly eleven points below the number on the label. To reach a 40% margin the price must be 60 / 0.60 = 100.00, which is a 66.67% markup. The gap between 28.57% and 40% is not an edge case; it is the ordinary difference between the two measures at a mid-range percentage.",
    },
    mistakes: [
      {
        title: "Applying a margin target as a markup",
        body: "To achieve a stated margin, divide cost by (1 - margin) rather than multiplying by (1 + margin). On a cost of 60, a 40% margin needs 100.00 while a 40% markup gives 84.00 — a 16 dollar shortfall per unit that compounds across every sale and is invisible in a report that only tracks markup.",
      },
      {
        title: "Marking up an already marked-up figure",
        body: "Applying 40% twice to 60 gives 117.60, not 108.00, because the second application multiplies rather than adds. 60 x 1.40 x 1.40 = 117.60 against 60 x 1.80 = 108.00. Sequential percentage increases compound, which is useful when the increases are genuinely successive and wrong when they were meant to be summed.",
      },
      {
        title: "Comparing markups across businesses with different cost bases",
        body: "A 100% markup on a service with almost no marginal cost and a 100% markup on a physical product with shipping, storage and returns are not comparable outcomes. Markup describes the pricing rule, not the profitability, and two businesses can run identical markups with very different margins once the costs below the gross line are counted.",
      },
    ],
  },

  "rule-of-72-calculator": {
    intro:
      "The rule of 72 estimates how long money takes to double by dividing 72 by the percentage rate. It is an approximation with a known and predictable error, and knowing where it drifts is what separates using it from trusting it.",
    mechanics: [
      {
        title: "Where the number comes from",
        body: "Doubling requires (1 + r)^t = 2, so the exact answer is t = ln(2) / ln(1 + r). The rule replaces that with 72 / r, because ln(2) is about 0.693 and ln(1 + r) behaves like r for small rates. The numerator is 72 rather than 69.3 because 72 divides evenly by 2, 3, 4, 6, 8, 9 and 12, which makes it usable without a calculator. The convenience costs accuracy.",
      },
      {
        title: "How accurate it actually is",
        body: "At 6% the rule gives 12.00 years against an exact 11.90, an error of 0.10 years. At 8% it gives 9.00 against 9.01, an error of 0.01. At 12% it gives 6.00 against 6.12, an error of 0.12. The rule is most accurate near 8% and increasingly understates the time required as the rate rises, so it errs in the direction of optimism at high rates.",
      },
      {
        title: "What it does not model",
        body: "The rule assumes a single lump sum compounding at a constant rate with nothing added or removed. It ignores contributions, withdrawals, taxes on gains, fees, and any change in the rate. A portfolio that doubles on the rule of 72 while charging 1% a year has not doubled in the time the rule predicts, because the fee reduces the rate the rule is being applied to.",
      },
    ],
    example: {
      title: "Worked example: the rule against the exact result",
      setup:
        "Three rates, each compared against t = ln(2) / ln(1 + r). The exact figures are computed, not recalled.",
      rows: [
        { label: "At 6%: rule of 72", value: "12.00 years", note: "72 / 6" },
        { label: "At 6%: exact", value: "11.90 years", note: "ln2 / ln(1.06)" },
        { label: "At 8%: rule of 72", value: "9.00 years", note: "72 / 8" },
        { label: "At 8%: exact", value: "9.01 years", note: "ln2 / ln(1.08)" },
        { label: "At 12%: rule of 72", value: "6.00 years", note: "72 / 12" },
        { label: "At 12%: exact", value: "6.12 years", note: "ln2 / ln(1.12)" },
      ],
      conclusion:
        "The rule is very good at 8%, off by four days a decade at 6%, and off by about six weeks at 12%. The error always runs the same way as rates rise — the rule says the money doubles sooner than it will. For a rough sanity check that is fine; for comparing two specific rates it is better to compute both exactly, because the approximation error is larger than the difference between many rate pairs.",
    },
    mistakes: [
      {
        title: "Using it at high rates",
        body: "The approximation degrades as the rate rises. At 20% the rule gives 3.6 years against an exact 3.80, an error of over two months. At 36% the rule gives 2.0 years against 2.25, a quarter of a year. High-rate scenarios are exactly where people reach for the shortcut, and they are where it is worst.",
      },
      {
        title: "Applying it to contributions rather than a lump sum",
        body: "The rule describes a fixed balance growing at a fixed rate. A regular contribution schedule does not double on that schedule, because most of the money has not been invested for the full period. A monthly saver reaches a doubled balance sooner than a lump sum would, and the rule cannot express the difference.",
      },
      {
        title: "Reading the answer as a projection rather than an illustration",
        body: "The rule converts a rate into a time, and both numbers are assumptions. It assumes the rate is constant and realised, which no market guarantees. Treating the output as a forecast rather than a way to build intuition about compounding is the mistake; the arithmetic is sound, the assumption is not a fact.",
      },
    ],
  },

  "commission-calculator": {
    intro:
      "Commission is a percentage of a sale, but the sale is rarely the only number in the calculation. Splits, thresholds, tiers and whether the rate applies before or after costs all change the payout while leaving the headline percentage untouched.",
    mechanics: [
      {
        title: "The base is whatever the agreement says",
        body: "The same 6% can be computed on gross sale price, net of returns, net of fees, or on margin. On a 320,000 sale a 6% rate is 19,200 on the gross figure; on a net figure that is 10% lower the same rate pays 17,280. The percentage is the visible number and the base is the one that moves the result, which is why the base is what a commission agreement is really about.",
      },
      {
        title: "Tiers are usually marginal, not retroactive",
        body: "A plan that pays 5% to 200,000 and 8% above it does not necessarily pay 8% on everything once the threshold is crossed. Under a marginal structure the first 200,000 earns 5% and only the excess earns 8%, so a 300,000 total pays 10,000 + 8,000 = 18,000 rather than 24,000. Under a retroactive structure it pays 24,000. The difference on one deal is 6,000, and the two designs are frequently described with identical wording.",
      },
      {
        title: "Splits apply after the rate, not before",
        body: "A 60/40 split of a 6% commission on 320,000 gives you 19,200 x 0.60 = 11,520. Computing the split first and then the rate gives a different number if the two percentages are applied to different bases in between. Order matters whenever a step in the chain changes the base.",
      },
    ],
    example: {
      title: "Worked example: a 320,000 sale at two rates",
      setup:
        "The same sale priced at 6.0% and 5.5%, to show what a half-point change is worth in currency rather than in percentage.",
      rows: [
        { label: "320,000 at 6.0%", value: "$19,200.00", note: "320,000 x 0.06" },
        { label: "320,000 at 5.5%", value: "$17,600.00", note: "320,000 x 0.055" },
        { label: "Difference", value: "$1,600.00", note: "0.5% of 320,000" },
        { label: "The same half point on a 32,000 sale", value: "$160.00", note: "0.5% of 32,000" },
        { label: "Your 60% share of the 6% case", value: "$11,520.00", note: "19,200 x 0.60" },
      ],
      conclusion:
        "Half a percentage point is worth 1,600 on this sale and 160 on a tenth of it. The rate looks small and the base decides whether that is trivial or material, which is why commission negotiations that stay at the level of the percentage miss the part that matters. Under a marginal tier structure the same 300,000 in sales could pay 18,000 or 24,000 depending on a word in the plan document.",
    },
    mistakes: [
      {
        title: "Assuming a tier rate applies to the whole amount",
        body: "Marginal and retroactive tiers differ enormously, as the mechanics above show: 18,000 against 24,000 on the same 300,000 of sales. Confirm which structure the plan uses before modelling, because the two are often described the same way in conversation and defined differently in writing.",
      },
      {
        title: "Measuring commission against gross rather than net",
        body: "Returns, discounts and chargebacks reduce the amount actually collected. A 6% rate on a 320,000 gross sale that sees 12% returned pays on 281,600 if the agreement nets returns, which is 16,896 rather than 19,200. Whether the agreement nets them is the question, and the answer is in the contract rather than the plan summary.",
      },
      {
        title: "Comparing rates without comparing bases",
        body: "A 10% rate on a small base can pay less than 4% on a large one. The rate is the visible term and the base is the material one, so a comparison that lines up two percentages without lining up the amounts they are applied to will rank them incorrectly.",
      },
    ],
  },

  "savings-rate-calculator": {
    intro:
      "A savings rate is the share of income you do not spend, and it is the input that most determines how quickly saving stops being a constraint. It is also easy to compute against the wrong income, which makes a good rate look mediocre or the reverse.",
    mechanics: [
      {
        title: "Which income goes in the denominator",
        body: "Saving 780 a month out of 5,200 of take-home pay is 780 / 5,200 = 15.0%. Measured against a 6,500 gross salary the same 780 is 12.0%, and against a 5,200 net figure it is 15.0%. Both are defensible and they are not interchangeable, so a rate quoted without its base cannot be compared to another rate. Investment guidance usually means gross; personal tracking usually means take-home.",
      },
      {
        title: "Why the rate compounds faster than the amount",
        body: "An amount is fixed and a rate scales with income. If income rises 5% and the rate holds at 15%, contributions rise 5% too, without a decision being made. If the rate also rises to 20%, the increase is the income growth compounded with the rate change. This is why a rate is a policy and an amount is a number that needs revisiting.",
      },
      {
        title: "Windfalls distort a single month",
        body: "A tax refund, a bonus, or a month with no travel can push a calculated rate far above what the household actually sustains. Measuring one month at a time and averaging them gives equal weight to the unusual month and the ordinary ones. Annualising, or excluding known one-offs, produces a rate that can be planned against rather than admired.",
      },
    ],
    example: {
      title: "Worked example: 5,200 of take-home, 780 saved",
      setup:
        "Monthly figures used throughout, then annualised so the difference between two rates is visible in currency.",
      rows: [
        { label: "Monthly savings rate", value: "15.0%", note: "780 / 5,200" },
        { label: "Annual saved at 15%", value: "$9,360.00", note: "780 x 12" },
        { label: "Monthly saving needed for 20%", value: "$1,040.00", note: "5,200 x 0.20" },
        { label: "Annual saved at 20%", value: "$12,480.00", note: "1,040 x 12" },
        { label: "Extra per year from that 5 points", value: "$3,120.00", note: "12,480 - 9,360" },
      ],
      conclusion:
        "Moving from 15% to 20% adds 3,120 a year at constant income, which is 31,200 of contributions over a decade before any growth. The useful way to read the rate is against income rather than against the balance, because it is the only one of the two that the household controls directly every month.",
    },
    mistakes: [
      {
        title: "Using gross income as the denominator without saying so",
        body: "The same dollar amount produces two different rates against gross and net pay, and the gap is the whole tax and deduction wedge — often 25% or more. Because both numbers are called the savings rate, a household comparing itself to a published figure needs to know which base that figure used.",
      },
      {
        title: "Counting a windfall month as the rate",
        body: "A three-paycheck month or a refund month can double the apparent rate. If that month is treated as the baseline, the following months look like failure even when nothing changed. Exclude known one-offs or annualise, and say which you did.",
      },
      {
        title: "Treating the rate as the goal rather than the mechanism",
        body: "A rate is a way of allocating income, and a very high rate maintained for three months is worth less than a moderate one maintained for three years. The arithmetic rewards persistence over intensity, because the rate applies to every month it survives and to none of the months it does not.",
      },
    ],
  },

  "inflation-calculator": {
    intro:
      "Inflation is a rate of change applied to a base, so the same 3% produces very different results depending on the horizon. This is what turns a 100 dollar purchase into 134, and what makes a future salary figure smaller than it looks.",
    mechanics: [
      {
        title: "It compounds, it does not add",
        body: "3% a year for ten years is 1.03 raised to the tenth power, which is 1.3439, so 100 becomes 134.39 rather than 130.00. The extra 4.39 is inflation charged on the inflation already added. Over twenty years the factor is 1.8061 and over thirty it is 2.4273, so the same 3% more than triples the effect over a longer horizon.",
      },
      {
        title: "Running it backwards",
        body: "Dividing by the factor converts a future amount into today's money: 100 / 1.3439 = 74.41, so a 2036 hundred dollars buys what 74.41 buys in 2026. This direction is the one that matters for planning, because salaries, pensions and fixed payments are all stated in future currency and all need converting before they can be compared.",
      },
      {
        title: "Real and nominal",
        body: "A nominal return is the headline number; a real return is what remains after inflation. A 5% return against 3% inflation is a real 1.94%, computed as 1.05 / 1.03 - 1, not as 5 - 3 = 2. Subtracting gives 2.0% where the exact figure is 1.94%, and the gap widens as both numbers grow — at 12% against 8% the subtraction reads 4.00% where the true real return is 3.70%.",
      },
    ],
    example: {
      title: "Worked example: 3% over ten years",
      setup:
        "A 3% annual rate compounded over ten years, with the reverse conversion showing what a future amount is worth today.",
      rows: [
        { label: "Ten-year factor", value: "1.3439", note: "1.03^10" },
        { label: "100 today becomes", value: "$134.39", note: "100 x 1.3439" },
        { label: "1,000 today becomes", value: "$1,343.92", note: "1,000 x 1.3439" },
        { label: "100 in ten years is worth today", value: "$74.41", note: "100 / 1.3439" },
        { label: "Thirty-year factor", value: "2.4273", note: "1.03^30" },
      ],
      conclusion:
        "Additive arithmetic predicts 130.00 after ten years and the correct figure is 134.39; after thirty years it predicts 190.00 against an actual 242.73. The error is 52.73 in the longer case, and it is entirely the compounding of inflation on inflation. Any projection that multiplies the rate by the years rather than raising the factor will understate the result, always in the same direction.",
    },
    mistakes: [
      {
        title: "Multiplying the rate by the number of years",
        body: "3% for 30 years is not 90%. It is 1.03^30 - 1 = 142.73%. The linear estimate understates the effect by more than half, and the understatement grows with the horizon, so it is worst exactly on the retirement and pension questions where people rely on it.",
      },
      {
        title: "Applying one national rate to a specific basket",
        body: "A headline index tracks an average basket with weights that are not your weights. A household spending heavily on rent, tuition or healthcare can face a materially different rate from one spending on electronics and apparel, in either direction. The index is the right tool for comparing across time in aggregate and the wrong one for predicting a particular budget.",
      },
      {
        title: "Subtracting inflation from a return instead of dividing",
        body: "The approximation is close at small numbers and drifts at large ones: 12% against 8% gives 4.00% by subtraction against a true 3.70%. On a long-horizon projection the difference compounds. Use (1 + nominal) / (1 + inflation) - 1 whenever both figures are known.",
      },
    ],
  },

  "square-footage-calculator": {
    intro:
      "Area is length times width, and most errors in square footage come from units rather than arithmetic — inches that were never converted, or a measurement taken in one place and applied to a whole room that is not that shape.",
    mechanics: [
      {
        title: "Area scales with the square of the linear factor",
        body: "One square foot is 144 square inches and one square yard is 9 square feet, so converting between them uses 144 and 9 rather than 12 and 3. A 12 by 15 foot room is 180 square feet, which is 180 / 9 = 20 square yards and 180 x 144 = 25,920 square inches. Dividing by 3 instead of 9 is the single most common conversion error and it produces an answer three times too large.",
      },
      {
        title: "Perimeter is not area",
        body: "A 12 by 15 room has an area of 180 square feet and a perimeter of 2 x (12 + 15) = 54 feet. Baseboard, trim and fencing are bought by the linear foot; flooring, paint and sod are bought by the square foot. The two numbers describe the same room and cannot be substituted for one another, and a room with a large perimeter and a small area needs more of a linear product than its area suggests.",
      },
      {
        title: "Waste allowance is multiplicative, not additive",
        body: "Ordering 10% extra means multiplying by 1.10. On 180 square feet that adds 18, giving 198. On 2,000 square feet the same 10% adds 200. A fixed addition would be wrong at both sizes, which is why allowances are stated as percentages — and why the percentage should reflect the number of cuts and the pattern match rather than being applied as a default.",
      },
    ],
    example: {
      title: "Worked example: a 12 by 15 foot room",
      setup:
        "One rectangle measured four ways, so the unit conversions can be checked against each other.",
      rows: [
        { label: "Area", value: "180.00 sq ft", note: "12 x 15" },
        { label: "In square yards", value: "20.00 sq yd", note: "180 / 9" },
        { label: "Perimeter", value: "54 ft", note: "2 x (12 + 15)" },
        { label: "With 10% waste", value: "198.00 sq ft", note: "180 x 1.10" },
        { label: "In square inches", value: "25,920", note: "180 x 144" },
      ],
      conclusion:
        "The same room is 180 square feet, 20 square yards and 25,920 square inches, and all three are correct. Which one is useful depends on the material: flooring is usually priced per square foot, carpet per square yard, and small quantities in plans per square inch. Converting after the order is placed is where the three-times errors come from.",
    },
    mistakes: [
      {
        title: "Mixing inches and feet in one multiplication",
        body: "A 144 by 18 inch surface is not 2,592 square feet. Converting first gives 12 by 1.5 feet = 18 square feet. The arithmetic is identical in both cases and only the units differ, which is why the error survives a calculator check: the number on screen is right for the numbers entered.",
      },
      {
        title: "Dividing by 3 rather than 9 for square yards",
        body: "Three feet make a yard, but nine square feet make a square yard. Dividing an area by 3 reports 60 square yards where the answer is 20, an overstatement of three times that will be ordered as material and paid for. This is the most expensive of the common conversion errors because the excess is physical.",
      },
      {
        title: "Measuring one bay and multiplying by the count",
        body: "Rooms are rarely identical, closets and doorways remove area, and an L-shaped space is not a rectangle with a larger number. Multiplying an average by a count produces a figure that is plausible and wrong in a direction that depends on the shape, so it can be either over or under with no way to tell from the result.",
      },
    ],
  },

  "gravel-calculator": {
    intro:
      "Gravel is sold by volume or by weight, and the two are linked by a bulk density that varies with the type of stone. Getting from a footprint to tonnes takes three conversions, and skipping any one of them is how an order comes up short.",
    mechanics: [
      {
        title: "Area to volume requires the depth in feet",
        body: "Volume is area times depth, and the depth must be in the same unit as the area for the multiplication to mean anything. Three inches is 3 / 12 = 0.25 feet. A 600 square foot driveway at that depth takes 600 x 0.25 = 150 cubic feet. Leaving the depth in inches produces a figure twelve times too large.",
      },
      {
        title: "Cubic feet to cubic yards divides by 27",
        body: "A cubic yard is 3 x 3 x 3 = 27 cubic feet, not 3. So 150 cubic feet is 150 / 27 = 5.556 cubic yards. Dividing by 3 instead would give 50 cubic yards, roughly nine times the material actually needed, which is the most expensive form this error takes.",
      },
      {
        title: "Cubic yards to tonnes depends on the stone",
        body: "Bulk density for common crushed stone runs about 1.35 to 1.45 short tons per cubic yard, with pea gravel near the lower end and some crushed limestone above it. At 1.4, 5.556 cubic yards is 7.78 tonnes. Moisture raises the figure, because the water is weighed along with the stone. The supplier's own density figure should be used rather than an average, because a 0.05 difference in density moves this order by nearly 0.3 tonnes.",
      },
    ],
    example: {
      title: "Worked example: 20 by 30 feet at 3 inches deep",
      setup:
        "A driveway-shaped rectangle at a common depth, converted step by step through all three stages.",
      rows: [
        { label: "Area", value: "600.00 sq ft", note: "20 x 30" },
        { label: "Depth in feet", value: "0.25 ft", note: "3 / 12" },
        { label: "Volume", value: "150.00 cu ft", note: "600 x 0.25" },
        { label: "Volume in cubic yards", value: "5.556 cu yd", note: "150 / 27" },
        { label: "Weight at 1.4 t/yd³", value: "7.78 tons", note: "5.556 x 1.4" },
        { label: "Weight at 1.35 t/yd³", value: "7.50 tons", note: "5.556 x 1.35" },
      ],
      conclusion:
        "The order is 7.78 tons at 1.4 tons per cubic yard and 7.50 at 1.35 — a 0.28 ton swing from density alone, on the same measured volume. Since the volume calculation is exact and the density is not, the uncertainty in this job lives entirely in the last step. Ask the supplier for their figure rather than applying an average.",
    },
    mistakes: [
      {
        title: "Leaving the depth in inches",
        body: "Multiplying a square footage by a depth in inches gives a volume twelve times too large. Three inches is 0.25 feet and it is easy to type 3 into the depth field when the area is already in feet, so this error is produced by the interface as much as by the arithmetic.",
      },
      {
        title: "Dividing cubic feet by 3 to reach cubic yards",
        body: "A cubic yard is 27 cubic feet. Dividing 150 by 3 gives 50 cubic yards where the answer is 5.556, an order of magnitude wrong in the expensive direction. The 3 in the conversion is a length, and the conversion needs a volume, which is why the factor is cubed.",
      },
      {
        title: "Assuming one density across different stone",
        body: "Crushed stone, pea gravel, river rock and decomposed granite do not weigh the same per cubic yard, and the difference is enough to matter on any delivery. Weight also rises with moisture, so the same volume of the same stone weighs more after rain. Density is the one input that cannot be measured from the site plan.",
      },
    ],
  },

  "topsoil-calculator": {
    intro:
      "Topsoil is ordered by volume, usually in cubic yards, and the depth that matters is the settled depth you want rather than the loose depth it arrives at. Screened topsoil settles, so a skim coat ordered at exact volume often finishes thin.",
    mechanics: [
      {
        title: "Depth in feet, then area times depth",
        body: "Two inches is 2 / 12 = 0.1667 feet. A 300 square foot bed at that depth takes 300 x 0.1667 = 50.00 cubic feet. Working in inches throughout and converting at the end is equivalent, provided the conversion is applied once; applying it at both ends is how a figure ends up twelve times out.",
      },
      {
        title: "Cubic feet to cubic yards is a divide by 27",
        body: "50 cubic feet is 50 / 27 = 1.852 cubic yards. This is a small delivery, and it is the point at which bulk usually becomes cheaper than bags: 50 cubic feet is 25 bags at 2 cubic feet each, which is 25 separate units to move and open. Below about one cubic yard, bagged product is often the reasonable choice.",
      },
      {
        title: "Settling and shrinkage change the order",
        body: "Loose screened topsoil settles after watering and rain, and a blend with compost settles further as the organic fraction breaks down. The practical effect is that ordering the exact calculated volume produces a finished depth below the target. The size of the effect depends on the mix and how it is placed, so the allowance should be a stated percentage rather than a guess, and it belongs in the order rather than in the arithmetic.",
      },
    ],
    example: {
      title: "Worked example: 300 square feet at 2 inches",
      setup:
        "A garden bed at a common depth, converted to both bulk and bagged quantities so the two can be compared.",
      rows: [
        { label: "Depth in feet", value: "0.1667 ft", note: "2 / 12" },
        { label: "Volume", value: "50.00 cu ft", note: "300 x 0.1667" },
        { label: "Volume in cubic yards", value: "1.852 cu yd", note: "50 / 27" },
        { label: "Bagged equivalent at 2 cu ft", value: "25.0 bags", note: "50 / 2" },
        { label: "3 inches instead of 2", value: "75.00 cu ft", note: "300 x 0.25" },
      ],
      conclusion:
        "The volume is 1.85 cubic yards, or 25 bags. At 3 inches the same bed takes 75 cubic feet, or 2.78 cubic yards — a third more material for one extra inch. Depth is the input with the largest effect on this order and it is also the one people estimate rather than measure, which is why the allowance for settling belongs on top of a depth that was actually chosen.",
    },
    mistakes: [
      {
        title: "Ordering the target depth without an allowance for settling",
        body: "Screened topsoil and compost blends settle after watering. Ordering exactly the calculated volume lands the finished surface below the intended level, and topping up later costs a second delivery at the same minimum charge. Decide the allowance as a percentage and state it, so the order is deliberate rather than short.",
      },
      {
        title: "Converting cubic feet to cubic yards with 3",
        body: "The factor is 27, because a cubic yard is three feet in each of three dimensions. Using 3 on a 50 cubic foot order gives 16.7 cubic yards against a correct 1.85, an error of nine times that will be delivered and invoiced. This conversion is wrong far more often than the area calculation it follows.",
      },
      {
        title: "Adding bagged and bulk quantities as if they were the same unit",
        body: "A bag stated at 2 cubic feet is 0.0741 cubic yards, so 25 bags make 1.85 cubic yards. Adding 25 to a bulk figure of 1.85 as though both were counts produces a meaningless total. Convert to one unit before combining, and be explicit about which unit the order is in.",
      },
    ],
  },

  "mulch-calculator": {
    intro:
      "Mulch depth is a choice rather than a measurement, and the two common errors are going too deep and measuring the bed as a rectangle when it is not. Depth above roughly four inches can hold moisture against stems instead of conserving it, so more is not better.",
    mechanics: [
      {
        title: "Three inches is the usual standard",
        body: "Three inches is 3 / 12 = 0.25 feet. A 400 square foot bed at that depth takes 400 x 0.25 = 100.00 cubic feet, which is 100 / 27 = 3.704 cubic yards. The depth is the input with the largest effect and the one most often chosen by eye, so a half inch of error on a large bed is a meaningful quantity of material.",
      },
      {
        title: "Beds are rarely rectangles",
        body: "Curved borders, trees inside the bed, and paths through it all remove area. A rectangle measured across the widest points overstates a bed with rounded ends by the area outside the curve. Splitting an irregular bed into two or three approximate shapes and adding them is more accurate than one bounding rectangle, and it is also easier to check against the plan.",
      },
      {
        title: "Depth reduces what you buy next year",
        body: "Mulch decomposes, so an annual top-up restores a depth rather than adding one. If the existing layer is still an inch deep, topping back to three inches is two inches of new material, not three. Ordering the full depth every year over-applies, which is the one direction of error that can harm the planting it was meant to protect.",
      },
    ],
    example: {
      title: "Worked example: 400 square feet at 3 inches",
      setup:
        "A single bed at the standard depth, then the same bed at 2 inches to show what the depth decision costs.",
      rows: [
        { label: "Depth in feet", value: "0.25 ft", note: "3 / 12" },
        { label: "Volume at 3 inches", value: "100.00 cu ft", note: "400 x 0.25" },
        { label: "In cubic yards", value: "3.704 cu yd", note: "100 / 27" },
        { label: "Bags at 2 cu ft", value: "50", note: "100 / 2" },
        { label: "Volume at 2 inches", value: "66.67 cu ft", note: "400 x 0.1667" },
        { label: "In cubic yards at 2 inches", value: "2.469 cu yd", note: "66.67 / 27" },
      ],
      conclusion:
        "Dropping from 3 inches to 2 cuts the order from 3.70 cubic yards to 2.47, a third less material for a depth still within the range usually recommended. Since the correct depth is a judgement about the planting rather than a fixed rule, deciding it deliberately rather than defaulting to the deepest option is what makes the quantity right.",
    },
    mistakes: [
      {
        title: "Measuring a curved or irregular bed as a rectangle",
        body: "A bounding rectangle includes every area the bed does not occupy. On a bed with rounded ends the overstatement can be substantial, and it is systematic rather than random — a rectangle always overstates an irregular shape, never understates it. Break the bed into shapes that match it instead.",
      },
      {
        title: "Topping up to full depth every year",
        body: "Existing mulch still counts toward the depth. If an inch remains and the target is three, the order is two inches. Applying three on top of an inch gives four, which is above the range usually recommended and can hold moisture against stems and crowns. Measure the existing layer before ordering.",
      },
      {
        title: "Confusing the cubic feet on the bag with the cubic yards in the order",
        body: "A 2 cubic foot bag is 0.0741 cubic yards, so 50 bags are 3.70 cubic yards. Quoting 50 against 3.70 as though they were comparable units makes a bulk delivery look larger than the bags it replaces when the two are the same quantity. Convert to one unit first, then compare price.",
      },
    ],
  },

  /**
   * ── ADDED 2026-10-06 ──────────────────────────────────────────────────────
   * Source: a Search Console performance export for usmoneyhq.com (27 Aug -
   * 3 Oct 2026). These five pages were already receiving organic impressions
   * while sitting at 277-332 words, i.e. under this file's own 450-word floor:
   *
   *   /savings-bonds-calculator     277 words   446 impressions, avg pos 35.7
   *   /pmi-calculator               325 words   639 impressions, avg pos 65.3
   *   /loan-comparison-calculator   285 words   229 impressions, avg pos 45.3
   *   /529-calculator               330 words   303 impressions, avg pos 63.6
   *   /closing-costs-calculator     332 words   253 impressions, avg pos 87.5
   *
   * Every impression is demand Google is already routing here. Improving a page
   * that ranks at position 35 costs nothing in new authority and is worth more
   * than a new page that starts at zero, which is why these were chosen ahead of
   * any new topic.
   *
   * Figures in the worked examples were COMPUTED, not recalled, and each is
   * reproducible from the inputs stated in its own `setup`. Illustrative rates
   * (the 0.60% PMI rate, the 6% 529 return, 6.5% mortgage) are labelled as
   * assumptions in the text rather than presented as current market quotes.
   */

  "savings-bonds-calculator": {
    intro:
      "A savings bond has two values and it is easy to read the wrong one. The face value is what the bond says; the redemption value is what Treasury will actually pay you today, and between purchase and maturity those two numbers can differ by a factor of two.",
    mechanics: [
      {
        title: "EE bonds double in 20 years, whatever the coupon says",
        body: "An electronic EE bond is bought at face value and earns a fixed rate set on the day you buy it. Separately, Treasury guarantees the bond will be worth at least twice what you paid by the 20-year mark. If the fixed rate is high enough the bond gets there on its own; if it is lower, Treasury applies a one-time adjustment at year 20 to make up the difference. That guarantee is equivalent to an annual rate of 2^(1/20) - 1 = 3.5265%, so a $10,000 bond is worth $20,000 at 20 years regardless of the coupon it was issued at.",
      },
      {
        title: "I bonds use a two-part rate with a cross term",
        body: "An I bond's composite rate is the fixed rate plus twice the semiannual inflation rate, plus the product of the two. That last term is tiny and almost always dropped. Take a 1.30% fixed rate and 1.50% semiannual inflation: adding the first two gives 4.30%, and the cross term adds 0.013 x 0.015, which is 0.0195 percentage points — so the true composite is 4.3195%. The inflation half is reset every six months from the new figure; the fixed half never changes for the life of the bond, which is why two I bonds bought six months apart can pay different rates on the same principal.",
      },
      {
        title: "Accrual, penalties and tax",
        body: "Interest accrues every month and compounds semiannually. The bond cannot be redeemed at all in the first twelve months, and redeeming between one and five years costs the last three months of interest. After five years there is no penalty. Interest is exempt from state and local income tax, is taxable at the federal level, and the federal tax can generally be deferred until you redeem. So the holding period matters twice: once for the penalty and once for the deferral.",
      },
    ],
    example: {
      title: "Worked example: a $10,000 EE bond held 20 years",
      setup:
        "Purchase price $10,000, bought electronically at face value. The fixed rate set on the issue date is assumed to be below the doubling threshold, so the 20-year guarantee is what determines the value at maturity.",
      rows: [
        { label: "Purchase price", value: "$10,000.00", note: "electronic EE bonds are bought at face value" },
        { label: "Guaranteed value at 20 years", value: "$20,000.00", note: "2 x purchase price" },
        { label: "Implied annual rate of the guarantee", value: "3.5265%", note: "2^(1/20) - 1 = 0.035265" },
        { label: "Check on the guarantee", value: "$20,000.00", note: "10000 x 1.035265^20" },
        { label: "Forfeited if redeemed at 18 months", value: "$88.16", note: "3 months of interest: 10000 x 0.035265 / 4" },
      ],
      conclusion:
        "The doubling guarantee is why a low-coupon EE bond is not simply a poor bond: it is a promise to reach twice the purchase price by year 20, and the arithmetic of that promise is a 3.5265% annual rate. Redeem at 18 months and you hand back about $88 of interest on a $10,000 bond — a small sum, but it is the difference between the bond's accrued value and what actually arrives.",
    },
    mistakes: [
      {
        title: "Reading the face value as the current value",
        body: "Paper EE bonds were sold at half of face value, so a paper bond with a $100 face cost $50 and reaches $100 at maturity. Enter the face value printed on an old certificate and the calculator will overstate what it is worth, because for those issues the purchase price was the smaller number.",
      },
      {
        title: "Judging an EE bond by its coupon alone",
        body: "The fixed rate and the doubling guarantee are separate mechanisms. A bond issued below 3.5265% still doubles at 20 years, because Treasury adjusts the value at the end rather than paying the shortfall along the way. Comparing the coupon to a savings account rate therefore understates the bond.",
      },
      {
        title: "Redeeming inside five years and expecting the full rate",
        body: "Between 12 months and five years, redemption forfeits the last three months of interest. The amount is small, but it means the effective return on any hold shorter than five years is always below the stated rate.",
      },
    ],
  },

  "pmi-calculator": {
    intro:
      "PMI is charged on the loan you originally took, not the balance you have left. That one fact is why the premium does not shrink as you pay the mortgage down, and why the date it ends is a calculable month rather than a feeling.",
    mechanics: [
      {
        title: "The rate applies to the original loan amount",
        body: "Private mortgage insurance is charged on conventional loans with a down payment below 20%. The annual premium is a percentage of the original loan amount — commonly somewhere between 0.3% and 1.5%, set by credit score, loan-to-value and the insurer — divided by twelve and collected monthly. Because the base is the original loan, the premium stays flat while the balance falls. On a $360,000 loan at 0.60%, the premium is $2,160 a year, or $180 a month, in the first year and in the tenth.",
      },
      {
        title: "It ends at 80% on request, 78% automatically",
        body: "Under the Homeowners Protection Act, on a conventional loan you may ask the servicer to cancel PMI once the balance reaches 80% of the home's original value, with a good payment history. Automatic termination follows at 78% of original value, on the original amortisation schedule. Both thresholds are measured against the value at purchase, so a rising market does not shorten the clock and a falling one does not extend it. Note the contrast with FHA loans, where the insurance is an upfront charge plus an annual one and, on most loans with less than 10% down, runs for the life of the loan.",
      },
      {
        title: "What the calculator cannot know",
        body: "The rate is a private-market price, not a published schedule, so it varies by lender, insurer, credit band and loan type. It is also paid in different ways — monthly by the borrower, upfront as a single premium, or absorbed into a higher interest rate. The calculator estimates a monthly cost from the inputs you give it; the figure that binds is the one on the Loan Estimate.",
      },
    ],
    example: {
      title: "Worked example: $400,000 home, 10% down, PMI at 0.60%",
      setup:
        "Purchase price $400,000. Down payment 10% = $40,000, so the loan is $360,000 and the initial loan-to-value is 90%. Assumed annual PMI rate 0.60% of the original loan amount, which is an assumption and not a quote. Mortgage rate 6.5% over 360 months.",
      rows: [
        { label: "Loan amount", value: "$360,000.00", note: "400000 - 40000" },
        { label: "Loan-to-value at origination", value: "90%", note: "360000 / 400000" },
        { label: "Annual PMI premium", value: "$2,160.00", note: "0.006 x 360000" },
        { label: "Monthly PMI", value: "$180.00", note: "2160 / 12" },
        { label: "Principal and interest", value: "$2,275.44", note: "360000 at 6.5% over 360 months" },
        { label: "Months to 80% of original value", value: "95 months (7.9 years)", note: "balance reaches $320,000 = 0.80 x 400000" },
        { label: "Months to 78% of original value", value: "109 months (9.1 years)", note: "balance reaches $312,000 = 0.78 x 400000" },
        { label: "PMI paid before the 80% threshold", value: "$17,100.00", note: "180 x 95" },
      ],
      conclusion:
        "A 10% down payment on a $400,000 home means $180 a month for close to eight years before the balance reaches the 80% mark, and about nine years before automatic termination — roughly $17,100 of premium along the way. The schedule sets the clock, not the housing market: a borrower whose home appreciates has no earlier exit from PMI unless the servicer accepts a new appraisal.",
    },
    mistakes: [
      {
        title: "Assuming the premium falls as the balance falls",
        body: "The rate is a percentage of the original loan amount, so paying the balance down does not reduce the monthly charge. It only brings the cancellation threshold closer. A borrower who expects PMI to taper is applying the logic of interest, which is charged on the outstanding balance, to insurance, which is not.",
      },
      {
        title: "Measuring the 80% threshold against today's value",
        body: "Cancellation and automatic termination on a conventional loan are measured against the home's original value. A market that rises 15% does not move the 80% line. A borrower wanting PMI removed sooner on the strength of appreciation usually has to request it with a new appraisal the servicer accepts — which is a different process from the automatic rules, and not one the servicer is obliged to grant.",
      },
      {
        title: "Treating FHA mortgage insurance as PMI",
        body: "FHA loans carry an upfront premium of 1.75% of the base loan amount, which is $6,300 on a $360,000 loan, plus an annual premium. On most loans with less than 10% down the annual premium lasts the life of the loan, and the 80%/78% cancellation rules that apply to conventional PMI do not apply to it. The two products are not the same calculation.",
      },
    ],
  },

  "loan-comparison-calculator": {
    intro:
      "Two loans with the same amount and the same rate can cost different sums, and the one with the lower payment is usually the more expensive. Comparing loans means comparing total cost, not the number that leaves your account each month.",
    mechanics: [
      {
        title: "The payment is not the price",
        body: "Stretching a term lowers the monthly payment and raises the total. On $25,000 at 7.00%, a 60-month loan costs $495.03 a month and $29,701.80 in total; the same amount over 72 months costs $426.23 a month and $30,688.21. The longer loan saves $68.80 every month and costs $986.41 more overall. Both statements are true at the same time, and only one of them appears in a monthly budget.",
      },
      {
        title: "The rate and the APR are different numbers",
        body: "The interest rate prices the money. The APR also folds in most of the fees the lender charges to make the loan, which is why it is usually the higher of the two and the only fair figure when two offers differ in fees rather than in rate. Compare APR against APR for the same amount and term. Across different terms it misleads, because a longer loan can show a competitive APR while costing more in total.",
      },
      {
        title: "Rate sensitivity is larger than it feels",
        body: "Because the balance is large and the term is long, a small rate difference compounds into a large sum. On a $250,000 loan over 360 months, 6.5% versus 7.0% — half a percentage point — is $83.09 a month and $29,911.02 in extra interest. A variable rate quoted below a fixed rate is not therefore cheaper: it is a different contract whose rate resets against an index, and the comparison has to be run at several future rates rather than the one advertised.",
      },
    ],
    example: {
      title: "Worked example: $25,000 at 7% over 60 versus 72 months",
      setup:
        "Same principal, same 7.00% annual rate, so the monthly rate is 0.07 / 12 = 0.00583333. Only the term differs.",
      rows: [
        { label: "60-month payment", value: "$495.03", note: "25000 x 0.00583333 / (1 - 1.00583333^-60)" },
        { label: "60-month total paid", value: "$29,701.80", note: "495.03 x 60" },
        { label: "60-month interest", value: "$4,701.80", note: "29701.80 - 25000" },
        { label: "72-month payment", value: "$426.23", note: "25000 x 0.00583333 / (1 - 1.00583333^-72)" },
        { label: "72-month total paid", value: "$30,688.21", note: "426.23 x 72" },
        { label: "72-month interest", value: "$5,688.21", note: "30688.21 - 25000" },
        { label: "Payment saved by the longer term", value: "$68.80/mo", note: "495.03 - 426.23" },
        { label: "Extra total cost of the longer term", value: "$986.41", note: "30688.21 - 29701.80" },
      ],
      conclusion:
        "The longer loan buys $68.80 a month of breathing room and charges $986.41 for it — 3.9% of the amount borrowed — for twelve additional months at an unchanged rate. That is why the longer term is the one usually offered first: it wins every comparison run on the monthly payment, and loses on every comparison run on total cost.",
    },
    mistakes: [
      {
        title: "Choosing the loan with the lowest payment",
        body: "A lower payment achieved with a longer term increases what you pay, by $986.41 in the example above. Payment and total cost move in opposite directions when the term changes, so a decision made on payment alone is a decision made against total cost.",
      },
      {
        title: "Comparing a fixed rate against an advertised variable rate",
        body: "The variable figure is an introductory rate that applies for a defined period and then resets against an index. Setting it beside a fixed rate compares a known cost to an unknown one, and the value of the fixed loan is precisely that it does not move.",
      },
      {
        title: "Comparing APR across different terms",
        body: "APR is an annualised all-in figure, which makes it the right comparison when two offers share a term and differ in fees. Across different terms it hides the total, because a 72-month loan can show a competitive APR while costing more than a 60-month loan at the same APR. Match the term first, compare APR inside it, then confirm with total cost.",
      },
    ],
  },

  "529-calculator": {
    intro:
      "A 529 plan changes the tax treatment of an investment, not the investment itself. The growth is ordinary compounding; the reason to hold it in this account is what happens to the earnings when the money is spent on qualifying education.",
    mechanics: [
      {
        title: "Contributions are not federally deductible — the growth is what is sheltered",
        body: "Unlike a traditional IRA, money paid into a 529 plan is not deductible on a federal return. The benefit sits at the other end: earnings accumulate without an annual tax drag and, when withdrawn to pay qualified education expenses, come out free of federal income tax. Some states offer a deduction or credit against their own income tax for contributions, on terms that differ by state. The federal treatment and the state treatment are two separate questions and should be answered separately.",
      },
      {
        title: "The arithmetic is the same as any annuity",
        body: "Regular contributions growing at a fixed rate produce a future value of P x [(((1+r)^n) - 1) / r] x (1+r), where P is the periodic contribution, r the periodic rate and n the number of periods. The final factor of (1+r) accounts for contributions made at the start of each year rather than the end. Nothing about the account alters this formula. What the account alters is the tax on the result.",
      },
      {
        title: "The penalty applies only to non-qualified withdrawals, and only to the earnings",
        body: "A withdrawal not used for qualified expenses makes the earnings portion taxable and adds a 10% federal penalty on that portion; the contributions come out without either, because they were made from already-taxed money. That is the design: the tax benefit is conditional on the spending, which is why the account is not a general-purpose investment account with a bonus attached.",
      },
    ],
    example: {
      title: "Worked example: $2,500 a year for 18 years at 6%",
      setup:
        "Contribution $2,500 at the start of each year for 18 years. Assumed annual return 6.00%, so (1.06)^18 = 2.854339 and the annuity factor is (2.854339 - 1) / 0.06 = 30.90565. The return is an assumption; the tax treatment does not depend on it.",
      rows: [
        { label: "Total contributed", value: "$45,000.00", note: "2500 x 18" },
        { label: "Value, contributions at start of year", value: "$81,899.98", note: "2500 x 30.90565 x 1.06" },
        { label: "Value, contributions at end of year", value: "$77,264.13", note: "2500 x 30.90565" },
        { label: "Growth on the start-of-year basis", value: "$36,899.98", note: "81899.98 - 45000" },
        { label: "Growth as a share of the balance", value: "45.1%", note: "36899.98 / 81899.98" },
      ],
      conclusion:
        "Eighteen years of $2,500 produces about $81,900, of which $36,900 — 45% of the balance — is growth rather than contributions. In a taxable account that growth is taxed as it arises and again as it is realised. In a 529 it is not taxed at all when the withdrawal pays qualified education expenses, so the shelter on this balance is worth the tax on $36,900. That is the whole of the tax argument for the account.",
    },
    mistakes: [
      {
        title: "Expecting a federal deduction",
        body: "There is no federal deduction for a 529 contribution. The benefit is tax-free growth and tax-free qualified withdrawals. A state deduction may exist, and if it does it applies to that state's income tax only — not to the federal bill.",
      },
      {
        title: "Contributing at the end of the year without noticing the cost",
        body: "A contribution made at the start of the year compounds for twelve months longer than one made at the end. Over 18 years that timing difference is $4,635.85 on the same $45,000 of contributions — 81,899.98 against 77,264.13. The contributions are identical; only the date changed.",
      },
      {
        title: "Withdrawing without matching the expense to the year",
        body: "The tax-free treatment attaches to qualified expenses paid in the same period, not to the account in general. A withdrawal larger than the qualified expenses for that year makes the excess earnings taxable and subject to the 10% penalty, even when the money is ultimately spent on education — so a distribution taken in December for a January bill is treated differently from one taken in January.",
      },
    ],
  },

  "closing-costs-calculator": {
    intro:
      "Closing costs are not all costs. Part of that number is a prepayment of bills you would pay anyway, and part is the price of the loan. Separating the two is the difference between knowing what you are buying and knowing what you are setting aside.",
    mechanics: [
      {
        title: "Roughly 2% to 5% of the price, but the range hides the composition",
        body: "Closing costs are commonly estimated at 2% to 5% of the purchase price, which on a $400,000 home is $8,000 to $20,000. The range is wide because it bundles three unlike things: lender fees for making the loan, third-party fees for services the transaction requires, and prepaid items that are your own money funded in advance. A rule of thumb gives you a total; the Loan Estimate lists the components, which is the only way to see what can be shopped and what cannot.",
      },
      {
        title: "Prepaid interest and escrow reserves are not fees",
        body: "Prepaid interest covers the interest from the closing date to the end of that month, charged because the first regular payment is not due until the following month. At 6.5% on a $320,000 loan it accrues at $56.99 a day, so closing on the 15th costs about $854.79. Escrow reserves are several months of property tax and insurance collected up front and held to pay those bills when they fall due. Both are obligations you already owe. Neither is revenue to the lender, and neither reduces the price of the loan.",
      },
      {
        title: "Cash to close is a larger number than closing costs",
        body: "Cash to close is the down payment plus the closing costs plus any prepaid items and reserves. On a $400,000 home with 20% down, the down payment alone is $80,000; closing costs at 3% add $12,000; the cheque at settlement is therefore $92,000 — 23% of the purchase price — even though only part of that $12,000 is money the lender keeps. Reading the closing-cost figure as the cash required is among the more expensive small errors in a purchase.",
      },
    ],
    example: {
      title: "Worked example: $400,000 purchase, 20% down, 3% closing costs",
      setup:
        "Purchase price $400,000. Down payment 20% = $80,000. Closing costs assumed at 3% of the price. Loan $320,000 at 6.5%. Closing on the 15th of the month.",
      rows: [
        { label: "Down payment", value: "$80,000.00", note: "0.20 x 400000" },
        { label: "Loan amount", value: "$320,000.00", note: "400000 - 80000" },
        { label: "Closing costs at 3%", value: "$12,000.00", note: "0.03 x 400000" },
        { label: "Cash to close", value: "$92,000.00", note: "80000 + 12000" },
        { label: "Per-diem prepaid interest", value: "$56.99/day", note: "320000 x 0.065 / 365" },
        { label: "Prepaid interest, 15 days", value: "$854.79", note: "56.99 x 15" },
        { label: "Escrow reserves, 3 months of a $500 bill", value: "$1,500.00", note: "500 x 3" },
      ],
      conclusion:
        "The $12,000 of closing costs contains $854.79 of prepaid interest and $1,500 of escrow — $2,354.79 that settles existing obligations rather than buying anything from the lender. Meanwhile the cash needed at settlement is $92,000, which is 23% of the purchase price rather than the 3% that gets quoted. Both numbers describe the same transaction, and they differ by a factor of nearly eight.",
    },
    mistakes: [
      {
        title: "Treating the closing-cost percentage as the cash needed",
        body: "The quoted percentage excludes the down payment. On a 20%-down purchase it understates the cheque by a factor of nearly eight — 3% against 23% in the example above. Budget from cash to close, not from the closing-cost estimate.",
      },
      {
        title: "Treating escrow reserves and prepaid interest as negotiable fees",
        body: "They are not a charge for a service; they are money you owe, collected early. An estimate lowered by reducing them usually means a larger bill shortly after closing, because the taxes and insurance still have to be paid from somewhere.",
      },
      {
        title: "Assuming every line is fixed",
        body: "Some items can be shopped — title search and title insurance, the settlement agent, survey, pest inspection — and choosing your own provider for those is a real cost decision. Others cannot: recording fees and transfer taxes are set by the jurisdiction, and appraisal and credit report fees go to the parties that performed the work. The Loan Estimate marks which is which, which is why it is a better instrument than a percentage.",
      },
    ],
  },

  /**
   * ── ADDED 2026-10-06 (batch 2) ────────────────────────────────────────────
   * 74 tools still had no deep content and rendered at 254-434 words. This
   * batch covers the FINANCE ones, deliberately: the Search Console audit
   * advises against expanding the non-finance utility categories ("Keep them
   * stable... Do not expand those categories during the next finance-focused
   * publishing wave"), and finance pages carry the better advertising value.
   *
   * Figures computed by script, not recalled, and reproducible from each
   * entry's own `setup`. Rates used as illustrations (6%, 7%, 8.5%) are
   * labelled as assumptions rather than presented as current market quotes.
   */

  "compound-interest-calculator": {
    intro:
      "Compounding is not a bigger number than simple interest — it is a different shape of growth. The gap between the two starts imperceptible and ends up larger than the original deposit, which is why the frequency of compounding matters more than people expect.",
    mechanics: [
      {
        title: "The formula and what each part does",
        body: "Future value is P x (1 + r/n)^(nt), where P is the amount you start with, r is the annual rate as a decimal, n is how many times a year interest is credited, and t is the number of years. The only part that responds to compounding frequency is the exponent — n and t multiply, so monthly compounding credits interest 12 times a year for every year you hold it.",
      },
      {
        title: "Why monthly compounding beats annual",
        body: "At the same quoted annual rate, more frequent crediting produces a higher effective rate, because each credit starts earning interest sooner. 6% credited annually pays exactly 6%. The same 6% credited monthly compounds to an effective 6.17%, because (1.005)^12 - 1 = 0.0617. That seventeen-hundredths of a percentage point is why a quoted rate is not comparable across accounts until you know the frequency — which is exactly what an annual percentage yield states explicitly.",
      },
      {
        title: "Compounding vs simple interest",
        body: "Simple interest is charged only on the original principal, so it grows in a straight line. Compound interest is charged on principal plus whatever interest has already accrued, so it curves upward. Over one year the difference is small; over thirty it is the difference between a savings account and a retirement.",
      },
    ],
    example: {
      title: "Worked example: $10,000 at 6% compounded monthly for 10 years",
      setup:
        "Principal $10,000. Annual rate 6%, credited monthly, so the periodic rate is 0.06 / 12 = 0.005. Term 10 years, which is 120 monthly periods.",
      rows: [
        { label: "Growth factor", value: "1.819397", note: "(1.005)^120" },
        { label: "Future value", value: "$18,193.97", note: "10000 x 1.819397" },
        { label: "Interest earned", value: "$8,193.97", note: "18193.97 - 10000" },
        { label: "Effective annual rate", value: "6.17%", note: "(1.005)^12 - 1" },
        { label: "Simple interest over the same 10 years", value: "$6,000.00", note: "10000 x 0.06 x 10" },
        { label: "Value of compounding", value: "$2,193.97", note: "8193.97 - 6000" },
      ],
      conclusion:
        "Ten years at 6% nearly doubles the money, and $2,193.97 of that — more than a fifth of the total gain — exists only because the interest was credited monthly rather than simply accruing on the original $10,000. Change the rate by a fraction of a point and this figure moves more than most people expect, which is why the rate and the frequency both belong in the comparison.",
    },
    mistakes: [
      {
        title: "Comparing a quoted rate to a quoted yield",
        body: "6% compounded monthly and 6% compounded annually are not the same offer, even though both read as 6%. Compare effective rates or annual percentage yields, never the headline nominal figures.",
      },
      {
        title: "Treating the effective rate as the growth rate for a partial year",
        body: "The effective rate is annual by definition. Halving it to get six months is an approximation, not the answer, because the compounding does not divide evenly across a part year.",
      },
      {
        title: "Ignoring what compounding does to debt",
        body: "The formula does not know whether you are the lender or the borrower. A credit card balance compounding at a much higher rate grows by the same curve, faster, and in the other direction.",
      },
    ],
  },

  "simple-interest-calculator": {
    intro:
      "Simple interest is the one rate calculation that does not compound, and its predictability is the point. It is the standard on car loans, short-term notes and some student loans, and knowing which of the two you have changes what the balance does over time.",
    mechanics: [
      {
        title: "The formula",
        body: "Interest is P x r x t — principal times the annual rate as a decimal times the term in years. Nothing accumulates on the interest itself, so the amount charged is identical in year one and year ten. On $10,000 at 6% that is $600 a year, every year, for as long as the loan runs.",
      },
      {
        title: "It does not mean the payment is flat",
        body: "A simple-interest loan still usually amortises, so the payment is level while the split inside it changes: early payments are mostly interest, later ones mostly principal. The interest is calculated on the outstanding balance each period rather than on the original principal, which is why a shorter term costs less even at the same quoted rate.",
      },
      {
        title: "Where you actually meet it",
        body: "Interest-only payments on a line of credit, a private car loan written as a flat add-on, and some short-term notes all work this way. Because the total interest is fixed and knowable at the outset, it is easy to compare offers — but only against other simple-interest offers. Setting it beside a compounding rate compares two different things.",
      },
    ],
    example: {
      title: "Worked example: $10,000 at 6% simple interest for 3 years",
      setup:
        "Principal $10,000. Annual rate 6%. Term 3 years, with no compounding.",
      rows: [
        { label: "Interest per year", value: "$600.00", note: "0.06 x 10000" },
        { label: "Interest over 3 years", value: "$1,800.00", note: "10000 x 0.06 x 3" },
        { label: "Total repaid", value: "$11,800.00", note: "10000 + 1800" },
        { label: "Monthly interest-only payment", value: "$50.00", note: "600 / 12" },
      ],
      conclusion:
        "Three years of interest costs $1,800, and it would cost exactly $600 for each additional year — there is no acceleration. Compounded monthly instead, the same $10,000 would carry interest on interest and the three-year figure would be higher. The difference is not large over three years and becomes substantial over twenty, which is the whole reason the distinction exists.",
    },
    mistakes: [
      {
        title: "Applying the simple formula to a compounding balance",
        body: "Credit cards, most mortgages and most savings accounts compound. Using P x r x t on them understates what is owed. Check which one the agreement describes before comparing.",
      },
      {
        title: "Assuming a flat payment means flat interest",
        body: "A level payment on an amortising loan hides a changing split. Payment one can be mostly interest even though the payment never changes.",
      },
      {
        title: "Reading a flat add-on quote as the rate",
        body: "A lender quoting total interest rather than an annual rate may be describing a simple-interest loan where the effective cost depends on how the balance declines. Convert everything to a comparable annual figure before deciding.",
      },
    ],
  },

  "savings-goal-calculator": {
    intro:
      "Saving toward a number is a payment calculation, not a hope. The question is what you have to put aside each period to land on a target by a date, and the answer depends far more on the time you allow than on the return you assume.",
    mechanics: [
      {
        title: "The formula runs backwards from compounding",
        body: "A goal is the future value of a series of deposits, so the contribution is FV x r / ((1 + r)^n - 1), where r is the periodic rate and n the number of periods. Note that the return does not appear as a multiplier on your deposits — it appears inside a denominator, which is why the required contribution falls steeply as the horizon lengthens.",
      },
      {
        title: "Time matters more than return",
        body: "Stretching a goal from five years to ten roughly halves the monthly amount, because you both deposit more times and give each deposit longer to compound. Raising the assumed return by a point or two does far less. If a goal looks unreachable, the lever that actually moves is the deadline.",
      },
      {
        title: "The assumption that breaks the plan",
        body: "The formula assumes a steady return every period. Real returns are not steady, and a bad sequence late in the plan hurts more than a bad one early. Treat the contribution it produces as a floor to start from rather than a figure that is guaranteed to arrive.",
      },
    ],
    example: {
      title: "Worked example: reaching $50,000 in 5 years at 5%",
      setup:
        "Goal $50,000. Assumed annual return 5%, so the monthly rate is 0.05 / 12 = 0.0041667. Horizon 5 years = 60 monthly deposits.",
      rows: [
        { label: "Growth factor minus one", value: "0.283359", note: "(1.0041667)^60 - 1" },
        { label: "Monthly contribution", value: "$735.23", note: "50000 x 0.0041667 / 0.283359" },
        { label: "Total contributed", value: "$44,113.70", note: "735.23 x 60" },
        { label: "Growth inside the goal", value: "$5,886.30", note: "50000 - 44113.70" },
        { label: "Monthly amount with no return at all", value: "$833.33", note: "50000 / 60" },
      ],
      conclusion:
        "A 5% return reduces the monthly requirement from $833.33 to $735.23 — a saving of about $98 a month, or roughly 12%. Most of the goal is still your own money: only $5,886 of the $50,000 comes from growth. That ratio is why extending the deadline is a more powerful move than reaching for a higher return, and why a plan built on an optimistic return is fragile.",
    },
    mistakes: [
      {
        title: "Depositing at the end of the period and expecting start-of-period results",
        body: "Money deposited at the start of each month compounds for one month longer than money deposited at the end. Over a long horizon this is a real difference, and it is the same distinction that appears in every annuity calculation.",
      },
      {
        title: "Using an annual return as a monthly rate",
        body: "Dividing an annual return by twelve is a common shortcut and it slightly overstates the monthly growth. The correct periodic rate is the one that compounds to the annual figure: for 5%, that is 0.407% a month, not 0.417%.",
      },
      {
        title: "Setting the goal in a nominal figure",
        body: "A $50,000 goal set today is not $50,000 of today's purchasing power when you reach it. If the goal has a price attached — a down payment, tuition — the price moves too, and the target should move with it.",
      },
    ],
  },

  "amortization-schedule-calculator": {
    intro:
      "An amortisation schedule is the answer to a question a monthly payment hides: where does each payment go? The split changes every month, and over a 30-year loan the total interest exceeds the amount borrowed.",
    mechanics: [
      {
        title: "The payment is fixed, the split is not",
        body: "Interest is charged on the outstanding balance, so it is largest in the first payment when the balance is at its peak. Subtract it from the fixed payment and whatever remains reduces the principal. Next month the balance is marginally smaller, so interest is marginally smaller, and the principal share marginally larger. The payment never changes; the contents do.",
      },
      {
        title: "Why early prepayments are worth so much",
        body: "A dollar of principal paid in year one stops accruing interest for the remaining 29 years. The same dollar paid in year 29 stops almost nothing, because there is almost no time left for it to matter. This is not a slogan about discipline — it is arithmetic, and it is why the identical extra payment has wildly different effects depending on when it happens.",
      },
      {
        title: "What the schedule does not include",
        body: "A schedule models principal and interest only. Property tax, homeowners insurance and mortgage insurance sit outside it, and escrow collects them as a separate line that changes when assessed values and premiums change. Two loans with identical schedules can have very different monthly outflows.",
      },
    ],
    example: {
      title: "Worked example: $300,000 at 6% over 30 years",
      setup:
        "Loan $300,000. Annual rate 6%, so the monthly rate is 0.005. Term 30 years = 360 payments.",
      rows: [
        { label: "Monthly payment", value: "$1,798.65", note: "300000 x 0.005 / (1 - 1.005^-360)" },
        { label: "Interest in payment 1", value: "$1,500.00", note: "300000 x 0.005 — the whole balance" },
        { label: "Principal in payment 1", value: "$298.65", note: "1798.65 - 1500.00" },
        { label: "Share of payment 1 going to interest", value: "83.4%", note: "1500 / 1798.65" },
        { label: "Balance after 10 years (120 payments)", value: "$251,057.17", note: "amortised month by month" },
        { label: "Total paid over the term", value: "$647,514.57", note: "1798.65 x 360" },
        { label: "Total interest", value: "$347,514.57", note: "total - 300000" },
      ],
      conclusion:
        "You borrow $300,000 and repay $647,515, of which $347,515 is interest. In the first payment only $298.65 — 16.6% — reduces what you owe. After ten years of paying on time, $251,057 of the original loan is still outstanding. This is the shape every amortisation table has, and it is why the schedule is worth reading once before signing rather than after.",
    },
    mistakes: [
      {
        title: "Reading the total interest as a fee",
        body: "It is not a charge added on top — it is the price of having the money for thirty years, and it declines steeply if the term shortens. The same loan over 15 years carries far less total interest at a higher monthly cost.",
      },
      {
        title: "Assuming principal falls evenly",
        body: "On a 30-year loan at 6%, ten years of payments leave roughly 84% of the loan outstanding. Borrowers who expect to owe half the loan after half the term are working from the payment, not the schedule.",
      },
      {
        title: "Prepaying after the crossover instead of before it",
        body: "The interest share falls below the principal share around the midpoint of the term. An extra payment made after that point still helps, but nothing like the same payment made in the first years.",
      },
    ],
  },

  "capital-gains-calculator": {
    intro:
      "A capital gain is not what the shares are worth minus what you paid — it is the difference between two prices, and a holding period decides which tax treatment applies to it. Both parts are easy to get wrong in opposite directions.",
    mechanics: [
      {
        title: "Proceeds minus basis",
        body: "The gain is what you sold for minus what you paid, where what you paid is the basis — and basis includes the commission you paid to buy, not just the share price. Selling costs reduce the proceeds. Ignoring commissions overstates the gain slightly on a small trade and materially on a large one traded often.",
      },
      {
        title: "The holding period sets the category",
        body: "Gains on assets held for more than one year fall into a different tax category from those held for a year or less, and the two categories are taxed at different rates. The boundary is a year and a day. This is the single most consequential fact in the calculation, and it is not visible in the price at all — two identical gains can be taxed differently depending on when they were bought.",
      },
      {
        title: "What the gain is not",
        body: "A gain is not realised until you sell. Unrealised appreciation is not a taxable event, which is why the timing of a sale is a decision with a tax consequence rather than a mechanical one. Nor is the whole proceeds amount income — only the gain is, and the basis comes back to you as return of your own money.",
      },
    ],
    example: {
      title: "Worked example: 200 shares bought at $45 and sold at $68",
      setup:
        "200 shares purchased at $45 and sold at $68. Commission assumed at $10 on each side, which is an assumption and not a quote.",
      rows: [
        { label: "Cost basis", value: "$9,000.00", note: "200 x 45" },
        { label: "Proceeds", value: "$13,600.00", note: "200 x 68" },
        { label: "Gain before costs", value: "$4,600.00", note: "13600 - 9000" },
        { label: "Gain after $10 each way", value: "$4,580.00", note: "4600 - 20" },
        { label: "Return on cost", value: "51.11%", note: "4600 / 9000" },
        { label: "Return after commission", value: "50.89%", note: "4580 / 9000" },
      ],
      conclusion:
        "The trade returns 51.11% before costs and 50.89% after — a difference of about a fifth of a percentage point here, but one that scales with how often you trade rather than how much you hold. The larger point is what this calculation cannot tell you: whether the gain is long-term or short-term, which depends entirely on the purchase date and is decided by tax law rather than by this arithmetic.",
    },
    mistakes: [
      {
        title: "Using the sale price as the gain",
        body: "Only the difference over basis is a gain. Treating the full proceeds as profit would overstate the taxable amount by a factor of nearly three in the example above.",
      },
      {
        title: "Leaving commissions out of basis",
        body: "Buy-side commission is part of what you paid, so it increases basis and reduces the reported gain. Omitting it overstates the gain and therefore the tax.",
      },
      {
        title: "Assuming the rate is one number",
        body: "There is not a single capital gains rate. The treatment depends on the holding period and on your overall income, and it can also interact with investment income surtaxes. The gain is this calculator's output; the tax on it is a separate question.",
      },
    ],
  },

  "dividend-calculator": {
    intro:
      "A dividend is income you did not have to sell anything to receive, which is exactly why the yield matters more than the share price. Two stocks at $68 are not equivalent if one pays $3.40 a year and the other pays nothing.",
    mechanics: [
      {
        title: "Yield is the dividend over the price",
        body: "Dividend yield is the annual dividend per share divided by the price per share. It is a ratio, so it moves for two reasons: the dividend can change, or the price can. A yield that rose because the price fell is not an improvement — it is the same dividend on a smaller asset, and it is the most common way a high yield misleads.",
      },
      {
        title: "The quarterly pattern is not smooth",
        body: "A quarterly payer pays four times a year, so the income arrives in lumps even though the annual figure is the figure that matters for planning. Companies also raise, cut, or suspend dividends, and a cut is usually a signal about the business rather than a random event — which is why the payment record matters as much as the current yield.",
      },
      {
        title: "Reinvestment compounds the position",
        body: "Dividend reinvestment buys additional shares with each payment, and those shares pay dividends in turn. The arithmetic is ordinary compounding applied to a share count instead of a balance, and over long periods it is the difference between holding a position and holding a growing one.",
      },
    ],
    example: {
      title: "Worked example: 500 shares, $0.85 quarterly, at a $68 price",
      setup:
        "500 shares held. Dividend $0.85 per share per quarter. Share price $68, held constant for the reinvestment illustration.",
      rows: [
        { label: "Annual dividend per share", value: "$3.40", note: "0.85 x 4" },
        { label: "Annual income", value: "$1,700.00", note: "500 x 3.40" },
        { label: "Position value", value: "$34,000.00", note: "500 x 68" },
        { label: "Yield", value: "5.00%", note: "3.40 / 68" },
        { label: "Shares bought by one year of reinvestment", value: "25", note: "1700 / 68" },
        { label: "Shares held after reinvesting", value: "525", note: "500 + 25" },
      ],
      conclusion:
        "Five hundred shares paying $0.85 a quarter produces $1,700 a year on a $34,000 position — a 5.00% yield. Reinvesting that income at the same price buys 25 more shares, so the next year's income is calculated on 525 shares rather than 500. The yield did not change; the base did, which is the whole mechanism behind dividend growth over a long holding period.",
    },
    mistakes: [
      {
        title: "Reading a falling price as a better yield",
        body: "If the price drops from $68 to $34 with the dividend unchanged, the yield doubles to 10% — and you have lost half your capital. The yield rose for the wrong reason.",
      },
      {
        title: "Treating dividends as guaranteed",
        body: "A dividend is declared each period and can be reduced or stopped. A yield calculated from the last payment assumes the next one is the same size, which is an assumption rather than a fact.",
      },
      {
        title: "Ignoring the tax on the income",
        body: "Dividends are taxable in the year received, and the treatment differs between ordinary and qualified dividends. The gross figure this calculator reports is not what you keep.",
      },
    ],
  },

  "mortgage-points-calculator": {
    intro:
      "A discount point is a fee paid now to buy a lower rate, and it is neither automatically good nor bad — it is a bet on how long you keep the loan. The break-even is a specific number of months, and it is worth calculating because the answer changes the decision.",
    mechanics: [
      {
        title: "What a point buys",
        body: "One discount point costs 1% of the loan amount and buys a reduction in the interest rate. On a $300,000 loan, one point is $3,000, and the rate reduction it buys is set by the market rather than by a schedule — it changes with conditions and with the lender. The calculator takes the reduced rate as an input for exactly that reason.",
      },
      {
        title: "The break-even is the whole decision",
        body: "Paying a point lowers the monthly payment, so the money is recovered gradually. Divide the cost of the point by the monthly saving to get the break-even in months. Keep the loan longer than that and the point paid off; sell or refinance sooner and it was a loss, because the fee is not returned.",
      },
      {
        title: "Points and closing costs are different",
        body: "Discount points are a lender charge for the rate. Closing costs are third-party and prepaid items that would exist without any rate reduction. Both are due at settlement, so they are easy to conflate when comparing two offers — but only the point is buying anything.",
      },
    ],
    example: {
      title: "Worked example: $300,000 over 30 years, one point moving 6.50% to 6.25%",
      setup:
        "Loan $300,000 over 360 months. Rate before the point 6.50%. One discount point costs $3,000 and is assumed to reduce the rate to 6.25%, an illustrative reduction rather than a quoted market price.",
      rows: [
        { label: "Payment at 6.50%", value: "$1,896.20", note: "300000 at 6.5% over 360 months" },
        { label: "Payment at 6.25%", value: "$1,847.15", note: "300000 at 6.25% over 360 months" },
        { label: "Monthly saving", value: "$49.05", note: "1896.20 - 1847.15" },
        { label: "Cost of one point", value: "$3,000.00", note: "1% of 300000" },
        { label: "Break-even", value: "61.2 months (5.1 years)", note: "3000 / 49.05" },
        { label: "Lifetime interest saved", value: "$17,658.89", note: "49.05 x 360" },
      ],
      conclusion:
        "The point costs $3,000 and saves $49.05 a month, so it breaks even at about 61 payments — five years and one month. Stay ten years and it is clearly worth it; sell in three and you handed over $3,000 for nothing. That is a tenure question, not a rate question, and it is why the break-even matters more than the headline rate reduction.",
    },
    mistakes: [
      {
        title: "Comparing the rate reduction instead of the break-even",
        body: "A quarter-point cut sounds small and $3,000 sounds large, but the comparison is meaningless on its own. Only the number of months to recover the fee answers the question.",
      },
      {
        title: "Paying points on a loan you expect to refinance",
        body: "The fee is paid at settlement and is not refunded on a refinance or a sale. If the break-even period is longer than your expected tenure, the point loses money regardless of how attractive the lower rate looks.",
      },
      {
        title: "Assuming the point reduction is a fixed amount",
        body: "What a point buys varies by lender and by market conditions. It is not a constant rate cut, so a break-even calculated from one quote does not carry over to another.",
      },
    ],
  },

  "refinance-calculator": {
    intro:
      "A refinance is a purchase of a lower payment with a fee, and the only question that matters is how long it takes the saving to repay the cost. A rate that is lower than your current one is not by itself an argument to refinance.",
    mechanics: [
      {
        title: "The comparison is the two payments",
        body: "Take the payment on the existing loan at its current rate and term remaining, and the payment on the new loan at its rate and term. The difference is the monthly saving. Note that resetting the term matters here: refinancing a loan with 22 years left into a fresh 30-year term lowers the payment partly through the rate and partly by stretching the debt back out.",
      },
      {
        title: "Closing costs are the price of the option",
        body: "A refinance carries its own closing costs, and they can be paid in cash, rolled into the new balance, or absorbed through a higher rate. Rolling them in means paying interest on the fee for the life of the loan; paying them in cash means the cash is gone. Either way the amount is real, and it is the numerator of the break-even.",
      },
      {
        title: "What the payment comparison leaves out",
        body: "A lower payment is not automatically a lower cost. Extending the term can lower the monthly figure while increasing the total interest paid, and restarting the amortisation clock resets the point at which principal begins to dominate. The break-even says when the fee is recovered; it does not say the new loan is cheaper overall.",
      },
    ],
    example: {
      title: "Worked example: $300,000 from 7.00% to 6.00%, $4,500 in costs",
      setup:
        "Balance $300,000 refinanced over a fresh 360 months. Existing rate 7.00%, new rate 6.00%. Closing costs $4,500, assumed rather than quoted.",
      rows: [
        { label: "Payment at 7.00%", value: "$1,995.91", note: "300000 at 7% over 360 months" },
        { label: "Payment at 6.00%", value: "$1,798.65", note: "300000 at 6% over 360 months" },
        { label: "Monthly saving", value: "$197.26", note: "1995.91 - 1798.65" },
        { label: "Closing costs", value: "$4,500.00", note: "assumed" },
        { label: "Break-even", value: "22.8 months (1.9 years)", note: "4500 / 197.26" },
        { label: "Net saving over 5 years", value: "$7,335.35", note: "197.26 x 60 - 4500" },
      ],
      conclusion:
        "The fee is recovered in just under two years, and five years of the lower payment nets $7,335 after costs. That is a short break-even, which is what a full percentage point of rate does. Compare it with a quarter-point reduction and the same $4,500 would take far longer to recover — the costs stay the same while the saving shrinks, and that ratio decides the answer.",
    },
    mistakes: [
      {
        title: "Comparing the rate and not the payment",
        body: "A lower rate on a longer term can produce a lower payment and a higher total cost. The rate is one input; the term is the other, and it moves the total.",
      },
      {
        title: "Forgetting that the term restarts",
        body: "Refinancing 22 years into a new 30-year loan adds eight years of payments. The monthly saving is real and the extra payments are also real, and a break-even calculated on the payment alone will not show them.",
      },
      {
        title: "Ignoring how long you expect to stay",
        body: "The break-even is only meaningful against your expected tenure in the home. A break-even longer than the time you plan to stay means the refinance costs money even though every individual number in it looks favourable.",
      },
    ],
  },

  "home-equity-calculator": {
    intro:
      "Home equity is the difference between what the property is worth and what is owed against it — but the amount you can actually borrow against is a different number, because lenders cap the total debt on the property as a percentage of value.",
    mechanics: [
      {
        title: "Equity is a subtraction, and only as good as the valuation",
        body: "Equity is market value minus the outstanding mortgage balance. The balance is a fact from the servicer; the value is an estimate, and every equity figure inherits that estimate's uncertainty. An appraisal-based value and a valuation from a website can differ by a meaningful margin, and the lender will use its own number.",
      },
      {
        title: "Borrowing is capped by combined loan-to-value",
        body: "Lenders limit the total of all loans secured by the property as a percentage of its value — the combined loan-to-value, or CLTV. If the cap is 80% and the home is worth $450,000, total secured debt cannot exceed $360,000. Subtract the existing mortgage from that ceiling and you have the maximum available, regardless of how much equity exists.",
      },
      {
        title: "Falling prices cut both ways",
        body: "A $280,000 mortgage on a $450,000 home is comfortable. If the value falls to $360,000, the equity is cut by more than half while the debt is unchanged — the loan balance does not participate in the market. That asymmetry is why equity is a weaker cushion than it appears during a downturn.",
      },
    ],
    example: {
      title: "Worked example: a $450,000 home with $280,000 outstanding",
      setup:
        "Home value $450,000. Mortgage balance $280,000. CLTV ceilings of 80% and 90% shown for comparison.",
      rows: [
        { label: "Equity", value: "$170,000.00", note: "450000 - 280000" },
        { label: "Loan-to-value", value: "62.2%", note: "280000 / 450000" },
        { label: "80% CLTV ceiling", value: "$360,000.00", note: "0.80 x 450000" },
        { label: "Borrowable to 80% CLTV", value: "$80,000.00", note: "360000 - 280000" },
        { label: "Borrowable to 90% CLTV", value: "$125,000.00", note: "405000 - 280000" },
        { label: "Equity if the value falls 20%", value: "$80,000.00", note: "360000 - 280000" },
      ],
      conclusion:
        "There is $170,000 of equity, but only $80,000 is borrowable at an 80% CLTV cap — the equity and the borrowing capacity are different numbers, and the gap is the point. Note also that a 20% fall in value takes equity from $170,000 to $80,000, a 53% reduction, while the debt does not move at all.",
    },
    mistakes: [
      {
        title: "Treating equity as spendable",
        body: "Equity is a residual, not a balance. It cannot be withdrawn without a new loan or a sale, both of which cost money and one of which ends your ownership of the asset.",
      },
      {
        title: "Borrowing to the maximum available",
        body: "The cap is a limit the lender imposes, not a recommendation. Borrowing to the ceiling leaves no room for a fall in value, and a fall can turn a comfortable position into a constrained one quickly.",
      },
      {
        title: "Using a website valuation as the number",
        body: "Automated valuations are estimates with a stated error range. A lender's appraisal decides the figure that actually governs the loan.",
      },
    ],
  },

  "heloc-calculator": {
    intro:
      "A home equity line of credit is two loans in one: an interest-only phase that flatters the budget, followed by a repayment phase where the principal is finally amortised. The payment change between them is the fact most borrowers discover late.",
    mechanics: [
      {
        title: "The draw period charges interest only",
        body: "During the draw period you can borrow against the line and are typically billed interest on what is outstanding, with no principal required. On $80,000 at 8.5% that is $566.67 a month — the cost of the money and nothing more. The balance does not fall, so the payment does not fall either.",
      },
      {
        title: "Repayment adds the principal back in",
        body: "When the draw period ends, the outstanding balance is amortised over the repayment term. The same $80,000 at 8.5% over 20 years requires $694.26 a month — a 22.5% increase over the interest-only figure, arriving on a fixed date that was set when the line was opened.",
      },
      {
        title: "The rate is usually variable",
        body: "A HELOC rate is typically tied to an index and moves with it, so both phases are calculated at a rate that can change. The illustration above holds the rate constant to isolate the effect of the phase change; in practice a rise during the draw period raises the interest-only payment and the repayment payment together.",
      },
    ],
    example: {
      title: "Worked example: $80,000 drawn at 8.5%",
      setup:
        "Line of credit $80,000 fully drawn at an assumed 8.5% annual rate, held constant. Draw period billed interest-only; repayment amortised over 20 years.",
      rows: [
        { label: "Interest-only monthly payment", value: "$566.67", note: "80000 x 0.085 / 12" },
        { label: "Annual interest", value: "$6,800.00", note: "0.085 x 80000" },
        { label: "Repayment monthly payment", value: "$694.26", note: "80000 at 8.5% over 240 months" },
        { label: "Increase at repayment", value: "$127.59", note: "694.26 - 566.67" },
        { label: "Increase as a percentage", value: "22.5%", note: "127.59 / 566.67" },
      ],
      conclusion:
        "The interest-only payment is $566.67 and the repayment payment is $694.26 — the same debt, the same rate, and a 22.5% higher monthly cost purely because the principal is now being repaid. Over the draw period $80,000 was paid in interest with the balance untouched, which is the real cost of the structure.",
    },
    mistakes: [
      {
        title: "Budgeting on the interest-only payment",
        body: "It is the smaller of the two numbers and it is temporary. The repayment figure is the one that will arrive, and it arrives on a date fixed at closing.",
      },
      {
        title: "Assuming the rate will not move",
        body: "A variable rate means both payments are calculated at a rate that changes. A rise during the draw period increases the balance's carrying cost before the principal ever comes due.",
      },
      {
        title: "Using a line of credit for long-term spending",
        body: "The line is secured by the home, so failing to pay it puts the property at risk. Money borrowed for consumption converts an unsecured problem into a secured one.",
      },
    ],
  },

  "lease-vs-buy-calculator": {
    intro:
      "A car lease quote is written in a language designed not to be compared with a loan, and the translation key is the money factor. Convert it once and the two offers become comparable numbers.",
    mechanics: [
      {
        title: "The money factor is the interest rate in disguise",
        body: "Leases quote a money factor — a small decimal such as 0.00125 — instead of an interest rate. Multiply it by 2400 and it becomes an annual percentage rate: 0.00125 x 2400 = 3.00%. The conversion factor is not arbitrary; it follows from the way the monthly finance charge is calculated. Without this step a lease cannot be compared with a loan at all, which is arguably the point of quoting it this way.",
      },
      {
        title: "A lease payment has two halves",
        body: "The depreciation portion covers the value the car loses over the term, divided across the months. The finance portion is the money factor applied to the average of the starting and ending values. That second half is rent on the car's value, not on the depreciation — which is why an expensive car with a strong residual can still lease for more than a cheaper one that depreciates faster.",
      },
      {
        title: "What the payment does not tell you",
        body: "A lease payment is lower than a comparable loan payment almost by construction, because a lease buys only the depreciation over the term rather than the whole vehicle. Comparing the two payments alone therefore always favours the lease. The honest comparison adds the down payment, the disposition and mileage fees, and the fact that at the end of a loan you own an asset and at the end of a lease you do not.",
      },
    ],
    example: {
      title: "Worked example: translating money factors",
      setup:
        "Three money factors converted at the standard 2400 multiplier, and one APR converted back for reference. The rent charge is shown on a $20,000 value, which stands in for the average of the starting and ending values.",
      rows: [
        { label: "Money factor 0.00100", value: "2.40% APR", note: "0.00100 x 2400" },
        { label: "Money factor 0.00125", value: "3.00% APR", note: "0.00125 x 2400" },
        { label: "Money factor 0.00200", value: "4.80% APR", note: "0.00200 x 2400" },
        { label: "6.00% APR as a money factor", value: "0.000025", note: "0.06 / 2400" },
        { label: "Monthly rent charge on $20,000", value: "$25.00", note: "20000 x 0.00125" },
      ],
      conclusion:
        "A money factor of 0.00125 is 3.00% a year, and on a $20,000 value it costs $25 a month in finance charges. A dealer who will not state a rate and quotes only the money factor is quoting a number most buyers cannot price — converting it takes one multiplication, and it turns an opaque quote into a comparable one.",
    },
    mistakes: [
      {
        title: "Comparing a lease payment to a loan payment",
        body: "The lease payment covers depreciation over the term; the loan payment covers the whole car. The lower number is lower for a structural reason, not because the deal is better.",
      },
      {
        title: "Ignoring the mileage cap",
        body: "Excess mileage is charged per mile at the end of the term. A lease priced on an allowance you will exceed has a cost that is not in the monthly figure at all.",
      },
      {
        title: "Treating a down payment on a lease as equity",
        body: "Money paid up front on a lease reduces the monthly payment but does not build ownership. If the car is written off early, that money is generally not recovered — which is the opposite of a down payment on a loan.",
      },
    ],
  },

  "net-worth-calculator": {
    intro:
      "Net worth is one subtraction, and almost every mistake people make with it comes from one of the two sides being defined loosely. What counts as an asset, and what has to be subtracted, are decisions rather than arithmetic.",
    mechanics: [
      {
        title: "Assets minus liabilities, and what belongs on each side",
        body: "Add everything you own at a realisable value, subtract everything you owe, and the remainder is net worth. The judgment is in the valuations: a retirement account is an asset at its balance, while a car is an asset at what it would actually sell for today rather than what it cost. A defined-benefit pension is an income stream, not a balance, and putting a number on it requires an assumption.",
      },
      {
        title: "Home equity belongs on the asset side, netted",
        body: "A common error is to count the full market value of a home as an asset while also counting the mortgage as a liability — which is arithmetically correct but double-counts nothing and simply reports the same equity twice in a large, confusing way. The cleaner method is either full value minus full mortgage, or equity as a single asset line. Both produce the same net worth; only one is easy to read.",
      },
      {
        title: "The number is a trend, not a score",
        body: "A net worth measured once says very little, because it moves with markets you do not control. Measured quarterly and compared with itself, it shows whether the gap between what you earn and what you spend is widening or closing — which is the only part of it you actually influence.",
      },
    ],
    example: {
      title: "Worked example: a household balance sheet",
      setup:
        "Assets: retirement accounts $120,000, home equity $90,000, cash $25,000, vehicle $15,000. Liabilities: mortgage $180,000, car loan $18,000, credit cards $6,000. Home equity is stated net here rather than as value minus mortgage, to avoid reporting the house and the loan as separate large lines.",
      rows: [
        { label: "Total assets", value: "$250,000.00", note: "120000 + 90000 + 25000 + 15000" },
        { label: "Total liabilities", value: "$204,000.00", note: "180000 + 18000 + 6000" },
        { label: "Net worth", value: "$46,000.00", note: "250000 - 204000" },
        { label: "Liabilities as a share of assets", value: "81.6%", note: "204000 / 250000" },
        { label: "Net worth excluding home equity", value: "-$44,000.00", note: "46000 - 90000" },
      ],
      conclusion:
        "The household is worth $46,000, but $90,000 of that is home equity — exclude the house and the position is negative $44,000. That is not a criticism; it is what the composition of a young balance sheet looks like. Net worth is most useful not as a total but as a picture of which side it is concentrated on, and how that changes quarter to quarter.",
    },
    mistakes: [
      {
        title: "Listing a house at market value and the mortgage alongside it",
        body: "It produces the right total but a misleading picture, because both figures are large enough that the actual equity disappears inside them. Use value minus loan, or net equity as one line.",
      },
      {
        title: "Valuing a car at what it cost",
        body: "A vehicle depreciates quickly, and its contribution to net worth is what it would sell for now. Carrying the purchase price overstates assets, and the overstatement grows every year you hold it.",
      },
      {
        title: "Counting retirement balances gross of tax",
        body: "A traditional retirement account is worth less than its balance once the tax owed on withdrawal is considered, and a Roth is worth more than a taxable account of the same size. Treating the balance as the value systematically inflates net worth.",
      },
    ],
  },

  "loan-calculator": {
    intro:
      "A loan payment answers a question you did not ask. The useful question is what the money costs in total, and that number is set by the term as much as by the rate.",
    mechanics: [
      {
        title: "One formula, four inputs",
        body: "The payment is P x r / (1 - (1 + r)^-n), where P is the amount borrowed, r the monthly rate and n the number of payments. Notice what is not in it: fees, insurance or anything about you. The formula prices money over time and nothing else, which is why two borrowers with the same loan and the same rate pay the same amount.",
      },
      {
        title: "Term is the expensive lever",
        body: "Lowering the rate helps, but stretching the term costs more because you pay interest for longer on a balance that falls more slowly. A shorter term raises the payment and lowers the total, and the gap is usually larger than the gap between two advertised rates.",
      },
      {
        title: "What the payment excludes",
        body: "Origination fees, late charges and any required insurance sit outside the payment. A loan with the lowest payment is not automatically the cheapest loan, because the fee you paid at the start is not in the monthly figure at all.",
      },
    ],
    example: {
      title: "Worked example: $20,000 at 8% over 60 months",
      setup:
        "Amount borrowed $20,000. Annual rate 8%, so the monthly rate is 0.08 / 12 = 0.00666667. Term 60 months.",
      rows: [
        { label: "Monthly payment", value: "$405.53", note: "20000 x 0.00666667 / (1 - 1.00666667^-60)" },
        { label: "Total paid", value: "$24,331.67", note: "405.53 x 60" },
        { label: "Total interest", value: "$4,331.67", note: "24331.67 - 20000" },
        { label: "Interest as a share of principal", value: "21.7%", note: "4331.67 / 20000" },
      ],
      conclusion:
        "Borrowing $20,000 costs $4,331.67 in interest over five years — about 22% of the amount borrowed, or roughly 4.3 cents per dollar per year. The payment is the number you budget from; this is the number that tells you what the loan is.",
    },
    mistakes: [
      {
        title: "Choosing the offer with the lowest payment",
        body: "The lowest payment usually comes from the longest term, and the longest term carries the most interest. Payment and total cost move in opposite directions whenever the term changes.",
      },
      {
        title: "Comparing rates without comparing terms",
        body: "A lower rate over a longer term can still cost more than a higher rate over a shorter one. Compare total cost across different terms, and rate only within the same term.",
      },
      {
        title: "Leaving fees out of the comparison",
        body: "Origination fees are real money paid at the start. A loan with a slightly lower rate and a large fee can cost more than a slightly higher rate with none.",
      },
    ],
  },

  "student-loan-calculator": {
    intro:
      "Student loans are unusual in offering a choice of term, and the choice is the whole cost. The same balance repaid over 25 years instead of 10 costs far more while feeling more affordable every month.",
    mechanics: [
      {
        title: "The balance is not the cost",
        body: "A student loan balance is what you borrowed; the cost is what you repay. Those two numbers can differ by more than the balance itself, and the difference is set almost entirely by the repayment term you select.",
      },
      {
        title: "The term trade is stark",
        body: "Extending a term lowers the payment and raises the total, and on student balances the total rises by more than most people expect — because the balance is large and the term is long. The monthly relief is immediate; the extra interest arrives slowly and is easy not to notice.",
      },
      {
        title: "Capitalisation and deferment",
        body: "Unpaid interest during a deferment or forbearance can be added to the principal, and interest then accrues on the larger balance. That single event can raise the cost of the loan more than any rate change, which is why keeping interest paid during a pause matters.",
      },
    ],
    example: {
      title: "Worked example: $35,000 at 6.5%, 10 years versus 25 years",
      setup:
        "Balance $35,000. Annual rate 6.5%, so the monthly rate is 0.00541667. Two terms compared with the rate held constant.",
      rows: [
        { label: "Payment over 10 years", value: "$397.42", note: "35000 at 6.5% over 120 months" },
        { label: "Interest over 10 years", value: "$12,690.15", note: "397.42 x 120 - 35000" },
        { label: "Payment over 25 years", value: "$236.32", note: "35000 at 6.5% over 300 months" },
        { label: "Interest over 25 years", value: "$35,896.75", note: "236.32 x 300 - 35000" },
        { label: "Monthly relief from the longer term", value: "$161.10", note: "397.42 - 236.32" },
        { label: "Extra interest from the longer term", value: "$23,206.60", note: "35896.75 - 12690.15" },
      ],
      conclusion:
        "The longer term saves $161.10 a month and costs $23,206.60 more — on a $35,000 balance, the extra interest is about two thirds of the amount borrowed. That is the trade in one line, and it is worth deciding deliberately rather than selecting the lower payment by default.",
    },
    mistakes: [
      {
        title: "Choosing the term by payment alone",
        body: "The lowest payment is available on the longest term, which is also the most expensive. If the goal is minimising cost, the shortest affordable term wins.",
      },
      {
        title: "Ignoring interest capitalisation during a pause",
        body: "Deferment or forbearance does not stop interest on most loans. If it capitalises, the principal grows and every subsequent payment is calculated on a larger number.",
      },
      {
        title: "Assuming extra payments are applied where you want",
        body: "Unless directed, extra payments may be applied to future instalments rather than to principal. Confirm it is reducing principal, or the extra money does not shorten the loan.",
      },
    ],
  },

  "take-home-pay-calculator": {
    intro:
      "Gross pay is what the offer letter says. Take-home is what reaches the account, and the difference is not tax — it is tax plus payroll contributions, and the gap widens as income rises.",
    mechanics: [
      {
        title: "Payroll contributions come off first",
        body: "FICA is withheld at a statutory rate on wages, split between social security and Medicare. It applies from the first dollar, so it is a flat slice off the top rather than a progressive one, and it is why the very first hour of work is already taxed.",
      },
      {
        title: "Income tax is progressive, so the rate is not one number",
        body: "The rate that applies to your last dollar is not the rate that applies to all of them. Tax is calculated band by band, so the effective rate on total income is always below the marginal rate. Quoting one figure as your tax rate is the most common error in this calculation.",
      },
      {
        title: "What else comes off",
        body: "Pre-tax retirement contributions, health premiums and commuter benefits reduce taxable wages before income tax is calculated, which is why they cost less than their face value. Post-tax deductions such as Roth contributions and wage garnishments reduce take-home without reducing taxable income.",
      },
    ],
    example: {
      title: "Worked example: $60,000 gross with illustrative tax",
      setup:
        "Gross pay $60,000. FICA at the statutory 7.65% combined rate. Income tax taken as an assumed $9,000 — an illustration, not a bracket table, because rates and brackets change and this page does not quote them.",
      rows: [
        { label: "FICA at 7.65%", value: "$4,590.00", note: "60000 x 0.0765" },
        { label: "Assumed income tax", value: "$9,000.00", note: "illustrative, not a bracket figure" },
        { label: "Take-home for the year", value: "$46,410.00", note: "60000 - 4590 - 9000" },
        { label: "Take-home per month", value: "$3,867.50", note: "46410 / 12" },
        { label: "Total withheld as a share of gross", value: "22.7%", note: "13590 / 60000" },
      ],
      conclusion:
        "On $60,000 the deductions come to 22.7% of gross, leaving $3,867.50 a month. The FICA slice is fixed at 7.65% for everyone earning wages; the income tax slice is the part that moves, and it is the part that makes comparing two salaries on gross alone unreliable.",
    },
    mistakes: [
      {
        title: "Treating your marginal rate as your average rate",
        body: "The effective rate on total income is always lower than the rate on the last dollar, because the lower bands were taxed at lower rates. Budgeting as though every dollar is taxed at the marginal rate understates take-home.",
      },
      {
        title: "Assuming a raise is worth its gross amount",
        body: "A raise lands in your highest band, so the net increase is smaller than the gross increase. It is still an increase — the mechanism never reduces take-home — but it is not the headline number.",
      },
      {
        title: "Ignoring pre-tax deductions when comparing offers",
        body: "A higher salary with expensive health premiums and no retirement match can leave less in the account than a lower salary with generous pre-tax benefits. Compare net, not gross.",
      },
    ],
  },

  "property-tax-calculator": {
    intro:
      "Property tax is a percentage of someone else's opinion of your house, applied through a rate you did not set, and it changes without your consent. It is also the line item most likely to move an escrow payment.",
    mechanics: [
      {
        title: "Mill rates are just per-thousand rates",
        body: "A mill is one dollar of tax per thousand dollars of assessed value. A 22-mill rate on a $380,000 assessment is 380,000 x 22 / 1000 = $8,360. The arithmetic is small; the variable is the assessment, which is made by the county and can move independently of what your house would sell for.",
      },
      {
        title: "Assessed value is not market value",
        body: "Many jurisdictions assess at a fraction of market value, or on a cycle that lags the market by years. An assessment freeze, a cap on annual increases, or a homestead exemption all break the link between what the house is worth and what it is taxed on. That is why two neighbouring houses can carry very different bills.",
      },
      {
        title: "Where the money goes and why it rises",
        body: "The rate is the total of several levies — county, municipality, school district, and often special districts — each set by its own body. The bill rises when the total levy rises or when the assessed value rises, and the two can move in opposite directions in a single year.",
      },
    ],
    example: {
      title: "Worked example: $380,000 assessed value at 22 mills",
      setup:
        "Assessed value $380,000. Combined mill rate 22 mills, which is an assumed figure rather than a quoted rate — mill rates are set locally and vary widely.",
      rows: [
        { label: "One mill on this value", value: "$380.00", note: "380000 / 1000" },
        { label: "Annual tax", value: "$8,360.00", note: "380000 x 22 / 1000" },
        { label: "Monthly equivalent", value: "$696.67", note: "8360 / 12" },
      ],
      conclusion:
        "The annual bill is $8,360, or $696.67 a month — one of the largest single line items in a housing budget after the mortgage itself, and unlike the mortgage it is never repaid. An increase of two mills on the same assessment adds $760 a year, which is why a reassessment year is worth checking rather than assuming.",
    },
    mistakes: [
      {
        title: "Using the purchase price as the assessed value",
        body: "The two are set by different processes and often differ. The county's assessment is the number the tax is calculated on, and it is published.",
      },
      {
        title: "Forgetting that escrow adjusts after a reassessment",
        body: "When the assessment rises, the servicer raises the monthly escrow to cover it, and may also collect a shortage for the previous year. The payment can jump for two reasons at once.",
      },
      {
        title: "Assuming the rate is fixed",
        body: "Mill rates are set annually by each levying body. A rate can rise even when your own assessment does not.",
      },
    ],
  },

  "tax-refund-calculator": {
    intro:
      "A refund is not a reward. It is the difference between what was withheld from your pay and what you actually owed — money that sat with the government instead of with you for a year, earning nothing.",
    mechanics: [
      {
        title: "Withholding versus liability",
        body: "Your employer withholds an amount based on the form you filed, and your liability is what the tax return calculates. If withholding exceeded liability you get the difference back; if it fell short, you pay it. A refund is exactly that subtraction, not a payment from the government.",
      },
      {
        title: "A large refund is an interest-free loan you made",
        body: "Every dollar over-withheld was unavailable to you for up to twelve months. A $1,600 refund is $133.33 a month that could have been in an account earning something, so the correct target is a small refund or a small balance due, not a large one.",
      },
      {
        title: "Why it swings between years",
        body: "A second job, a bonus, a change in filing status, a new dependent, or a withdrawal from a retirement account can all move liability without moving withholding. A refund that changes by thousands between two similar years is usually one of those events rather than an error.",
      },
    ],
    example: {
      title: "Worked example: withholding against liability",
      setup:
        "Two scenarios with the same withholding of $12,000, differing only in the liability the return calculates.",
      rows: [
        { label: "Withheld", value: "$12,000.00", note: "the sum across the year" },
        { label: "Liability in case A", value: "$10,400.00", note: "assumed" },
        { label: "Refund in case A", value: "$1,600.00", note: "12000 - 10400" },
        { label: "Liability in case B", value: "$13,000.00", note: "assumed" },
        { label: "Balance owed in case B", value: "$1,000.00", note: "13000 - 12000" },
        { label: "Monthly cost of the $1,600 over-withholding", value: "$133.33", note: "1600 / 12" },
      ],
      conclusion:
        "Same withholding, two different outcomes, entirely from what the liability turns out to be. In case A you lent the government $1,600 across the year in monthly instalments of $133.33 and were repaid without interest. A refund is a symptom of an imprecise withholding form, not a sign the system worked.",
    },
    mistakes: [
      {
        title: "Treating the refund as free money",
        body: "It is your own money, returned late. It was not a gain, and it earned nothing while it was held.",
      },
      {
        title: "Filing a new withholding form to chase a bigger refund",
        body: "Increasing withholding produces a larger refund and less take-home pay by exactly the same amount. Nothing is gained except the illusion of a windfall.",
      },
      {
        title: "Assuming no refund means something went wrong",
        body: "A small balance owed, or a small refund, is the accurate outcome. It means withholding matched liability, which is the goal.",
      },
    ],
  },

  "sales-tax-calculator": {
    intro:
      "Sales tax is charged on the price and not on the total, which sounds obvious until you need to work backwards from a receipt and extract the tax that is already inside the figure.",
    mechanics: [
      {
        title: "Adding tax",
        body: "Multiply the price by the rate and add it: $250 at 8.25% is $20.63 of tax on top of the $250, for a total of $270.63. The rate itself is a stack of overlapping jurisdictions — state, county, city and often a special district — which is why the combined rate at one address can differ from the rate a mile away.",
      },
      {
        title: "Extracting tax from a gross figure",
        body: "When the receipt shows only a total, dividing by 1 + rate gives the pre-tax price, and subtracting that from the total gives the tax. It is not the same as multiplying the total by the rate — that common mistake overstates the tax, because the rate was applied to a smaller number than the total.",
      },
      {
        title: "What is taxed varies",
        body: "Whether a given item is taxable at all depends on the jurisdiction: groceries, prescription medicine, clothing and digital goods are treated differently in different states, and some states have no sales tax at all. The rate is only half the answer; whether it applies is the other half.",
      },
    ],
    example: {
      title: "Worked example: $250 at 8.25%",
      setup:
        "Pre-tax price $250. Combined rate 8.25%, which is an assumed rate rather than a quoted one — combined rates are set locally.",
      rows: [
        { label: "Tax added", value: "$20.63", note: "250 x 0.0825" },
        { label: "Total charged", value: "$270.63", note: "250 x 1.0825" },
        { label: "Base price inside $270.63", value: "$250.00", note: "270.63 / 1.0825" },
        { label: "Tax inside $270.63", value: "$20.63", note: "270.63 - 250.00" },
        { label: "The wrong way to extract it", value: "$22.33", note: "270.63 x 0.0825 — overstates the tax" },
      ],
      conclusion:
        "The correct extraction divides by 1.0825 and gets $250.00 and $20.63. Multiplying the total by the rate instead gives $22.33, which is $1.70 too high — because the tax was never charged on the total. The error is small on one purchase and systematic across a year of expenses.",
    },
    mistakes: [
      {
        title: "Multiplying the gross total by the rate to find the tax",
        body: "The rate was applied to the pre-tax price, which is smaller than the total. Multiplication by the rate on the total always overstates the tax.",
      },
      {
        title: "Assuming one rate applies everywhere in a state",
        body: "County, city and district taxes stack on top of the state rate. The combined rate is address-specific.",
      },
      {
        title: "Assuming the rate applies to everything",
        body: "Exemptions for food, medicine and other categories mean the effective rate on a basket can be far below the headline rate.",
      },
    ],
  },

  "tax-bracket-calculator": {
    intro:
      "A tax bracket does not tax all your income. It taxes the income inside it, which is why moving into a higher bracket never reduces what you keep — and why your effective rate is always lower than your marginal rate.",
    mechanics: [
      {
        title: "The brackets stack",
        body: "Income is taxed in bands. The first band is taxed at the lowest rate, the next band at a higher rate, and so on, with each rate applying only to the income that falls inside that band. Your marginal rate is the rate on the last band you reach; your effective rate is total tax divided by total income, and it is always the smaller of the two.",
      },
      {
        title: "A raise never lowers take-home",
        body: "It is a persistent myth that earning slightly more can push you into a higher bracket and leave you worse off. It cannot happen under a band system, because only the income above the threshold is taxed at the higher rate. Earning more always leaves you with more, though the increase is smaller than the gross raise.",
      },
      {
        title: "Why the illustration below is hypothetical",
        body: "Tax rates and band boundaries change, vary by filing status, and interact with deductions, credits and other income. This page deliberately does not print a current bracket table, because a table that is quietly out of date is worse than none. The example below uses invented bands to show the mechanism; the calculator applies the figures you give it.",
      },
    ],
    example: {
      title: "Worked example: a hypothetical three-band system",
      setup:
        "Invented bands for illustration only: 10% on the first $20,000, 20% on the next $30,000, 30% above $50,000. Income $70,000. These figures are not a real tax schedule and are not presented as one.",
      rows: [
        { label: "Tax on the first $20,000", value: "$2,000.00", note: "20000 x 0.10" },
        { label: "Tax on the next $30,000", value: "$6,000.00", note: "30000 x 0.20" },
        { label: "Tax on the remaining $20,000", value: "$6,000.00", note: "20000 x 0.30" },
        { label: "Total tax", value: "$14,000.00", note: "2000 + 6000 + 6000" },
        { label: "Marginal rate", value: "30%", note: "the rate on the last dollar" },
        { label: "Effective rate", value: "20.0%", note: "14000 / 70000" },
        { label: "Tax on a further $1,000 of income", value: "$300.00", note: "1000 x 0.30 — and you keep $700" },
      ],
      conclusion:
        "The income sits in the 30% band and pays an effective 20%. The second number is the one that describes the year; the first is the one that describes the next dollar. A further $1,000 is taxed at $300 and $700 is kept — the bracket raises the rate on the margin and never confiscates the whole increase.",
    },
    mistakes: [
      {
        title: "Applying the marginal rate to all income",
        body: "That would give $21,000 here instead of $14,000. The lower bands are taxed at their own lower rates, and ignoring that overstates the bill by 50%.",
      },
      {
        title: "Believing a raise can reduce take-home",
        body: "Only the income above a threshold is taxed at the higher rate, so take-home always rises with a raise. The net increase is smaller than the gross increase, which is a different thing.",
      },
      {
        title: "Reading an effective rate as a target to optimise",
        body: "The effective rate is an output, not a lever. It falls when income falls, which is not a strategy. Deductions and credits are the levers.",
      },
    ],
  },

  "escrow-calculator": {
    intro:
      "Escrow is not a fee. It is your own money, collected monthly so that a large annual bill does not arrive all at once — and the monthly figure is recalculated every year against whatever the tax and insurance actually became.",
    mechanics: [
      {
        title: "It is a monthly average of annual bills",
        body: "Add the annual property tax to the annual insurance premium and divide by twelve. Tax of $6,000 and insurance of $1,800 gives $7,800 a year, or $650 a month. That amount is added to principal and interest to produce the payment you actually make.",
      },
      {
        title: "The cushion, and why there is a shortage",
        body: "Servicers typically hold a cushion of a couple of months of escrow on top of what is currently due, to cover a bill that arrives before enough has been collected. When the actual tax or premium comes in higher than estimated, the account runs short, and the servicer recovers the shortage by raising the monthly amount — which is why escrow jumps often look larger than the underlying bill.",
      },
      {
        title: "The overage is yours",
        body: "If the bills come in lower than estimated, the surplus belongs to you, not the servicer. It is either refunded or credited against future payments, and asking for the annual escrow statement is how you check which happened.",
      },
    ],
    example: {
      title: "Worked example: $6,000 tax and $1,800 insurance",
      setup:
        "Annual property tax $6,000, annual insurance $1,800. Principal and interest payment taken as $1,798.65 from a $300,000 loan at 6% over 30 years.",
      rows: [
        { label: "Annual escrow total", value: "$7,800.00", note: "6000 + 1800" },
        { label: "Monthly escrow", value: "$650.00", note: "7800 / 12" },
        { label: "Full monthly payment", value: "$2,448.65", note: "1798.65 + 650" },
        { label: "Two-month cushion", value: "$1,300.00", note: "650 x 2" },
        { label: "Monthly escrow if tax rises to $6,600", value: "$700.00", note: "(6600 + 1800) / 12" },
        { label: "Increase when a $600 shortage is also spread", value: "$100.00", note: "50 for the rise + 50 for the shortage" },
      ],
      conclusion:
        "A $600 rise in the tax bill raises escrow by $50 a month — but the payment rises by $100, because the same year's shortage is also recovered over twelve months. That doubling is the reason an escrow adjustment so often looks disproportionate to the bill behind it.",
    },
    mistakes: [
      {
        title: "Treating escrow as a lender charge",
        body: "It is your money held to pay your bills. The lender does not keep it, and an overage is refunded or credited to you.",
      },
      {
        title: "Budgeting from principal and interest alone",
        body: "Tax and insurance commonly add a substantial amount on top. A payment quote that excludes escrow is not the payment.",
      },
      {
        title: "Assuming the escrow figure is stable",
        body: "It is recalculated annually against actual bills, and a reassessment or an insurance renewal can move it substantially in one cycle.",
      },
    ],
  },

  "va-mortgage-calculator": {
    intro:
      "A VA loan's advantage is not only the absence of a down payment — it is the absence of monthly mortgage insurance, which on a low-down-payment conventional loan is a real and permanent cost until the balance falls far enough.",
    mechanics: [
      {
        title: "No monthly mortgage insurance",
        body: "A conventional loan with a small down payment requires private mortgage insurance until the balance reaches roughly 80% of value. A VA loan does not carry that monthly charge at all. On a $308,800 loan at a 0.60% annual rate that is $154.40 a month, and it is the single largest structural difference between the two.",
      },
      {
        title: "A funding fee instead, which can be financed",
        body: "VA loans charge a one-time funding fee rather than monthly insurance. The percentage depends on your down payment and whether you have used the entitlement before, so it is not a single number — check the current schedule. The fee is typically added to the loan balance, which raises the payment slightly but avoids cash at closing.",
      },
      {
        title: "What the comparison must include",
        body: "Comparing a VA payment to a conventional payment is only fair if the conventional figure includes its mortgage insurance and both include the same taxes and insurance. A VA payment compared against a conventional principal-and-interest figure will always look worse, because the VA loan is borrowing more at zero down.",
      },
    ],
    example: {
      title: "Worked example: $320,000 at 0% down, VA versus conventional",
      setup:
        "Purchase price $320,000. VA: no down payment, funding fee taken as an illustrative 2.15% and financed. Conventional: 3.5% down and monthly mortgage insurance at an assumed 0.60% a year. Both at 6.5% over 360 months.",
      rows: [
        { label: "VA funding fee at 2.15%", value: "$6,880.00", note: "320000 x 0.0215 — illustrative, check the current schedule" },
        { label: "VA loan amount", value: "$326,880.00", note: "320000 + 6880" },
        { label: "VA monthly payment", value: "$2,066.10", note: "326880 at 6.5% over 360" },
        { label: "Conventional loan at 3.5% down", value: "$308,800.00", note: "320000 x 0.965" },
        { label: "Conventional payment", value: "$1,951.83", note: "308800 at 6.5% over 360" },
        { label: "Monthly mortgage insurance at 0.60%", value: "$154.40", note: "308800 x 0.006 / 12" },
        { label: "Conventional all-in", value: "$2,106.23", note: "1951.83 + 154.40" },
        { label: "VA advantage per month", value: "$40.12", note: "2106.23 - 2066.10" },
      ],
      conclusion:
        "The VA loan borrows $6,880 more and still costs $40.12 a month less, because the conventional loan is paying $154.40 a month in insurance that the VA loan simply does not have. The VA loan also needed no down payment, so the comparison is between $0 at closing and $11,200 plus a monthly insurance charge.",
    },
    mistakes: [
      {
        title: "Comparing the VA payment to principal and interest only",
        body: "The conventional figure must include its mortgage insurance or the comparison is between two different things. That omission makes the VA loan look worse than it is.",
      },
      {
        title: "Treating the funding fee percentage as fixed",
        body: "It varies with down payment and prior use of the entitlement. Using a single figure as though it were universal mis-states the cost.",
      },
      {
        title: "Ignoring that the conventional insurance eventually ends",
        body: "Conventional mortgage insurance can be cancelled once the balance falls far enough, so its cost is not permanent — but on a low down payment that can take years. The VA advantage is largest early and narrows over time.",
      },
    ],
  },

  "rent-vs-buy-calculator": {
    intro:
      "The comparison is not rent against a mortgage payment. It is the total cost of each path over the years you intend to stay, which for a short stay can favour renting by a wide margin.",
    mechanics: [
      {
        title: "Buying costs more than the payment",
        body: "Property tax, insurance and maintenance sit on top of principal and interest, and maintenance alone is commonly estimated near 1% of value a year. In the example below those three add $900 a month to a $1,798.65 mortgage payment, so the true monthly outflow is about 50% higher than the loan payment.",
      },
      {
        title: "But part of the payment is not a cost",
        body: "The principal portion of each payment converts cash into equity rather than spending it. Over five years on a $300,000 loan at 6%, $20,836.82 of principal is repaid — real value that offsets the outflow, though it is not liquid.",
      },
      {
        title: "The break-even is a year count, not an opinion",
        body: "Buying has large one-off costs at the start and large recurring costs throughout, but builds equity. Renting is cheaper monthly and builds nothing. The question is how many years it takes for equity and future appreciation to outweigh the extra cost — and that number is very sensitive to how long you stay.",
      },
    ],
    example: {
      title: "Worked example: five years, rent versus buy",
      setup:
        "Rent $2,000 a month rising 3% a year. Buy: $300,000 loan at 6% over 30 years, property tax and insurance $650 a month, maintenance $250 a month. Appreciation is excluded, so this measures cost only.",
      rows: [
        { label: "Rent over five years", value: "$127,419.26", note: "24000 + 24720 + 25461.60 + 26225.45 + 27012.21" },
        { label: "Buying outflow over five years", value: "$161,919.00", note: "(1798.65 + 650 + 250) x 60" },
        { label: "Balance after 60 payments", value: "$279,163.18", note: "amortised using the payment as displayed" },
        { label: "Principal repaid", value: "$20,836.82", note: "300000 - 279163.18" },
        { label: "Net cost of buying", value: "$141,082.18", note: "161919.00 - 20836.82" },
        { label: "Renting is cheaper by", value: "$13,662.92", note: "141082.18 - 127419.26" },
      ],
      conclusion:
        "Over five years and excluding appreciation, buying costs $13,662.92 more than renting — even after crediting the $20,836.82 of principal repaid. Buying wins on longer horizons because equity accumulates and the fixed mortgage payment erodes in real terms while rent rises, but on a five-year view the extra cost is real. Change the stay to ten or fifteen years and the answer usually moves the other way.",
    },
    mistakes: [
      {
        title: "Comparing rent to the mortgage payment",
        body: "The mortgage payment excludes tax, insurance and maintenance, which commonly add 40-50% again. The full outflow is what the comparison needs.",
      },
      {
        title: "Ignoring that principal is not spent",
        body: "The principal portion becomes equity. Omitting that credit overstates the cost of buying; counting it as if it were cash understates the cash-flow strain.",
      },
      {
        title: "Assuming appreciation will make a short stay work",
        body: "Selling costs money, and a short holding period gives appreciation little time to cover it. A five-year stay is generally the shortest horizon where buying is defensible, and even then it depends on prices.",
      },
    ],
  },

  "retirement-calculator": {
    intro:
      "Retirement arithmetic has two halves that are usually discussed as one: how much you accumulate, and how much that balance can pay you without running out. The second is the harder half, because it depends on a future you cannot observe.",
    mechanics: [
      {
        title: "Accumulation is an annuity",
        body: "Regular contributions growing at a rate produce a future value of P x (((1 + r)^n - 1) / r). At $25,000 a year for 30 years and 6%, that is $1,976,454.66. The contributions total $750,000, so the majority of the balance is growth rather than deposits — which is why starting early outperforms contributing more later.",
      },
      {
        title: "Withdrawal is a percentage, not a figure",
        body: "A withdrawal rate is expressed as a share of the portfolio, and the share determines how long it lasts. A commonly cited starting point is 4%, which on $1,000,000 is $40,000 a year, or $3,333.33 a month. The lower the rate, the longer the money lasts and the more conservative the plan.",
      },
      {
        title: "Why the two halves have different risks",
        body: "Accumulation is exposed to how long you contribute and what the market does on average. Withdrawal is exposed to the ORDER of returns, because a bad stretch early in retirement permanently reduces the base every later withdrawal is calculated on. Two portfolios with identical average returns can support very different withdrawals if the sequence differs.",
      },
    ],
    example: {
      title: "Worked example: accumulating at $25,000 a year",
      setup:
        "Contribution $25,000 a year for 30 years at an assumed 6% annual return, contributions at year end. A 4% initial withdrawal rate applied to the result.",
      rows: [
        { label: "Total contributed", value: "$750,000.00", note: "25000 x 30" },
        { label: "Balance after 30 years", value: "$1,976,454.66", note: "25000 x ((1.06^30 - 1) / 0.06)" },
        { label: "Growth in the balance", value: "$1,226,454.66", note: "1976454.66 - 750000" },
        { label: "4% withdrawal", value: "$79,058.19", note: "1976454.66 x 0.04" },
        { label: "Capital needed for $40,000 a year", value: "$1,000,000.00", note: "40000 / 0.04" },
        { label: "Monthly income from that capital", value: "$3,333.33", note: "40000 / 12" },
      ],
      conclusion:
        "Thirty years of $25,000 produces about $1.98m, of which only $750,000 is your own money. At a 4% withdrawal that supports roughly $79,000 a year — $6,588 a month — against a target of $1,000,000 for a $40,000 income. The accumulation half is generous when the return is steady; the withdrawal half is where the plan is most likely to be surprised.",
    },
    mistakes: [
      {
        title: "Assuming a steady return",
        body: "The annuity formula requires the same return every year. Real returns vary, and a bad sequence during the withdrawal years damages a plan far more than the same bad years during accumulation.",
      },
      {
        title: "Treating the 4% figure as a rule",
        body: "It is a starting point derived from historical data, not a guarantee. A longer retirement, higher fees or a lower-return environment all argue for a lower rate.",
      },
      {
        title: "Ignoring what withdrawal does to tax and benefits",
        body: "Withdrawals from traditional accounts are taxable income and can affect means-tested benefits and surcharges. The gross withdrawal is not the amount available to spend.",
      },
    ],
  },

  "retirement-age-calculator": {
    intro:
      "The age you can retire is not a personal characteristic. It is an output of how much you save, what it earns and what you intend to spend — and the first of those is the one you control.",
    mechanics: [
      {
        title: "Three inputs, one output",
        body: "Solve for time rather than balance: given a contribution, a return and a target, the years required is where the accumulated value reaches the target. At $25,000 a year and 7%, reaching $1,000,000 takes about 19.7 years. Change the contribution and the answer moves further than changing the return.",
      },
      {
        title: "The savings rate dominates",
        body: "Because the target is usually expressed as a multiple of spending, a higher savings rate both shortens the accumulation and lowers the spending the portfolio has to support. It attacks the problem from both ends at once, which is why it is the strongest lever available and the hardest to move.",
      },
      {
        title: "The target is not a number, it is a ratio",
        body: "Retiring at a given age mostly means having enough to sustain a chosen lifestyle indefinitely. Expressing the target as a multiple of annual spending makes it comparable across incomes; expressing it as a raw figure does not.",
      },
    ],
    example: {
      title: "Worked example: $25,000 a year at 7%",
      setup:
        "Contribution $25,000 a year, assumed return 7% a year, target $1,000,000. Contributions at year end.",
      rows: [
        { label: "Years to $1,000,000", value: "19.7 years", note: "ln(1 + 1000000 x 0.07 / 25000) / ln(1.07)" },
        { label: "Balance after 20 years", value: "$1,024,887.31", note: "25000 x ((1.07^20 - 1) / 0.07)" },
        { label: "Total contributed over 20 years", value: "$500,000.00", note: "25000 x 20" },
        { label: "Growth over 20 years", value: "$524,887.31", note: "1024887.31 - 500000" },
      ],
      conclusion:
        "At $25,000 a year the target arrives just under twenty years, and half the balance is growth rather than contributions. Note how little the answer depends on the exact starting age: the input that moves it is the contribution, and the second is the return. A retirement-age estimate is therefore a savings-rate estimate wearing a date.",
    },
    mistakes: [
      {
        title: "Treating the retirement age as a choice",
        body: "It is a consequence of the savings rate, the return and the spending target. You choose the inputs and the age follows.",
      },
      {
        title: "Assuming a higher return shortens the wait as much as saving more",
        body: "Return assumptions are uncertain and can be wrong in both directions. Contributions are within your control, which makes them the more reliable lever.",
      },
      {
        title: "Forgetting healthcare before eligibility for public programmes",
        body: "Retiring before public health coverage begins means funding it privately, which raises the spending the portfolio must carry. That cost is not in the calculator's arithmetic and it can be substantial.",
      },
    ],
  },

  "rmd-calculator": {
    intro:
      "An RMD is a minimum, not a maximum, and it is calculated on a balance that no longer exists. Both of those facts catch people out in the first year it applies.",
    mechanics: [
      {
        title: "Prior-year balance, divided by a factor from a table",
        body: "The required amount is the December 31 balance from the previous year divided by an IRS life-expectancy factor for your age. At 73 the factor is 26.5, so $500,000 requires $18,867.92 — a 3.77% withdrawal. Because the divisor falls as you age, the required percentage rises every year.",
      },
      {
        title: "The balance is a snapshot, the market is not",
        body: "The requirement is fixed by a balance measured on one day. A market fall after December 31 does not reduce what you must withdraw, which is the risk in the rule: the withdrawal is set by a number that may already be history.",
      },
      {
        title: "The first year has a one-time deferral",
        body: "The first distribution can be delayed to April 1 of the following year. That does not shift the tax year — it means two distributions land in one year, which can push income into a higher band or affect income-tested charges on the same money.",
      },
    ],
    example: {
      title: "Worked example: $500,000 at age 73",
      setup:
        "Account balance on the prior December 31: $500,000. Age reached during the year: 73, which corresponds to a Uniform Lifetime Table factor of 26.5.",
      rows: [
        { label: "Factor at age 73", value: "26.5", note: "IRS Uniform Lifetime Table" },
        { label: "Required distribution", value: "$18,867.92", note: "500000 / 26.5" },
        { label: "Required percentage", value: "3.77%", note: "1 / 26.5" },
        { label: "If the balance were $750,000", value: "$28,301.89", note: "750000 / 26.5" },
      ],
      conclusion:
        "The percentage is modest at the start and rises with age because the divisor shrinks. Note that the arithmetic is one division — the difficulty is never the calculation, it is the deadline and the fact that missing it carries an excise tax on the shortfall. The RMD guide covers the rules the calculator does not model, including inherited accounts and cross-account aggregation.",
    },
    mistakes: [
      {
        title: "Using this year's balance",
        body: "The requirement is based on the prior December 31 balance. Using the current balance produces a number that is wrong in a way that is invisible until the tax is calculated.",
      },
      {
        title: "Assuming a Roth account is included",
        body: "Roth IRAs are not subject to RMDs during the owner's lifetime. Applying the calculation to one overstates the required withdrawal.",
      },
      {
        title: "Treating the RMD as the maximum",
        body: "It is a floor. You may withdraw more, and taking only the minimum when you need more later means larger forced withdrawals from a smaller invested base.",
      },
    ],
  },

  "investment-calculator": {
    intro:
      "An investment result is two things added together: what a lump sum becomes, and what a series of contributions becomes. They grow at the same rate but over different amounts of time, and that difference is why the contributions usually dominate.",
    mechanics: [
      {
        title: "Two components, one rate",
        body: "A lump sum grows as P x (1 + r)^n. A series of contributions grows as PMT x (((1 + r)^n - 1) / r). In both cases compounding is applied at the periodic rate, so a monthly contribution uses a monthly rate and a monthly count of periods — not an annual rate divided roughly.",
      },
      {
        title: "Timing of contributions changes the total",
        body: "A contribution made at the start of a period compounds for one period longer than one made at the end. Over twenty years that difference is small per contribution and material in aggregate, which is why the calculator distinguishes the two rather than ignoring it.",
      },
      {
        title: "What the balance does not include",
        body: "Fees, taxes and the drag from an unsteady sequence of returns are all absent from a formula that assumes a constant rate. In a taxable account the annual tax on dividends and realised gains reduces the effective rate, and the size of that reduction depends on what you hold and how often you trade.",
      },
    ],
    example: {
      title: "Worked example: $10,000 plus $500 a month at 7% for 20 years",
      setup:
        "Initial lump sum $10,000. Monthly contribution $500. Assumed annual return 7%, so the monthly rate is 0.07 / 12 = 0.00583333. Term 20 years = 240 months.",
      rows: [
        { label: "Growth factor over 240 months", value: "4.038739", note: "(1.00583333)^240" },
        { label: "Lump sum becomes", value: "$40,387.39", note: "10000 x 4.038739" },
        { label: "Contributions become", value: "$260,463.33", note: "500 x ((4.038739 - 1) / 0.00583333)" },
        { label: "Total", value: "$300,850.72", note: "40387.39 + 260463.33" },
        { label: "Total paid in", value: "$130,000.00", note: "10000 + (500 x 240)" },
        { label: "Growth", value: "$170,850.72", note: "300850.72 - 130000" },
      ],
      conclusion:
        "The $10,000 lump sum becomes $40,387 — but the $120,000 of monthly contributions becomes $260,463, more than six times the original lump sum's result. The rate was identical throughout. The difference is entirely the number of dollars exposed to it, which is why the contribution amount matters more than the entry timing for most people.",
    },
    mistakes: [
      {
        title: "Dividing an annual rate by twelve and calling it the monthly rate",
        body: "That is an approximation that slightly overstates growth. The correct periodic rate is the one that compounds to the annual figure, which is marginally lower than the simple division.",
      },
      {
        title: "Ignoring fees",
        body: "An annual expense ratio is subtracted from the return every year, and over twenty years it compounds against you. A one-percentage-point fee on this example costs far more than one percentage point of the final balance.",
      },
      {
        title: "Treating the projected balance as a promise",
        body: "The formula requires the same return every year. Actual returns vary, and the number it produces is a scenario rather than a forecast.",
      },
    ],
  },

  "investment-property-calculator": {
    intro:
      "A rental property is valued two ways at once: as a business, which is the cap rate, and as a leveraged purchase, which is the cash-on-cash return. The second is always the more flattering number, because it divides a return by the cash you put in rather than by what you bought.",
    mechanics: [
      {
        title: "Net operating income, before financing",
        body: "NOI is rent collected minus operating expenses — tax, insurance, maintenance, management and vacancy — and deliberately ignores the mortgage. That is what makes it comparable between properties bought with different loans: $30,000 of rent against $6,000 of expenses gives $24,000 of NOI regardless of how it was financed.",
      },
      {
        title: "Cap rate is price, not performance",
        body: "Cap rate is NOI divided by price: $24,000 on $300,000 is 8.00%. It tells you what the property yields unlevered, and it is the number to use when comparing two properties in different markets. Note that it says nothing about your return, because it ignores your loan entirely.",
      },
      {
        title: "Cash-on-cash is the leveraged version",
        body: "Subtract the annual debt service from NOI, then divide by the cash you invested. $24,000 minus $17,963.17 of debt service leaves $6,036.83, which against a $75,000 down payment is 8.05%. Leverage raises the percentage and also raises the risk, because the debt service is owed whether or not the unit is occupied.",
      },
    ],
    example: {
      title: "Worked example: $300,000 property, $225,000 loan",
      setup:
        "Gross rent $30,000 a year, operating expenses $6,000. Purchase price $300,000 with a $75,000 down payment, so the loan is $225,000 at an assumed 7% over 30 years.",
      rows: [
        { label: "Net operating income", value: "$24,000.00", note: "30000 - 6000" },
        { label: "Cap rate", value: "8.00%", note: "24000 / 300000" },
        { label: "Annual debt service", value: "$17,963.17", note: "225000 at 7% over 360 months, x 12" },
        { label: "Annual cash flow", value: "$6,036.83", note: "24000 - 17963.17" },
        { label: "Cash-on-cash return", value: "8.05%", note: "6036.83 / 75000" },
        { label: "Vacancy of one month a year would cost", value: "$2,500.00", note: "30000 / 12 — straight off cash flow" },
      ],
      conclusion:
        "The property yields 8.00% unlevered and 8.05% on the cash invested — nearly identical here, which is unusual and worth noticing: leverage amplifies a return above the borrowing cost and shrinks one below it. More important is the last row: a single vacant month costs $2,500, which is 41% of the annual cash flow, and cash flow is the line that has to absorb every surprise.",
    },
    mistakes: [
      {
        title: "Dividing NOI by your down payment",
        body: "That mixes the two measures. Cap rate uses price; cash-on-cash uses cash invested. Dividing NOI by the down payment overstates the return by the leverage ratio.",
      },
      {
        title: "Dropping vacancy and maintenance from expenses",
        body: "A property is not occupied every month and does not go unrepaired. Both are real recurring costs, and excluding them flatters NOI and the cap rate together.",
      },
      {
        title: "Assuming the loan payment is the only fixed cost",
        body: "Debt service is fixed, but taxes and insurance are not. A reassessment or a premium increase reduces cash flow directly, with no corresponding increase in rent.",
      },
    ],
  },

  "how-long-will-my-money-last-calculator": {
    intro:
      "The question is not how large the portfolio is — it is how long a given withdrawal can be sustained. A withdrawal rate above the return shrinks the balance in real terms every year, and the arithmetic is unforgiving about how quickly.",
    mechanics: [
      {
        title: "A draw above the return shortens everything",
        body: "If the portfolio earns 5% and you withdraw 8%, the balance falls every year even in a good year. The years-to-depletion figure is where the balance reaches zero, and it is calculated by treating the withdrawals as an annuity in reverse: -ln(1 - (P x r) / W) / ln(1 + r).",
      },
      {
        title: "The withdrawal rate matters more than the return",
        body: "On $500,000 with $40,000 withdrawn — an 8% draw — the money lasts 20.1 years at a 5% return. Drop the return to zero and it lasts 12.5 years. That contrast is the point: the draw sets the clock, and the return only adjusts it.",
      },
      {
        title: "Why the answer is not a date to rely on",
        body: "The formula assumes a constant return and a constant withdrawal. Real returns vary, inflation raises the withdrawal in nominal terms, and a bad sequence early permanently reduces the base. The figure is a sensitivity test, not a schedule — its value is in showing which direction the levers move, not in predicting the year.",
      },
    ],
    example: {
      title: "Worked example: $500,000, 5% return, $40,000 withdrawn a year",
      setup:
        "Starting balance $500,000. Assumed annual return 5%. Annual withdrawal $40,000, taken at the end of each year, held constant in nominal terms.",
      rows: [
        { label: "Withdrawal as a share of the portfolio", value: "8.0%", note: "40000 / 500000" },
        { label: "Years until depleted", value: "20.1", note: "-ln(1 - 25000 / 40000) / ln(1.05)" },
        { label: "Years until depleted at 0% return", value: "12.5", note: "500000 / 40000" },
        { label: "Effect of the 5% return", value: "7.6 extra years", note: "20.1 - 12.5" },
      ],
      conclusion:
        "An 8% withdrawal lasts about twenty years at a 5% return and twelve and a half with no return at all — so the return buys roughly eight extra years, while the draw rate sets the baseline. Reduce the withdrawal to 5% and the same portfolio supports a much longer horizon; that lever moves the answer further than any plausible difference in return.",
    },
    mistakes: [
      {
        title: "Ignoring inflation on the withdrawal",
        body: "A $40,000 withdrawal held flat loses purchasing power every year. If the intention is to maintain a lifestyle, the withdrawal has to rise, and that shortens the horizon materially.",
      },
      {
        title: "Reading the depletion year as a prediction",
        body: "It assumes a constant return every year. Real returns vary, and poor early years shorten the actual horizon well below the calculated one.",
      },
      {
        title: "Assuming spending falls automatically in retirement",
        body: "Some categories do fall and healthcare often rises. Assuming a decline without deciding which spending is actually going away produces an optimistic number.",
      },
    ],
  },

  "life-insurance-needs-calculator": {
    intro:
      "The useful question is not how much cover costs — it is what would need to be replaced. That quantity is the sum of a few specific obligations, and it is usually larger than people estimate and smaller than insurers suggest.",
    mechanics: [
      {
        title: "The DIME components",
        body: "Debt, Income, Mortgage and Education. Add outstanding debts, a multiple of annual income to replace the earning years, the remaining mortgage balance, and any expected education costs. Each is a separate decision, which is what makes the method auditable — you can see which assumption is driving the total.",
      },
      {
        title: "Then subtract what already exists",
        body: "Existing savings, investments, retirement balances and any employer-provided group cover reduce the gap. Group cover is easy to overlook and frequently insufficient on its own, but it is real and it belongs in the subtraction.",
      },
      {
        title: "Term is the mechanism, not a product pitch",
        body: "Cover needs are usually highest during working years and fall as debts are repaid and assets accumulate. Term insurance matches the coverage period to the obligation, which is why it prices so far below permanent products — you are buying protection, not an investment.",
      },
    ],
    example: {
      title: "Worked example: the DIME method",
      setup:
        "Debts $25,000. Annual income $60,000 replaced over 10 years. Remaining mortgage $280,000. Expected education costs $100,000. Existing assets $150,000.",
      rows: [
        { label: "Debt", value: "$25,000.00", note: "credit cards, loans, final expenses" },
        { label: "Income replacement", value: "$600,000.00", note: "60000 x 10 years" },
        { label: "Mortgage", value: "$280,000.00", note: "remaining balance" },
        { label: "Education", value: "$100,000.00", note: "assumed" },
        { label: "Total need", value: "$1,005,000.00", note: "25000 + 600000 + 280000 + 100000" },
        { label: "Less existing assets", value: "$150,000.00", note: "savings, investments, group cover" },
        { label: "Cover required", value: "$855,000.00", note: "1005000 - 150000" },
      ],
      conclusion:
        "The total is $1,005,000 and the gap is $855,000 — and the income-replacement assumption is 60% of it. That single input deserves the most scrutiny, because changing ten years to five cuts the requirement by $300,000. The method's value is that it makes the dominant assumption visible rather than burying it in a generic multiple.",
    },
    mistakes: [
      {
        title: "Using a blanket multiple of income",
        body: "A crude multiple ignores debts, the mortgage and existing assets, which is the bulk of the calculation. It is a starting point, not an answer.",
      },
      {
        title: "Ignoring group cover you already have",
        body: "Employer-provided coverage reduces the gap. Omitting it overstates the need; relying on it alone ignores that it usually ends with the job.",
      },
      {
        title: "Buying cover to cover a lifestyle rather than an obligation",
        body: "The need falls as debts are repaid and assets build. Cover sized to a permanent standard of living costs more than the obligation it insures.",
      },
    ],
  },

  "budget-calculator": {
    intro:
      "A budget is a set of proportions, and proportions are easier to keep than amounts. The 50/30/20 split gives each category a target that moves with income instead of a fixed number that has to be renegotiated every time pay changes.",
    mechanics: [
      {
        title: "The three buckets",
        body: "Needs take 50%: housing, utilities, food, transport, insurance, minimum debt payments. Wants take 30%: everything discretionary. Savings and extra debt repayment take 20%. On $5,000 a month that is $2,500, $1,500 and $1,000 — and the percentages hold at any income, which is the point.",
      },
      {
        title: "Fifty percent is the constraint that bites",
        body: "Housing alone commonly consumes 30% of gross for a household, so the needs bucket is where the plan fails first. If needs exceed 50%, the fix is a housing or transport decision rather than a stricter approach to groceries.",
      },
      {
        title: "Twenty percent is a floor, not a target",
        body: "Fifteen percent saved over a working life is materially different from twenty-five. At $1,000 a month the annual saving is $12,000, and what that becomes depends entirely on how long it is invested — which is the argument for treating the savings bucket as the one that does not flex.",
      },
    ],
    example: {
      title: "Worked example: $5,000 a month",
      setup:
        "Monthly take-home $5,000, split 50/30/20. The percentages apply to take-home, not gross, because that is the money available to allocate.",
      rows: [
        { label: "Needs at 50%", value: "$2,500.00", note: "5000 x 0.50" },
        { label: "Wants at 30%", value: "$1,500.00", note: "5000 x 0.30" },
        { label: "Savings and extra debt at 20%", value: "$1,000.00", note: "5000 x 0.20" },
        { label: "Saved over a year", value: "$12,000.00", note: "1000 x 12" },
        { label: "If the savings share were 10%", value: "$6,000.00", note: "500 x 12 — half as much" },
      ],
      conclusion:
        "The split produces a $12,000 annual saving on a $60,000 take-home. Ten percentage points on the savings bucket is $6,000 a year, which is the whole argument for fixing that share first and letting the discretionary bucket absorb the variation instead. Notice also that the framework says nothing about which specific purchases are allowed — it only bounds the totals.",
    },
    mistakes: [
      {
        title: "Applying the percentages to gross pay",
        body: "The buckets allocate money you actually have. Applying them to gross overstates every category and makes the savings target unreachable.",
      },
      {
        title: "Counting minimum debt payments as savings",
        body: "Minimum payments on a credit card sit in needs, because they are not optional. Only the amount above the minimum belongs in the savings bucket.",
      },
      {
        title: "Treating the split as a rule rather than a starting point",
        body: "A household with high rent or medical costs will not fit 50/30/20 immediately. The value is in seeing which bucket is out of line, not in forcing the ratio.",
      },
    ],
  },

  "car-affordability-calculator": {
    intro:
      "Affordability is not what a lender will approve — it is what a car can cost without crowding out everything else. The 20/4/10 guideline exists because it caps the three things that actually cause trouble: the down payment, the term and the share of income.",
    mechanics: [
      {
        title: "The three constraints",
        body: "Twenty percent down, a term of four years, and total transport costs under 10% of gross monthly income. Each addresses a specific failure: no down payment means being underwater immediately, a long term means owing more than the car is worth for years, and a high income share means one repair becomes a crisis.",
      },
      {
        title: "Why the term limit matters more than it sounds",
        body: "A car depreciates fastest in its first years. Financing it over six or seven years means spending a large part of the loan term owing more than the vehicle is worth, which is only a problem until you need to sell it or it is written off. At that point the gap has to be paid in cash.",
      },
      {
        title: "The 10% is a ceiling on everything",
        body: "Payment, insurance, fuel and maintenance together — not the payment alone. On a $5,000 monthly income the whole transport budget is $500, and a $500 payment leaves nothing for the rest, which is why the guideline is stricter than it first appears.",
      },
    ],
    example: {
      title: "Worked example: $60,000 income against the 20/4/10 rule",
      setup:
        "Gross income $60,000 a year, so $5,000 a month. Payment capped at 10% of monthly income, term capped at 48 months, down payment of at least 20%. Loan rate assumed at 7%.",
      rows: [
        { label: "Monthly income", value: "$5,000.00", note: "60000 / 12" },
        { label: "Maximum payment at 10%", value: "$500.00", note: "5000 x 0.10" },
        { label: "Loan supported over 48 months", value: "$20,880.10", note: "500 x 41.7602, the 48-month annuity factor" },
        { label: "Car price with 20% down", value: "$26,100.13", note: "20880.10 / 0.80" },
        { label: "Loan a 72-month term would support", value: "$29,327.22", note: "500 x 58.6544 — the same payment, a longer debt" },
        { label: "Car price on the 72-month term", value: "$36,659.03", note: "29327.22 / 0.80" },
      ],
      conclusion:
        "The rule puts the ceiling at about $26,100, of which $5,220 is the down payment and $20,880 is financed over four years. Stretching to 72 months raises the affordable price from $26,100.13 to $36,659.03 for an unchanged monthly payment — that extra $10,558.90 of car is bought with two more years of debt on an asset that is still depreciating. This is the trade the rule exists to make visible.",
    },
    mistakes: [
      {
        title: "Budgeting the payment and not the running costs",
        body: "Insurance, fuel, tyres and maintenance are part of the 10%. A payment set at the full 10% leaves nothing for any of them.",
      },
      {
        title: "Treating lender approval as affordability",
        body: "Approval reflects a credit assessment, not your other obligations. The maximum a lender will advance is not the maximum you should borrow.",
      },
      {
        title: "Extending the term to reach a nicer car",
        body: "A longer term lowers the payment and raises both the total interest and the period during which the loan exceeds the car's value. The car is the variable that should move.",
      },
    ],
  },

  "salary-raise-calculator": {
    intro:
      "A raise has three different values and only one of them is on the letter: the gross increase, the net increase after tax, and the real increase once inflation is subtracted. The third is the one that changes what you can actually buy.",
    mechanics: [
      {
        title: "Gross, then net, then real",
        body: "The percentage raise is the new salary divided by the old one, minus one. The net increase is smaller because the extra income lands in your highest tax band. The real increase subtracts inflation, and it is the only one that describes a change in purchasing power.",
      },
      {
        title: "Real terms is a division, not a subtraction",
        body: "A 5% raise against 3% inflation is not a 2% gain. Real growth is 1.05 / 1.03 - 1, which is 1.94% — close to the subtraction here, but the gap widens as the numbers grow, and using subtraction on large rates gives a materially wrong answer.",
      },
      {
        title: "Inflation is a backward-looking figure",
        body: "The inflation rate used to deflate a raise is measured over the past twelve months. What matters for the coming year is unknown, which is why a raise that matches inflation in the year it is granted can still lose ground by the time the next one arrives.",
      },
    ],
    example: {
      title: "Worked example: $60,000 raised to $63,000",
      setup:
        "Previous salary $60,000, new salary $63,000. Assumed inflation of 3% over the same period, used only to express the raise in real terms.",
      rows: [
        { label: "Gross increase", value: "$3,000.00", note: "63000 - 60000" },
        { label: "Percentage raise", value: "5.00%", note: "3000 / 60000" },
        { label: "Increase per month", value: "$250.00", note: "3000 / 12" },
        { label: "Real increase at 3% inflation", value: "1.94%", note: "1.05 / 1.03 - 1" },
        { label: "The wrong way to compute it", value: "2.00%", note: "5% - 3%, a subtraction that drifts as rates grow" },
      ],
      conclusion:
        "A 5% raise against 3% inflation is a 1.94% real increase, not 2%. That is roughly $1,164 of additional purchasing power a year rather than the $3,000 the letter states — the difference is tax and inflation, and both are unavoidable. The subtraction shortcut happens to be close here but diverges as the rates involved get larger.",
    },
    mistakes: [
      {
        title: "Spending the gross increase",
        body: "The net increase is smaller whenever the raise lands in a higher band. Committing the full gross figure to a new recurring cost is how a raise makes a household worse off.",
      },
      {
        title: "Subtracting inflation from the raise",
        body: "Real growth is a ratio. Subtraction is an approximation that works at small percentages and misleads at large ones.",
      },
      {
        title: "Comparing raises without comparing total compensation",
        body: "A higher salary with a worse retirement match, higher premiums or a lost bonus can be a net reduction. Compare total value, not base salary.",
      },
    ],
  },

  "salary-to-hourly-calculator": {
    intro:
      "Converting a salary to an hourly figure requires one assumption — how many hours a year you work — and the standard answer of 2,080 hides the fact that it counts only paid hours.",
    mechanics: [
      {
        title: "The standard divisor is 2,080",
        body: "Forty hours a week for fifty-two weeks is 2,080 hours. Dividing $60,000 by 2,080 gives $28.85 an hour. The arithmetic is trivial; the number it depends on is the assumption worth examining.",
      },
      {
        title: "Unpaid hours are excluded, and they are not small",
        body: "The divisor counts paid hours only. A salaried role that regularly runs to fifty hours still divides the same salary by 2,080, so the true hourly rate is lower. Fifty hours a week is 2,600 hours a year, and $60,000 over 2,600 hours is $23.08 — a difference of nearly 20%.",
      },
      {
        title: "What the salaried figure buys that the hourly one does not",
        body: "Paid leave, holidays, employer contributions and paid overtime are all inside a salary and outside a raw hourly comparison. A contractor charging $28.85 has to fund leave, downtime and self-employment tax out of it, so the two rates are not equivalent even when the arithmetic matches.",
      },
    ],
    example: {
      title: "Worked example: $60,000 a year",
      setup:
        "Salary $60,000. Standard full-time year of 40 hours a week over 52 weeks, which is 2,080 paid hours. A second figure is shown at 50 hours a week, which is 2,600 hours.",
      rows: [
        { label: "Hours in a full-time year", value: "2,080", note: "40 x 52" },
        { label: "Hourly rate at 2,080 hours", value: "$28.85", note: "60000 / 2080" },
        { label: "Hours at 50 a week", value: "2,600", note: "50 x 52" },
        { label: "True hourly rate at 50 hours a week", value: "$23.08", note: "60000 / 2600" },
        { label: "Effective reduction", value: "20.0%", note: "1 - (23.08 / 28.85) — the rate falls by a fifth" },
      ],
      conclusion:
        "The headline conversion is $28.85 an hour, but that only holds if the year really contains 2,080 hours worked. At fifty hours a week the same salary is worth $23.08 an hour — a fifth less — and nothing in the pay slip reflects it. This is the most useful thing the conversion reveals, and it requires knowing your actual hours rather than your contracted ones.",
    },
    mistakes: [
      {
        title: "Using 2,080 hours when you work more",
        body: "The standard divisor assumes 40-hour weeks. Regular unpaid overtime means the real rate is lower, and the gap is usually larger than any raise the role is likely to produce.",
      },
      {
        title: "Comparing a salaried rate to a contractor rate",
        body: "A contractor funds their own leave, downtime, equipment and self-employment tax. The equivalent hourly rate for the same net position is meaningfully higher than the salaried conversion.",
      },
      {
        title: "Subtracting unpaid leave incorrectly",
        body: "If you take unpaid time off, the divisor falls and the hourly rate rises. Dividing a reduced salary by a full 2,080 understates the rate for the time actually worked.",
      },
    ],
  },

  "hourly-to-salary-calculator": {
    intro:
      "Multiplying an hourly rate by 2,080 is the standard conversion, and it quietly assumes you are paid for every week of the year. Part-time, seasonal and unpaid-leave situations all break that assumption in the direction that flatters the annual figure.",
    mechanics: [
      {
        title: "The multiplication and its assumption",
        body: "$28.85 an hour over 2,080 hours is $60,008 — the standard full-time year. The 2,080 is 40 hours across 52 weeks, so it includes paid holidays and paid leave as though they were hours worked, which is correct only when they are paid.",
      },
      {
        title: "Adjust the weeks, not the hourly rate",
        body: "For a seasonal role, multiply by the weeks actually worked. Twenty dollars an hour for 40 weeks is $32,000, not $41,600 — a difference of almost a quarter, and one that a straight 2,080 conversion hides completely.",
      },
      {
        title: "Overtime changes the shape, not the base",
        body: "Regular overtime raises actual earnings while leaving the base rate unchanged, so an annual figure driven by overtime is not comparable to a salaried figure that never varies. Before comparing an hourly role to a salaried one, separate the base hours from the premium hours.",
      },
    ],
    example: {
      title: "Worked example: $28.85 an hour",
      setup:
        "Hourly rate $28.85. Three scenarios: a full 2,080-hour year, a 1,000-hour part-time year, and a 40-week seasonal year at 40 hours a week.",
      rows: [
        { label: "Full year at 2,080 hours", value: "$60,008.00", note: "28.85 x 2080" },
        { label: "Part-time, 1,000 hours", value: "$28,850.00", note: "28.85 x 1000" },
        { label: "Seasonal, 40 weeks x 40 hours", value: "$46,160.00", note: "28.85 x 1600" },
        { label: "Cost of assuming full-time for the seasonal role", value: "$13,848.00", note: "60008 - 46160" },
      ],
      conclusion:
        "The same hourly rate produces $60,008, $28,850 or $46,160 depending entirely on how many hours the year actually contains. Converting a seasonal or part-time rate by the standard 2,080 overstates the annual figure by $13,848 in the seasonal case — nearly a quarter more than the role pays. The hourly rate is the reliable input; the hours are the assumption.",
    },
    mistakes: [
      {
        title: "Applying 2,080 to a part-time or seasonal role",
        body: "The 2,080 figure assumes forty hours across every week of the year. Using it for anything else inflates the annual amount, sometimes by a quarter or more.",
      },
      {
        title: "Treating overtime earnings as part of the base rate",
        body: "Overtime is paid at a premium and is not guaranteed. An annual figure that depends on it falls when the hours do, so the two components should be separated.",
      },
      {
        title: "Ignoring what the hourly role does not include",
        body: "Unpaid time off, no employer retirement contribution and no paid holidays are all costs of an hourly arrangement. The hourly rate has to cover them, which is why a like-for-like comparison with a salary needs an uplift.",
      },
    ],
  },

  "salary-percentile-calculator": {
    intro:
      "A percentile describes a position in a distribution, not a proportion of it. Being at the 90th percentile does not mean earning 90% of something — it means 90% of the comparison group earns less than you do.",
    mechanics: [
      {
        title: "A percentile is a rank, expressed as a share",
        body: "If 10,000 people out of a comparison group of 100,000 earn less than you, you are at the 90th percentile. The figure is about where you sit in an ordered list, which means it depends entirely on the group you are compared against — the same salary can be the 80th percentile nationally and the 40th percentile in a specific occupation.",
      },
      {
        title: "Median and mean answer different questions",
        body: "The median is the middle value, so half the group sits either side of it, and it is the number a percentile tells you about. The mean is the total divided by the count, and a small number of very high earners pulls it up. In a skewed distribution the mean is well above the median, which is why reported averages are higher than most people's experience.",
      },
      {
        title: "Percentiles hide the spread around them",
        body: "Two groups can share an identical median and have completely different distributions. A percentile with no measure of spread around it tells you your position relative to one point, and nothing about how much room the group has above or below.",
      },
    ],
    example: {
      title: "Worked example: why the mean sits above the median",
      setup:
        "An illustrative group of five salaries, chosen to show the skew rather than to represent any real market: $20,000, $30,000, $40,000, $50,000 and $360,000.",
      rows: [
        { label: "Ordered values", value: "20k, 30k, 40k, 50k, 360k", note: "the group" },
        { label: "Median (middle value)", value: "$40,000.00", note: "half the group is below it" },
        { label: "Sum", value: "$500,000.00", note: "20000 + 30000 + 40000 + 50000 + 360000" },
        { label: "Mean", value: "$100,000.00", note: "500000 / 5" },
        { label: "Gap between mean and median", value: "$60,000.00", note: "100000 - 40000" },
      ],
      conclusion:
        "The median is $40,000 and the mean is $100,000 — two and a half times higher, from a group where four of the five earn $50,000 or less. That gap is why a quoted average salary so often feels wrong: it is real, but it is being pulled by a value most of the group is nowhere near. When a figure is described as average, the first useful question is which one.",
    },
    mistakes: [
      {
        title: "Reading a percentile as a percentage of income",
        body: "The 90th percentile is a rank, not 90% of a total. It means 90% of the comparison group earns less, which is a statement about position rather than amount.",
      },
      {
        title: "Comparing against the wrong group",
        body: "A national percentile and an occupational percentile are different measurements. The same salary can look strong in one and weak in the other, and neither is wrong.",
      },
      {
        title: "Treating a median as a target",
        body: "Half the group earns less than the median by definition. It describes a distribution, not a standard for any individual in it.",
      },
    ],
  },

  "stock-profit-calculator": {
    intro:
      "Profit on a share trade is the difference between two prices multiplied by a share count — and the share count is what separates a percentage from an amount of money. A large return on a small position is still a small amount.",
    mechanics: [
      {
        title: "Position size multiplies everything",
        body: "The gain per share is the sale price minus the purchase price. Multiply by the number of shares and you have the profit; divide by the cost and you have the return. A 24% return on $5,000 is $1,200, while the same 24% on $500 is $120 — the percentage is identical and the outcomes are not comparable.",
      },
      {
        title: "Commissions are charged per trade, not per share",
        body: "This is what makes frequent trading expensive and buy-and-hold cheap. A flat $10 each way is negligible on a $5,000 position and substantial on a $500 one, where it consumes a visible share of the gain. Small positions traded often can lose to costs even when the price went the right way.",
      },
      {
        title: "Realised against unrealised",
        body: "Profit is not realised until the position is sold. An unrealised gain on paper is not money, it is a valuation, and it can disappear before the sale. This calculator measures a completed trade, which is the only version of the figure that cannot move.",
      },
    ],
    example: {
      title: "Worked example: 100 shares bought at $50, sold at $62",
      setup:
        "100 shares purchased at $50 and sold at $62. Commission assumed at $10 on each side, which is an assumption and not a quote.",
      rows: [
        { label: "Cost of the position", value: "$5,000.00", note: "100 x 50" },
        { label: "Proceeds", value: "$6,200.00", note: "100 x 62" },
        { label: "Profit before costs", value: "$1,200.00", note: "6200 - 5000" },
        { label: "Return before costs", value: "24.00%", note: "1200 / 5000" },
        { label: "Profit after $10 each way", value: "$1,180.00", note: "1200 - 20" },
        { label: "Return after costs", value: "23.60%", note: "1180 / 5000" },
      ],
      conclusion:
        "A $12 move on a $50 stock is a 24.00% return, or $1,200 on this position. Commissions take $20 of it, which is 0.40 of a percentage point here — modest, but the same $20 on a $500 position would be four percentage points, enough to turn a winning trade into a losing one. Costs are a function of trade count, not of how well the trade went.",
    },
    mistakes: [
      {
        title: "Reading the percentage and not the amount",
        body: "A large percentage on a small position is a small amount of money. Sizing determines the actual result; the percentage only describes the price move.",
      },
      {
        title: "Ignoring commissions on small or frequent trades",
        body: "A flat fee per trade is a larger share of a small position. Frequent trading multiplies the number of flat fees, so the drag scales with activity rather than with the size of the win.",
      },
      {
        title: "Counting an unrealised gain as profit",
        body: "Until the sale completes, the gain is a valuation that can change. This calculator measures a completed trade; anything else is a paper figure.",
      },
    ],
  },

  "child-support-calculator": {
    intro:
      "Child support is calculated from a formula, and the formula is set by the state hearing the case. Most follow a version of the income-shares model, which means two numbers matter far more than any others: combined income, and the share each parent contributes to it.",
    mechanics: [
      {
        title: "The income-shares model",
        body: "The parents' incomes are combined, a basic obligation is read from a schedule for that combined income and the number of children, and that obligation is then split in proportion to each parent's share of the combined income. If one parent earns 60% of the combined total, they carry 60% of the obligation.",
      },
      {
        title: "It is not a fixed percentage of one parent's pay",
        body: "A common misconception is that support is a flat share of the payer's income. Under income shares it depends on both incomes: the same paying parent with the same salary owes different amounts depending on what the other parent earns, because the split changes.",
      },
      {
        title: "Add-ons and adjustments sit on top",
        body: "Childcare, health insurance premiums and extraordinary medical costs are usually allocated on the same income-share basis, while parenting time can adjust the result. That is why a calculation from income alone commonly differs from the final order.",
      },
    ],
    example: {
      title: "Worked example: a hypothetical income-shares calculation",
      setup:
        "Combined monthly income $8,000, split 60/40 between the parents. The basic obligation is taken as a hypothetical $1,200 a month from an illustrative schedule. These figures demonstrate the mechanism and are not a real support schedule — actual amounts come from the state schedule and the court.",
      rows: [
        { label: "Combined monthly income", value: "$8,000.00", note: "assumed" },
        { label: "Basic obligation", value: "$1,200.00", note: "hypothetical schedule figure" },
        { label: "Higher earner's share at 60%", value: "$720.00", note: "1200 x 0.60" },
        { label: "Other parent's share at 40%", value: "$480.00", note: "1200 x 0.40" },
        { label: "If the other parent earned more, the split would reverse", value: "$480.00", note: "the higher earner would owe this instead" },
      ],
      conclusion:
        "The obligation is $1,200 and the split follows the incomes, so $720 falls to the higher earner. Note the last row: changing which parent earns more changes who pays, without changing the total obligation at all. That dependence on both incomes is the part of this calculation most often misunderstood.",
    },
    mistakes: [
      {
        title: "Assuming a fixed percentage of the payer's income",
        body: "That describes a different model. Under income shares the obligation depends on the combined income and the split, so the other parent's earnings change the answer.",
      },
      {
        title: "Using gross income as the basis",
        body: "Schedules generally work from income after specified deductions, and the deductions vary by state. Using gross overstates the obligation.",
      },
      {
        title: "Treating this as an estimate of a court order",
        body: "Add-ons for childcare, health cover and medical costs, plus any parenting-time adjustment, sit outside the basic calculation. A real order includes them and is issued by a court, not a calculator.",
      },
    ],
  },

  "mileage-reimbursement-calculator": {
    intro:
      "Mileage reimbursement is a rate multiplied by a distance, and the rate is the part that changes. It is set annually, so a figure that was correct last year is not evidence of what this year pays.",
    mechanics: [
      {
        title: "Distance times rate",
        body: "The arithmetic is one multiplication: 350 miles at an assumed 67 cents is $234.50. What matters is which rate applies, because there is often more than one — a standard business rate and a lower rate for moving or medical purposes in the same year.",
      },
      {
        title: "The rate is set annually and is not a cost estimate",
        body: "The standard rate is published for each tax year and is intended to approximate the fixed and variable costs of operating a vehicle. Because it is revised, a figure quoted from memory is likely to be out of date — check the current year's published rate rather than assuming last year's.",
      },
      {
        title: "Reimbursement and deduction are different things",
        body: "An employer reimbursing at a set rate is settling an expense under a policy. Claiming a deduction on a tax return is a separate exercise with its own rules and, in some cases, a different rate. A reimbursement under an accountable plan is not taxable income, which is a distinction worth confirming rather than assuming.",
      },
    ],
    example: {
      title: "Worked example: 350 business miles",
      setup:
        "Distance 350 miles. Rate taken as an assumed 67 cents a mile, used to demonstrate the arithmetic. The actual figure is set annually — confirm the current rate rather than reusing this one.",
      rows: [
        { label: "Miles driven", value: "350", note: "business use" },
        { label: "Rate assumed", value: "$0.67", note: "illustrative — the rate is revised each year" },
        { label: "Reimbursement", value: "$234.50", note: "350 x 0.67" },
        { label: "1,000 miles at the same rate", value: "$670.00", note: "1000 x 0.67" },
        { label: "Cost of using a stale rate", value: "varies", note: "the error scales with distance, not with the rate" },
      ],
      conclusion:
        "Three hundred and fifty miles claims $234.50 at 67 cents. The rate is the only input in this calculation that goes stale, and because the multiplication is linear, a wrong rate produces a wrong answer in direct proportion to the miles driven — which means the largest claims carry the largest error. Verify the rate for the year of the expense.",
    },
    mistakes: [
      {
        title: "Using last year's rate",
        body: "The rate is set annually and changes. Because the calculation is a single multiplication, any rate error passes straight into the claim.",
      },
      {
        title: "Recording commuting miles",
        body: "Ordinary commuting is generally not reimbursable or deductible. Counting it inflates the claim and can invalidate it.",
      },
      {
        title: "Assuming the rate equals your actual cost",
        body: "The published figure approximates operating costs across a broad range of vehicles. A large or inefficient vehicle may genuinely cost more per mile, and a small efficient one less — reimbursement is a policy rate, not a measurement.",
      },
    ],
  },

  "discount-calculator": {
    intro:
      "Two discounts in a row do not add up. Thirty percent off followed by another twenty percent off is not fifty percent off, and the difference is large enough to change what a purchase is worth.",
    mechanics: [
      {
        title: "Each discount applies to the reduced price",
        body: "The second discount is calculated on what is left after the first, not on the original price. Take 30% off $100 to get $70, then 20% off that $70 to get $56. The total reduction is $44, which is 44% — not the 50% the two figures seem to promise.",
      },
      {
        title: "Stacking is multiplicative, not additive",
        body: "The combined effect is 1 - (1 - d1)(1 - d2). Two 20% discounts combine to 36%, not 40%. Three 20% discounts combine to 48.8%. Each additional discount acts on a smaller base, so the sequence converges towards 100% without ever reaching it.",
      },
      {
        title: "Order does not matter, the sequence does",
        body: "Applying 30% then 20% gives the same result as 20% then 30%, because multiplication is commutative. What does matter is the number of steps: the more times a percentage is taken off a shrunk base, the further the total falls short of the sum of the percentages.",
      },
    ],
    example: {
      title: "Worked example: 30% off, then a further 20% off $100",
      setup:
        "Original price $100. A 30% discount followed by a separate 20% discount applied to the reduced price.",
      rows: [
        { label: "After 30% off", value: "$70.00", note: "100 x 0.70" },
        { label: "After a further 20% off", value: "$56.00", note: "70 x 0.80" },
        { label: "Total discount", value: "$44.00", note: "100 - 56" },
        { label: "As a percentage", value: "44%", note: "1 - (0.70 x 0.80)" },
        { label: "If the discounts simply added", value: "50%", note: "30 + 20 — the wrong answer, worth $6 here" },
      ],
      conclusion:
        "The two discounts reduce the price by $44, not $50. The $6 gap comes entirely from the second discount being applied to $70 rather than to $100, and it grows quickly: three successive 20% discounts save 48.8% rather than the 60% the figures suggest. When a retailer stacks percentages, the total is always less than the sum.",
    },
    mistakes: [
      {
        title: "Adding two percentages together",
        body: "30% and 20% do not make 50%. The second applies to the reduced price, so the true combined figure is 44%.",
      },
      {
        title: "Assuming order changes the result",
        body: "Applying 20% then 30% gives the same $56. Multiplication is commutative, so the sequence is irrelevant — only the number of steps matters.",
      },
      {
        title: "Comparing a stacked discount to a single one on the face value",
        body: "A single 44% off and two stacked discounts of 30% and 20% produce the same price, but two stacked 25% discounts produce 43.75%, not 50%. Compare final prices, not the advertised percentages.",
      },
    ],
  },
};
