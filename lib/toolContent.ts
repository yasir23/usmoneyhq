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
};
