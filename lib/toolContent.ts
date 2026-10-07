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

  "gas-cost-calculator": {
    intro:
      "The cost of a drive is one division and one multiplication, and almost everyone does it in the wrong order — estimating gallons from a price rather than from the distance the car actually has to cover.",
    mechanics: [
      {
        title: "Distance, then efficiency, then price",
        body: "Divide the distance by the car's miles per gallon to get gallons burned, then multiply by the price per gallon. Doing it the other way — dividing the price by mpg — gives a figure with the wrong units that happens to look plausible at some prices, which is why the error survives.",
      },
      {
        title: "Cost per mile is the number that transfers",
        body: "Price divided by mpg gives a cost per mile. At $3.50 a gallon and 30 mpg that is $0.1167, and it is the figure worth memorising, because it prices any trip without redoing the arithmetic. A car at 20 mpg costs $0.175 a mile on the same fuel — half again as much for the same journey.",
      },
      {
        title: "What the estimate excludes",
        body: "Fuel is the variable cost. Tolls, parking and the per-mile share of tyres, servicing and depreciation are all real, and depreciation dominates the true cost of driving for most vehicles. This calculator prices the fuel, which is the out-of-pocket part, not the whole cost of the trip.",
      },
    ],
    example: {
      title: "Worked example: 350 miles at 30 mpg with fuel at $3.50",
      setup:
        "Distance 350 miles. Efficiency 30 miles per gallon. Fuel price $3.50 a gallon, which is an assumed figure — prices vary by location and week.",
      rows: [
        { label: "Gallons burned", value: "11.667 gal", note: "350 / 30" },
        { label: "Cost one way", value: "$40.83", note: "11.667 x 3.50" },
        { label: "Cost round trip", value: "$81.67", note: "40.83 x 2" },
        { label: "Cost per mile", value: "$0.1167", note: "3.50 / 30" },
        { label: "The same trip at 20 mpg", value: "$61.25", note: "350 / 20 x 3.50 — half again as much" },
      ],
      conclusion:
        "The trip burns 11.667 gallons and costs $40.83 each way. The last row is the one worth noticing: dropping from 30 mpg to 20 mpg raises the fuel cost by 50% for an identical journey, with nothing changing but the vehicle. Efficiency moves this number more than fuel price does over any realistic range of prices.",
    },
    mistakes: [
      {
        title: "Dividing the price by the mpg",
        body: "That produces a number with no meaningful units. The order is distance divided by efficiency to get gallons, then gallons multiplied by price.",
      },
      {
        title: "Using the highway figure for a city trip",
        body: "Rated efficiency assumes a mix of conditions. Stop-start traffic reduces it substantially, and the rated figure is the optimistic end of the range.",
      },
      {
        title: "Treating fuel as the whole cost of driving",
        body: "Tolls, parking, tyres and depreciation are all real costs of a trip. Fuel is the visible one and usually the smallest of them per mile.",
      },
    ],
  },

  "sod-calculator": {
    intro:
      "Sod is sold in pallets of fixed coverage, so the arithmetic is a division and a round-up — and the round-up is where the money is, because you cannot buy two thirds of a pallet and you cannot lay sod that has dried out.",
    mechanics: [
      {
        title: "Area divided by coverage per pallet",
        body: "Divide the area to be covered by the coverage one pallet provides. At 450 square feet a pallet, 2,000 square feet needs 4.44 pallets — which means 5, because pallets are not split. The fractional pallet is not waste; it is the shape of the unit.",
      },
      {
        title: "Add waste, then round again",
        body: "Cutting around curves, beds and corners produces offcuts that cannot be reused. Ten percent is a normal allowance, which takes 2,000 square feet to 2,200 — and 2,200 divided by 450 is 4.89, still 5 pallets. Note that the waste allowance did not change the order here; it changed how much of the last pallet is spare.",
      },
      {
        title: "Timing is the real constraint",
        body: "Sod is living material and begins deteriorating within about a day of delivery in warm weather. The quantity is a calculation; the schedule is a constraint. Ordering two pallets more than needed is cheap next to laying sod that has already begun to die.",
      },
    ],
    example: {
      title: "Worked example: 2,000 square feet at 450 square feet per pallet",
      setup:
        "Area to cover 2,000 square feet. Pallet coverage 450 square feet, which is the typical figure for a standard pallet and not a universal one — confirm it with the supplier.",
      rows: [
        { label: "Exact pallets needed", value: "4.44", note: "2000 / 450" },
        { label: "Pallets to order", value: "5", note: "rounded up — pallets are not sold in part" },
        { label: "With a 10% waste allowance", value: "2,200 sq ft", note: "2000 x 1.10" },
        { label: "Pallets at that area", value: "4.89", note: "2200 / 450 — still 5 pallets" },
        { label: "Spare coverage on the fifth pallet", value: "250 sq ft", note: "5 x 450 - 2000" },
      ],
      conclusion:
        "The order is 5 pallets, and the fifth leaves 250 square feet spare — more than half a pallet that will not be used. That is unavoidable rather than wasteful: the alternative is being short. Where the area is close to a whole pallet boundary, splitting the order so the final pallet arrives later is the only way to avoid paying for coverage you will not lay.",
    },
    mistakes: [
      {
        title: "Rounding the pallet count down",
        body: "Rounding 4.44 down to 4 leaves 200 square feet of lawn unlaid. The number of pallets is always rounded up, because the quantity is indivisible in the direction that matters.",
      },
      {
        title: "Assuming one pallet always covers the same area",
        body: "Pallet coverage varies by supplier and by the thickness and cut of the sod. Confirm the figure rather than using a remembered one.",
      },
      {
        title: "Ordering early to save a delivery fee",
        body: "Sod is perishable. Holding it even a day before laying, particularly in heat, damages it — which costs more than the delivery it saved.",
      },
    ],
  },

  "date-calculator": {
    intro:
      "Counting days between dates is simple until a leap year is involved, and leap years are not quite the rule most people remember. The century exceptions matter, and they are the source of nearly every disagreement about a long date span.",
    mechanics: [
      {
        title: "Leap years are divisible by 4, with two exceptions",
        body: "A year divisible by 4 is a leap year — unless it is divisible by 100, in which case it is not, unless it is also divisible by 400, in which case it is. So 2028 is a leap year, 2100 will not be, and 2000 was. The 400-year rule exists to keep the calendar aligned with the seasons over centuries, and it is why a span measured across a century boundary can be a day off from the naive count.",
      },
      {
        title: "The count excludes the start date",
        body: "The number of days between 6 October and 1 January is 87 as an exclusive count and 88 if both endpoints are included. Both are used, for different purposes — an interest accrual and a hotel stay are not the same measurement — so the convention has to be stated rather than assumed.",
      },
      {
        title: "Months are not interchangeable units",
        body: "A duration quoted in months is ambiguous without stating what a month means. Adding one month to 31 January can produce 28 February or 3 March depending on the convention. For anything where precision matters, days are the unambiguous unit.",
      },
    ],
    example: {
      title: "Worked example: 6 October 2026 to 1 January 2027",
      setup:
        "Start 6 October 2026, end 1 January 2027. The count excludes the start date, which is the standard convention for measuring an interval.",
      rows: [
        { label: "Days between", value: "87", note: "25 remaining in October + 30 + 31 + 1" },
        { label: "Weeks", value: "12.4", note: "87 / 7" },
        { label: "Days in 2027", value: "365", note: "not divisible by 4" },
        { label: "Days in 2028", value: "366", note: "2028 / 4 = 507 — a leap year" },
      ],
      conclusion:
        "Eighty-seven days, or 12.4 weeks. The leap rule is what makes a long span reliable: over the four years from 2027, the total is 1,461 days, because one of the four years contains the extra day. A span that crosses a century boundary also has to account for the 100-and-400 exception, which is the one most hand counts miss.",
    },
    mistakes: [
      {
        title: "Adding a day for every fourth year",
        body: "The century rule means a span crossing a century boundary may contain one fewer leap day than the simple rule predicts. Years divisible by 100 are not leap years unless divisible by 400.",
      },
      {
        title: "Mixing inclusive and exclusive counts",
        body: "Whether both endpoints are counted changes the total by one day. For spans of years that is trivial; for a contract or an interest calculation it is not.",
      },
      {
        title: "Treating a month as a fixed number of days",
        body: "Months range from 28 to 31 days, so a duration in months is not a precise quantity unless the convention is stated. Use days where accuracy matters.",
      },
    ],
  },

  "fence-calculator": {
    intro:
      "A fence is priced in pieces, and the pieces are not the same as the distance. Panels, posts and rails are three separate counts derived from one run length, and each one rounds differently.",
    mechanics: [
      {
        title: "Panels come from the run, rounded up",
        body: "Divide the run by the panel width. A 150-foot run at 8-foot panels is 18.75 panels, which means 19 — the last panel is trimmed to fit. Rounding down leaves a gap at the end of the fence, which is the one place the error is visible.",
      },
      {
        title: "Posts are always one more than panels",
        body: "Post count is panels plus one, because a post is needed at each end as well as between every pair of panels. That gives 20 posts for 19 panels. Getting this wrong by one is a common error, and it affects both the post order and the concrete quantity.",
      },
      {
        title: "Rails multiply by the number of panels",
        body: "Rail count is panels multiplied by rails per span — 38 at two rails, 57 at three. Three rails resist wind load and sag far better and cost roughly half again as much in rail material, so the choice is a structural one worth making deliberately rather than defaulting.",
      },
    ],
    example: {
      title: "Worked example: a 150-foot run with 8-foot panels",
      setup:
        "Run length 150 feet. Panel width 8 feet. Posts at every panel boundary including both ends. Concrete assumed at two bags per post, which is a common allowance rather than a fixed rule.",
      rows: [
        { label: "Panels", value: "19", note: "150 / 8 = 18.75, rounded up" },
        { label: "Posts", value: "20", note: "19 + 1" },
        { label: "Rails at two per span", value: "38", note: "19 x 2" },
        { label: "Rails at three per span", value: "57", note: "19 x 3" },
        { label: "Bags of concrete at two per post", value: "40", note: "20 x 2" },
      ],
      conclusion:
        "One run length produces three counts: 19 panels, 20 posts and either 38 or 57 rails. The post count is the one most often got wrong, because it is the only one that does not come from a straight division — and it is also what drives the concrete estimate, so an error there propagates into two orders rather than one.",
    },
    mistakes: [
      {
        title: "Counting posts as equal to panels",
        body: "There is a post at each end as well as between panels, so posts are always panels plus one. At 19 panels that is 20 posts, not 19.",
      },
      {
        title: "Rounding the panel count down",
        body: "The last panel is trimmed, so the count rounds up. Rounding down leaves the run short by part of a panel — visible at the end of the fence.",
      },
      {
        title: "Buying rails for the run length rather than the panel count",
        body: "Rails are cut to the span between posts, not to the total run. Ordering rails by the run length produces the wrong quantity and unusable offcuts.",
      },
    ],
  },

  "construction-cost-calculator": {
    intro:
      "Construction estimating is a per-unit price multiplied by a quantity, and the estimate is almost always wrong in the same direction. A contingency is not pessimism — it is the part of the number that accounts for the fact that the work is not yet defined.",
    mechanics: [
      {
        title: "Square footage times a rate",
        body: "A cost per square foot multiplied by the area gives the headline figure: 1,200 square feet at $150 is $180,000. The rate is the whole estimate, and it varies enormously by region, specification and finish — a rate used for a different market or a higher specification produces a number that is precise and wrong.",
      },
      {
        title: "Contingency is a percentage, not a guess",
        body: "A contingency of 10% to 20% is added on top to cover what is discovered during the work rather than designed before it. On $180,000 that is $18,000, bringing the total to $198,000, or $165 per square foot. The contingency is not padding — omitting it does not remove the extra cost, it just moves it outside the budget where it is more disruptive.",
      },
      {
        title: "Where per-square-foot estimates break down",
        body: "They work best on additions and new builds with a defined scope. They are least reliable on renovations, where the cost is driven by what is behind the wall rather than by the floor area: two identical bathrooms can differ by a factor of two once plumbing and structure are exposed.",
      },
    ],
    example: {
      title: "Worked example: 1,200 square feet at $150 per square foot",
      setup:
        "Area 1,200 square feet. Rate $150 per square foot, which is an assumed figure — regional rates vary widely and this is not a quote. Contingency taken at 10%.",
      rows: [
        { label: "Base cost", value: "$180,000.00", note: "1200 x 150" },
        { label: "Contingency at 10%", value: "$18,000.00", note: "0.10 x 180000" },
        { label: "Total with contingency", value: "$198,000.00", note: "180000 x 1.10" },
        { label: "Effective rate per square foot", value: "$165.00", note: "150 x 1.10" },
        { label: "Total at a 20% contingency", value: "$216,000.00", note: "180000 x 1.20" },
      ],
      conclusion:
        "At a 10% contingency the project is $198,000, or $165 a square foot. The gap between the 10% and 20% cases is $18,000 — which is the honest range of the estimate, not an error in it. An estimate presented as a single figure with no contingency is not more accurate; it is just missing the part that will surprise you.",
    },
    mistakes: [
      {
        title: "Using a rate from a different market or specification",
        body: "Cost per square foot is a regional and specification-specific figure. A rate quoted for a different area or a lower finish level produces a confident, precise, wrong estimate.",
      },
      {
        title: "Omitting the contingency",
        body: "The cost does not disappear when the line is removed; it arrives unplanned. A budget without a contingency is one that gets revised rather than one that comes in on target.",
      },
      {
        title: "Applying a per-square-foot figure to a renovation",
        body: "Renovation cost is driven by existing conditions — plumbing, wiring, structure — more than by area. Two identical-sized rooms can cost very differently.",
      },
    ],
  },

  "moving-cost-calculator": {
    intro:
      "Moving is priced by weight and distance on a long haul, and by hours and crew size for a local move. Those are different calculations, which is why a quote that looks comparable can be built on a completely different basis.",
    mechanics: [
      {
        title: "Long distance is weight times a rate",
        body: "For an interstate move the charge is normally based on the shipment weight and the mileage. At $0.75 a pound, 7,500 pounds is $5,625. The rate is set by the carrier, and the weight is determined by the truck's own weigh scale rather than by your estimate — which is why an inventory taken at the start matters to the final bill.",
      },
      {
        title: "Local moves are billed by the hour",
        body: "A local move is charged on the clock, including travel time to and from the job. At $150 an hour for a crew, an eight-hour day is $1,200. The variable that moves this number is not distance but how long the loading actually takes, which depends on access, stairs and how the belongings were prepared.",
      },
      {
        title: "The parts that inflate a move",
        body: "Stair and long-carry fees, packing, shuttle trucks where a full-size truck cannot reach the door, and bulky-item surcharges all sit outside the headline rate. These are the items that make a final bill differ from a quote, and they are almost always disclosed in the estimate — in the section that gets read last.",
      },
    ],
    example: {
      title: "Worked example: 7,500 pounds, 800 miles, versus a local day",
      setup:
        "Shipment 7,500 pounds. Long-distance rate assumed at $0.75 a pound. Local alternative assumed at $150 an hour for a crew over eight hours. Both rates are assumptions, not quotes.",
      rows: [
        { label: "Long distance at $0.75/lb", value: "$5,625.00", note: "7500 x 0.75" },
        { label: "Crew needed at 7,500 lb", value: "3-4 people", note: "a rule of thumb, not a rate" },
        { label: "Local at $150/hr for 8 hours", value: "$1,200.00", note: "150 x 8" },
        { label: "Difference", value: "$4,425.00", note: "5625 - 1200" },
        { label: "Long distance in lbs per dollar", value: "1.33 lb", note: "7500 / 5625" },
      ],
      conclusion:
        "The two figures are $5,625 and $1,200, and they are not alternatives for the same job — one crosses a state line and one does not. The useful part is the ratio: the long-distance move costs 4.7 times the local day, and the majority of that is distance rather than effort.",
    },
    mistakes: [
      {
        title: "Comparing a weight-based quote to an hourly one",
        body: "They measure different things. A long-distance quote scales with weight and miles; a local quote scales with hours. Comparing the totals directly compares two different jobs.",
      },
      {
        title: "Estimating your own weight",
        body: "The binding weight comes from the carrier's scale. An inventory that omits heavy items produced late in the packing process is the most common cause of a bill exceeding a quote.",
      },
      {
        title: "Budgeting only the base rate",
        body: "Stair fees, long carries, packing materials and bulky-item charges sit outside the headline figure. The estimate lists them; they are the difference between a quote and an invoice.",
      },
    ],
  },

  "price-per-square-foot-calculator": {
    intro:
      "Price per square foot is one division, and its value is entirely in making two properties comparable. Its risk is that it makes two properties look comparable when they are not.",
    mechanics: [
      {
        title: "The division and what it is for",
        body: "Divide the price by the area: $450,000 over 2,000 square feet is $225 a square foot. The figure is a comparison tool. It lets a buyer rank properties of different sizes on a common basis, which a headline price cannot do — a larger house at a higher price can be the cheaper purchase per square foot.",
      },
      {
        title: "What is counted as area varies",
        body: "Whether a basement, garage, covered porch or finished attic is included in the quoted square footage differs between listings and between markets. A property measured generously can show a lower price per square foot than an identical one measured strictly, with no difference in the house.",
      },
      {
        title: "Where the metric misleads",
        body: "It assumes area drives value, which holds better for similar homes in one neighbourhood than across neighbourhoods or property types. Land value, condition and location are not in the number. Two properties at $225 a square foot in different areas may have nothing else in common.",
      },
    ],
    example: {
      title: "Worked example: comparing on a common basis",
      setup:
        "A property at $450,000 with 2,000 square feet, compared against two alternatives. All three figures are illustrations of the arithmetic rather than market data.",
      rows: [
        { label: "Base case", value: "$225.00/sq ft", note: "450000 / 2000" },
        { label: "Same house, price $480,000", value: "$240.00/sq ft", note: "480000 / 2000" },
        { label: "Same price, 1,800 sq ft", value: "$250.00/sq ft", note: "450000 / 1800" },
      ],
      conclusion:
        "A $30,000 higher price raises the metric by $15 a square foot; a 200-square-foot measurement difference raises it by $25. The measurement matters more than the price here, which is the practical warning: before comparing two properties by this figure, confirm that both areas were measured the same way.",
    },
    mistakes: [
      {
        title: "Comparing across markets or property types",
        body: "The metric holds within a set of similar properties in one area. Across neighbourhoods or between a house and a condominium it compares things that are not alike.",
      },
      {
        title: "Assuming the quoted area is measured consistently",
        body: "Inclusion of basements, garages and outbuildings varies by listing. Two identical houses can carry different areas and therefore different price-per-square-foot figures.",
      },
      {
        title: "Treating a low figure as value",
        body: "A low price per square foot can reflect condition, location or a measurement that includes unheated space. It is a comparison, not a verdict.",
      },
    ],
  },

  "heart-rate-calculator": {
    intro:
      "Training zones are percentages of a maximum heart rate you cannot measure directly, so every zone is an estimate built on an estimate. Knowing which formula produced your number matters more than the number itself.",
    mechanics: [
      {
        title: "Two ways to estimate maximum heart rate",
        body: "The simple method is 220 minus age, which gives 180 for a 40-year-old. The Karvonen method instead uses heart rate reserve — maximum minus resting — and applies the intensity to that reserve before adding the resting rate back. At a resting rate of 60 and 70% intensity, Karvonen gives 144 while the simple method gives 126. Both are called 70% and they are not the same number.",
      },
      {
        title: "Reserve is the better basis",
        body: "Karvonen produces a higher target at the same stated percentage because it accounts for the fact that a fitter person with a lower resting rate has more usable range. Using the simple percentage of maximum systematically under-prescribes for anyone with a low resting heart rate, which is exactly the group training hardest.",
      },
      {
        title: "The estimate has a wide margin",
        body: "Age-based maximum heart rate has a substantial standard deviation — a wide spread either side of the predicted value for people of the same age. A zone calculated from it is a sensible starting range, not a physiological measurement. Perceived effort and a talk test are often more reliable in practice than a number derived from age alone.",
      },
    ],
    example: {
      title: "Worked example: age 40 with a resting rate of 60",
      setup:
        "Age 40, resting heart rate 60. Simple method as 220 minus age; Karvonen applied to heart rate reserve. Both are estimates.",
      rows: [
        { label: "Estimated maximum", value: "180 bpm", note: "220 - 40" },
        { label: "60-70% of maximum", value: "108-126 bpm", note: "180 x 0.60 to 180 x 0.70" },
        { label: "70-80% of maximum", value: "126-144 bpm", note: "180 x 0.70 to 180 x 0.80" },
        { label: "Heart rate reserve", value: "120 bpm", note: "180 - 60" },
        { label: "70% by Karvonen", value: "144 bpm", note: "120 x 0.70 + 60" },
        { label: "Difference at the same stated 70%", value: "18 bpm", note: "144 - 126" },
      ],
      conclusion:
        "The same person at the same stated intensity gets 126 bpm from one method and 144 from the other. The 18-beat gap is not a rounding difference — it is the difference between a jog and a tempo effort. Use one method consistently, and note which, because a zone quoted without its method is not a zone.",
    },
    mistakes: [
      {
        title: "Mixing the two methods",
        body: "A percentage of maximum and a percentage of reserve are different scales. Zone figures taken from both and compared produce a training plan that is inconsistent with itself.",
      },
      {
        title: "Treating the maximum as measured",
        body: "220 minus age is a population average with a wide spread. An individual's true maximum can sit well either side of it.",
      },
      {
        title: "Using a wrist sensor on the wrist",
        body: "Optical sensors are sensitive to fit, motion and skin perfusion, and they lag during intervals. For zone training, a chest strap is considerably more reliable.",
      },
    ],
  },

  "calorie-deficit-calculator": {
    intro:
      "Weight change is a deficit or surplus accumulated over time, and the arithmetic is unusually simple: about 3,500 kilocalories per pound. The difficulty is not the maths, it is that the deficit is a moving target as the body adapts.",
    mechanics: [
      {
        title: "The 3,500-kilocalorie rule",
        body: "A pound of body tissue is commonly treated as roughly 3,500 kilocalories. A daily deficit of 500 therefore predicts about a pound a week, and a deficit of 1,000 about two. The rule is an approximation — the energy content of tissue varies with its composition, and expenditure falls as weight falls — but it is close enough to plan with.",
      },
      {
        title: "The deficit is relative to a number that changes",
        body: "A deficit is measured against total daily energy expenditure, and that expenditure falls as you lose weight: less mass costs less to move and less to maintain. A deficit fixed at 500 calories produces steady loss at first and then slows, not because the arithmetic failed but because the baseline moved.",
      },
      {
        title: "Aggressive deficits have a floor",
        body: "Cutting 1,000 calories a day against a 2,500 daily expenditure means eating 1,500. Pushing further risks inadequate nutrition, loss of lean mass and poor adherence. The deficit that works is the largest one that can be sustained, which is usually smaller than the one that looks fastest on paper.",
      },
    ],
    example: {
      title: "Worked example: a 500-calorie deficit against 2,500 daily expenditure",
      setup:
        "Estimated daily expenditure 2,500 kilocalories. A daily deficit of 500, and the 3,500-kilocalorie-per-pound approximation. Both are estimates, and the expenditure figure is the less certain of the two.",
      rows: [
        { label: "Daily intake for the deficit", value: "2,000 kcal", note: "2500 - 500" },
        { label: "Weekly deficit", value: "3,500 kcal", note: "500 x 7" },
        { label: "Expected loss per week", value: "1.0 lb", note: "3500 / 3500" },
        { label: "Time to lose 20 lb at that rate", value: "20 weeks", note: "20 / 1.0" },
        { label: "Daily deficit for 2 lb a week", value: "1,000 kcal", note: "7000 / 7 — intake falls to 1,500" },
      ],
      conclusion:
        "A 500-calorie deficit predicts a pound a week and twenty weeks for twenty pounds. Doubling the deficit halves that on paper to ten weeks, at an intake of 1,500 against an expenditure of 2,500 — and it is the second half of that trade, not the first, that decides whether the plan survives. The arithmetic scales linearly; adherence does not.",
    },
    mistakes: [
      {
        title: "Treating the expenditure estimate as precise",
        body: "Daily expenditure is estimated from formulas and activity multipliers, both of which carry substantial error. The deficit inherits that error entirely.",
      },
      {
        title: "Expecting linear loss",
        body: "Expenditure falls as weight falls, and water and glycogen shifts mask fat loss over short periods. A week without movement on the scale is not evidence the arithmetic stopped working.",
      },
      {
        title: "Cutting calories without regard to what remains",
        body: "A deficit describes a quantity of energy, not a quality of diet. Meeting a low target with poor food choices makes lean mass loss and micronutrient shortfalls more likely at the same deficit.",
      },
    ],
  },

  "electricity-cost-calculator": {
    intro:
      "An appliance's running cost is watts, times hours, divided by a thousand, times the rate. The division by a thousand is the step people drop, and it turns a plausible-looking figure into one that is off by three orders of magnitude.",
    mechanics: [
      {
        title: "Watts to kilowatt-hours",
        body: "A kilowatt-hour is a thousand watts running for one hour. So an appliance drawing 1,500 watts for 8 hours uses 1,500 x 8 / 1,000 = 12 kilowatt-hours. Skipping the division gives 12,000, which is the number of watt-hours — correct in its own unit, wrong by a factor of a thousand as a billing figure.",
      },
      {
        title: "The rate is a stack, not a single number",
        body: "The price per kilowatt-hour combines supply, delivery and various fixed and volumetric charges, and it frequently varies by time of day or by how much you use in a month. A single blended rate is a reasonable approximation for comparing appliances and a poor basis for predicting a bill.",
      },
      {
        title: "Standby draw is the invisible part",
        body: "Many devices consume power when nominally off. A device drawing 5 watts continuously uses 43.8 kilowatt-hours a year, which is small individually and material across a house full of them. This calculator measures active use; standby is a separate, smaller, additive cost.",
      },
    ],
    example: {
      title: "Worked example: 1,500 watts for 8 hours a day at $0.15 per kWh",
      setup:
        "Appliance draw 1,500 watts. Eight hours a day. Rate assumed at $0.15 per kilowatt-hour, which is an illustration — rates vary by region, by time of day and by consumption tier.",
      rows: [
        { label: "Kilowatt-hours per day", value: "12.00", note: "1500 x 8 / 1000" },
        { label: "Cost per day", value: "$1.80", note: "12 x 0.15" },
        { label: "Cost per 30-day month", value: "$54.00", note: "1.80 x 30" },
        { label: "Kilowatt-hours per year", value: "4,380", note: "12 x 365" },
        { label: "Cost per year", value: "$657.00", note: "1.80 x 365" },
      ],
      conclusion:
        "Running one appliance eight hours a day costs $54 a month and $657 a year at this rate. That is the figure worth comparing against the appliance's purchase price before buying on price alone — and it is also why the hours matter so much: halving the daily running time halves the running cost, with the rate unchanged.",
    },
    mistakes: [
      {
        title: "Forgetting to convert watts to kilowatts",
        body: "Billing is in kilowatt-hours, which are a thousand watt-hours. Omitting the division by 1,000 overstates the cost by a factor of a thousand.",
      },
      {
        title: "Multiplying by the rate before converting",
        body: "The rate applies per kilowatt-hour, so the conversion has to come first. The order matters even though the operations look commutative.",
      },
      {
        title: "Using a nameplate rating as actual draw",
        body: "The rated wattage is a maximum, not a typical figure. A refrigerator cycles; a laptop rarely runs at its peak. Nameplate figures overstate real consumption for anything that modulates.",
      },
    ],
  },

  "drywall-calculator": {
    intro:
      "Drywall is bought in sheets of fixed size, so the calculation is area divided by sheet area, rounded up — plus a waste allowance that depends on how many cuts the room requires rather than on its size.",
    mechanics: [
      {
        title: "Sheets come from the area, rounded up",
        body: "A standard sheet is 4 by 8 feet, which is 32 square feet. Covering 1,200 square feet takes 1,200 / 32 = 37.5 sheets, so 38. As with any sheet material the count rounds up, because the final sheet is cut and the offcut is scrap.",
      },
      {
        title: "Waste depends on the shape, not the size",
        body: "A ten percent allowance takes this to 41.25 sheets, so 42. But waste is driven by how well full sheets fit: long uninterrupted walls produce almost none, while a room full of openings, angles and short returns can waste considerably more. A simple percentage is a starting point, and a complex layout deserves a higher one.",
      },
      {
        title: "The unseen quantities",
        body: "Sheets are the visible order; joints need tape and compound, screws are counted per square foot of board, and corners need bead. These scale with the same area but are ordered separately, and they are the lines most often forgotten when a project is quoted from board alone.",
      },
    ],
    example: {
      title: "Worked example: 1,200 square feet with 4 by 8 sheets",
      setup:
        "Area to cover 1,200 square feet. Sheets 4 by 8 feet, so 32 square feet each. Waste allowance taken at 10%.",
      rows: [
        { label: "Sheet area", value: "32 sq ft", note: "4 x 8" },
        { label: "Sheets exactly", value: "37.50", note: "1200 / 32" },
        { label: "Sheets to order", value: "38", note: "rounded up" },
        { label: "With a 10% waste allowance", value: "41.25", note: "1200 x 1.10 / 32" },
        { label: "Sheets to order with waste", value: "42", note: "rounded up" },
      ],
      conclusion:
        "The order is 38 sheets, or 42 with a ten percent allowance for cuts. Sheet material is delivered in full units, so the calculation always ends with a round-up — which means the difference between 41.25 and 42 is a whole sheet. For a room with many openings, the higher figure is the safer starting point and the tape, compound and screws are separate orders entirely.",
    },
    mistakes: [
      {
        title: "Using the wall area as the board area",
        body: "Deduct windows and doors from the wall area before dividing, but add extra for the many small cuts they create. The two adjustments do not cancel out, and which dominates depends on the layout.",
      },
      {
        title: "Rounding the sheet count down",
        body: "Half a sheet does not cover anything. Sheet goods are always rounded up, because the last sheet is cut and the remainder is waste rather than stock.",
      },
      {
        title: "Ordering board only",
        body: "Tape, joint compound, screws and corner bead are all required and are ordered on their own quantities. A materials list that stops at board is incomplete by roughly the finishing half of the job.",
      },
    ],
  },

  "paint-calculator": {
    intro:
      "Paint coverage is quoted per gallon for one coat, and almost every surface needs two. The figure on the can is also the best case, measured on a smooth sealed surface rather than on the wall you actually have.",
    mechanics: [
      {
        title: "Area divided by coverage, times the number of coats",
        body: "A gallon covers roughly 350 square feet on a smooth surface. Covering 1,200 square feet needs 1,200 / 350 = 3.43 gallons per coat, so 6.86 for two — which means 7 gallons, because paint is sold in whole cans and is not returnable once tinted.",
      },
      {
        title: "The quoted coverage is optimistic",
        body: "Manufacturer coverage assumes a smooth, sealed, non-porous surface. Bare drywall, rough masonry or a strong colour change all absorb considerably more. At 250 square feet a gallon the same 1,200 square feet needs 9.6 gallons for two coats — nearly three more than the can's own figure suggests.",
      },
      {
        title: "Colour change is the real variable",
        body: "Going from a dark colour to a light one over a tinted primer, or covering a strong red with a pale neutral, can require three coats rather than two. The arithmetic is unchanged; the multiplier is not. Approximate the number of coats before buying, because the shortfall is always discovered halfway up a wall.",
      },
    ],
    example: {
      title: "Worked example: 1,200 square feet, two coats",
      setup:
        "Area to cover 1,200 square feet. Coverage assumed at 350 square feet per gallon, which is the typical figure for a smooth sealed wall. Two coats.",
      rows: [
        { label: "Gallons per coat", value: "3.43", note: "1200 / 350" },
        { label: "Gallons for two coats", value: "6.86", note: "3.43 x 2" },
        { label: "Gallons to buy", value: "7", note: "rounded up — tinted paint is not returnable" },
        { label: "If coverage is 250 sq ft/gal", value: "9.60", note: "1200 / 250 x 2, so 10 gallons" },
        { label: "Extra cans at the lower coverage", value: "3", note: "10 - 7" },
      ],
      conclusion:
        "Two coats over 1,200 square feet is 7 gallons at the quoted coverage and 10 at a realistic one for a porous surface. Three cans, or roughly 40% more paint, is decided entirely by the surface rather than by the area — which is why coverage figures are a planning estimate and the surface is the actual variable.",
    },
    mistakes: [
      {
        title: "Buying for one coat",
        body: "Almost every surface needs two, and a colour change may need three. The can's coverage figure is per coat and is the most common source of a mid-job shortage.",
      },
      {
        title: "Trusting the quoted coverage on a porous wall",
        body: "Bare drywall, render and masonry absorb substantially more than the figure assumes. Budget on the lower number for an unsealed surface.",
      },
      {
        title: "Forgetting primer",
        body: "Primer is a separate product with its own coverage, and it is required for bare surfaces and for significant colour changes. It is not part of the paint quantity.",
      },
    ],
  },

  "home-remodel-cost-calculator": {
    intro:
      "A remodel is estimated room by room at a cost per square foot, and the rates differ so much between room types that averaging them across a project is how a whole-house budget goes wrong.",
    mechanics: [
      {
        title: "Kitchens and bathrooms drive the total",
        body: "A kitchen and a bathroom are the two most expensive rooms per square foot, because cost is concentrated in cabinetry, plumbing, tile and electrical rather than in floor area. A 200-square-foot kitchen at $150 a square foot is $30,000; a 50-square-foot bathroom at $250 is $12,500. The bathroom is a quarter of the area and more than 40% of the combined cost of this pair.",
      },
      {
        title: "Per-square-foot rates are the wrong shape for a bathroom",
        body: "A bathroom has a fixed set of fixtures and connections regardless of whether it is 50 or 80 square feet. Its cost is closer to a fixed figure plus a small area term than to a rate times area, which is why small bathrooms show an unusually high cost per square foot. The metric is a planning aid, not a pricing model.",
      },
      {
        title: "Contingency and what sits outside the rate",
        body: "A contingency of 15% on a $42,500 pair of rooms is $6,375. Beyond that, permits, design fees and any work discovered behind the walls sit outside a per-square-foot rate entirely — and in a remodel those are the items most likely to change the total.",
      },
    ],
    example: {
      title: "Worked example: a kitchen and a bathroom",
      setup:
        "Kitchen 200 square feet at an assumed $150 per square foot. Bathroom 50 square feet at an assumed $250 per square foot. Both rates are illustrations — regional rates vary widely and neither is a quote.",
      rows: [
        { label: "Kitchen", value: "$30,000.00", note: "200 x 150" },
        { label: "Bathroom", value: "$12,500.00", note: "50 x 250" },
        { label: "Combined", value: "$42,500.00", note: "30000 + 12500" },
        { label: "Contingency at 15%", value: "$6,375.00", note: "42500 x 0.15" },
        { label: "Total with contingency", value: "$48,875.00", note: "42500 + 6375" },
        { label: "Bathroom share of the cost", value: "29.4%", note: "12500 / 42500 — on 20% of the area" },
      ],
      conclusion:
        "The bathroom is 20% of the floor area and 29.4% of the cost, and that gap widens as bathrooms get smaller, because the fixtures and connections do not shrink with the room. Budgeting a whole house at one blended rate hides exactly this, which is why room-by-room estimation is worth the extra step even when the project is small.",
    },
    mistakes: [
      {
        title: "Averaging one rate across the whole house",
        body: "Kitchens and bathrooms cost several times more per square foot than bedrooms or living space, for reasons that have nothing to do with area. A blended rate understates the expensive rooms and overstates the cheap ones.",
      },
      {
        title: "Comparing a renovation rate to a new-build rate",
        body: "New-build rates are lower per square foot because the work is unencumbered. A renovation carries demolition, protection and discovery, and it is priced accordingly.",
      },
      {
        title: "Leaving permits and design out of the budget",
        body: "Design fees, engineering and permits are real project costs and are not inside a per-square-foot construction rate. They are usually the first items omitted.",
      },
    ],
  },

  "bmi-calculator": {
    intro:
      "BMI is a single division — weight in kilograms over height in metres squared — and its usefulness is limited by exactly how little is in it. It measures size, not composition, and the distinction matters most at the two ends of the scale.",
    mechanics: [
      {
        title: "The formula and the unit conversion",
        body: "BMI is kilograms divided by height in metres squared. In imperial units the conversion is where errors appear: 180 pounds is 81.65 kilograms, and 5 feet 10 inches is 1.778 metres. Those give 81.65 / 3.1613 = 25.83. Dividing pounds by inches without converting produces a number that is not BMI at all.",
      },
      {
        title: "What it cannot distinguish",
        body: "BMI has no term for muscle, bone density or fat distribution. A muscular athlete and a sedentary person of the same height and weight have the same BMI and very different body composition. The measure was designed for population studies, where those individual differences average out, not for assessing one person.",
      },
      {
        title: "Where the categories come from",
        body: "The category boundaries are administrative thresholds chosen to describe populations, not physiological cut-points discovered in individuals. They were set for a specific reference population and are applied to others with varying accuracy. A BMI a fraction above a boundary is not meaningfully different from one a fraction below it.",
      },
    ],
    example: {
      title: "Worked example: 180 pounds at 5 feet 10 inches",
      setup:
        "Weight 180 pounds. Height 5 feet 10 inches, which is 70 inches. Conversions to metric are exact rather than rounded.",
      rows: [
        { label: "Weight in kilograms", value: "81.65 kg", note: "180 x 0.45359237" },
        { label: "Height in metres", value: "1.7780 m", note: "70 x 0.0254" },
        { label: "Height squared", value: "3.1613", note: "1.7780 x 1.7780" },
        { label: "BMI", value: "25.83", note: "81.65 / 3.1613" },
        { label: "Weight at BMI 25 for this height", value: "174.2 lb", note: "5.8 lb lower" },
      ],
      conclusion:
        "A BMI of 25.83 sits just above the boundary commonly labelled overweight, and reaching a BMI of 25 would require losing 5.8 pounds — with no change to muscle, fat distribution or fitness. That is what the number measures: a relationship between two dimensions, and nothing about what the weight is made of.",
    },
    mistakes: [
      {
        title: "Dividing pounds by inches",
        body: "The formula requires kilograms and metres. Using imperial units without converting produces an arbitrary figure, and it is a common source of a BMI that looks plausible but is not.",
      },
      {
        title: "Reading a category as a diagnosis",
        body: "The boundaries are population thresholds, not individual diagnoses. A doctor assessing risk uses waist measurement, blood markers and history, not a single ratio of height to weight.",
      },
      {
        title: "Applying adult categories to children",
        body: "Children and adolescents are assessed against age-and-sex-specific percentiles, because body composition changes rapidly with growth. Adult thresholds do not apply.",
      },
    ],
  },

  "tile-calculator": {
    intro:
      "Tile is bought by the box, and the box is the only unit that matters at the till. The calculation is an area, a tile size, a waste allowance and a round-up — four steps where only the last one costs money.",
    mechanics: [
      {
        title: "Area over tile area",
        body: "Divide the area to cover by the area of one tile. A 12 by 12 inch tile is exactly one square foot, so 200 square feet needs 200 tiles. For any other size, convert the tile dimensions to feet first: a 6 by 6 inch tile is 0.25 square feet, so the same floor needs 800.",
      },
      {
        title: "Waste depends on the layout",
        body: "A straight lay against square walls wastes little; a diagonal pattern or a herringbone wastes considerably more. Ten percent is the normal allowance for a straightforward layout, taking 200 tiles to 220. Complex patterns and small rooms with many cuts justify fifteen to twenty.",
      },
      {
        title: "Boxes, and why the round-up is expensive",
        body: "Tiles come in boxes of a fixed count — this calculator uses ten per box. So 220 tiles is 22 boxes, and the round-up to a whole box can add up to nine tiles you will never lay. Tile from different production runs can differ slightly in shade, which is why buying the extra box up front is preferable to returning for one later.",
      },
    ],
    example: {
      title: "Worked example: 200 square feet with 12 by 12 inch tile",
      setup:
        "Area 200 square feet. Tiles 12 by 12 inches, so one square foot each. Waste allowance taken at 10%. Boxes assumed at ten tiles, which is the figure this calculator uses.",
      rows: [
        { label: "Area of one tile", value: "1 sq ft", note: "12 in x 12 in = 1 sq ft" },
        { label: "Tiles exactly", value: "200", note: "200 / 1" },
        { label: "With a 10% waste allowance", value: "220", note: "200 x 1.10" },
        { label: "Boxes at ten tiles each", value: "22", note: "220 / 10" },
        { label: "Tiles bought versus laid", value: "20 spare", note: "220 - 200" },
      ],
      conclusion:
        "The order is 22 boxes. Twenty tiles will not be laid — ten percent for cuts and ten for the round-up to whole boxes. That is normal rather than wasteful: the spares cover a breakage or a miscut, and a tile bought six months later may not match the batch. The waste here is the cost of not running short.",
    },
    mistakes: [
      {
        title: "Mixing inches and feet",
        body: "Tile dimensions are usually quoted in inches and areas in feet. Convert the tile to square feet before dividing, or the count will be out by a factor of 144.",
      },
      {
        title: "Forgetting the waste allowance on a diagonal lay",
        body: "Diagonal and patterned layouts cut more and waste more. A ten percent allowance is for a straight lay; a diagonal pattern commonly needs fifteen or more.",
      },
      {
        title: "Buying the exact count",
        body: "There is no margin for a miscut or a broken tile, and tiles from a later batch can differ in shade. The round-up to whole boxes plus a small allowance is the practical minimum.",
      },
    ],
  },

  "carpet-calculator": {
    intro:
      "Carpet is priced and sold by the square yard, not the square foot, and it comes in fixed-width rolls. Both facts mean the arithmetic is a conversion followed by a question about how the roll divides.",
    mechanics: [
      {
        title: "Square feet to square yards",
        body: "There are nine square feet in a square yard, so dividing the area by nine converts it. Five hundred square feet is 55.56 square yards. Confusing this with the three feet in a linear yard is the most common error, and it understates the quantity by a factor of three.",
      },
      {
        title: "Seams and roll width drive the real quantity",
        body: "Carpet comes in rolls of a fixed width, commonly twelve or fifteen feet. A room wider than the roll needs a seam, and the second piece may require nearly as much length as the first — so a room just over twelve feet wide can need almost twice the carpet of one just under. The area is the starting point; how it divides into roll widths is what determines the order.",
      },
      {
        title: "Waste and pile direction",
        body: "A ten percent allowance covers trimming for edges, doorways and irregular shapes. Pile direction adds a constraint that area alone does not capture: pieces laid with the pile running in different directions look different under light, so cuts have to be oriented consistently and that can increase waste further.",
      },
    ],
    example: {
      title: "Worked example: 500 square feet",
      setup:
        "Area 500 square feet. Rolls assumed twelve feet wide, which is a common width and not a universal one. Waste allowance taken at 10%.",
      rows: [
        { label: "Square yards", value: "55.56 sq yd", note: "500 / 9" },
        { label: "With a 10% waste allowance", value: "61.11 sq yd", note: "550 / 9" },
        { label: "Square yards to order", value: "62 sq yd", note: "rounded up — carpet is not sold in fractions of a yard" },
        { label: "The wrong conversion", value: "166.67", note: "500 / 3 — using linear rather than square yards" },
      ],
      conclusion:
        "Five hundred square feet is 55.56 square yards, so 62 with waste and a round-up. The last row shows what happens if the conversion is treated as three rather than nine: the quantity comes out three times too high. The area is only half the calculation in practice, because the roll width and seam placement set the actual order.",
    },
    mistakes: [
      {
        title: "Dividing by three instead of nine",
        body: "A square yard contains nine square feet, not three. Confusing it with the linear conversion overstates the order by a factor of three.",
      },
      {
        title: "Ignoring roll width",
        body: "A room wider than the roll needs a seam and a second length. That can nearly double the quantity for a room slightly wider than the roll, regardless of its total area.",
      },
      {
        title: "Laying pieces with the pile in different directions",
        body: "Pile direction affects how the carpet reflects light. Two pieces run against each other show as a visible seam even when the join itself is perfect.",
      },
    ],
  },

  "grade-calculator": {
    intro:
      "A course grade is a weighted average, and the weighting is the whole point. A grade in a course carrying four credits affects the result four times as much as one carrying a single credit, which is why two students with identical letter grades can have different averages.",
    mechanics: [
      {
        title: "Quality points, then divide by credits",
        body: "Each grade is converted to a number — on a four-point scale, an A is 4.0, a B is 3.0 and so on — then multiplied by the course's credit value to give quality points. Adding those and dividing by total credits gives the average. Note that the divisor is credits, not the number of courses.",
      },
      {
        title: "Why dividing by course count is wrong",
        body: "Treating every course as equal weight ignores that credit values differ. A three-credit A and a three-credit C average to a 3.0 whether you weight by credits or by courses — but add a one-credit A and a four-credit C and the two methods diverge, because the heavy course should dominate.",
      },
      {
        title: "What the average does not capture",
        body: "An average of 3.11 is compatible with straight Bs and with a mix of As and Cs. The number is the same; the trajectory is not, and many institutions look at the trend and the difficulty of the courses as well as the final figure.",
      },
    ],
    example: {
      title: "Worked example: three courses with different credit values",
      setup:
        "Course A: grade A (4.0) over 3 credits. Course B: grade B (3.0) over 4 credits. Course C: grade C (2.0) over 2 credits. Four-point scale.",
      rows: [
        { label: "Quality points from course A", value: "12.0", note: "3 credits x 4.0" },
        { label: "Quality points from course B", value: "12.0", note: "4 credits x 3.0" },
        { label: "Quality points from course C", value: "4.0", note: "2 credits x 2.0" },
        { label: "Total quality points", value: "28.0", note: "12 + 12 + 4" },
        { label: "Total credits", value: "9", note: "3 + 4 + 2" },
        { label: "Weighted average", value: "3.11", note: "28 / 9" },
      ],
      conclusion:
        "The average is 3.11 — a B overall, despite one A and one C. The unweighted mean of the three grade points would be 3.00, so the credit weighting moved the result up, because the A sat in a heavier course than the C. That is the mechanism: the answer depends on where the grades fell, not only on what they were.",
    },
    mistakes: [
      {
        title: "Dividing by the number of courses",
        body: "The divisor is total credits, not course count. Treating a one-credit seminar as equal to a four-credit lecture produces an average the institution will not recognise.",
      },
      {
        title: "Averaging the letter grades directly",
        body: "Grade points have to be used, and the scale has to be the institution's own. Some use a 4.0 maximum with plus and minus grades carrying intermediate values; others compress those into whole points.",
      },
      {
        title: "Confusing a term average with a cumulative one",
        body: "A cumulative average weights every course taken so far, so one term moves it less than students expect in later years. A term figure and a cumulative figure are not interchangeable.",
      },
    ],
  },

  "body-fat-calculator": {
    intro:
      "Tape-based body fat estimates are regressions, not measurements — a formula fitted to a sample, applied to an individual. They are useful for tracking change in one person and unreliable for comparing two people.",
    mechanics: [
      {
        title: "The circumference method",
        body: "The US Navy method uses a logarithmic relationship between circumference and height: for men, 86.010 x log10(waist minus neck) minus 70.041 x log10(height) plus 36.76. With a 34-inch waist, a 15-inch neck and a height of 70 inches that gives 17.51%. Both logarithms are base ten, not natural.",
      },
      {
        title: "It tracks change better than it measures level",
        body: "The formula was fitted to a specific population, so its absolute output carries the error of that fit for any individual. But because the same error applies to successive measurements of the same person, a change in the number reflects a real change in the inputs. Use it for direction, treat the level as approximate.",
      },
      {
        title: "Measurement consistency is everything",
        body: "The inputs are tape measurements, and a half-inch difference in the waist reading moves the result by more than a percentage point. Measuring at the same point, at the same time of day and under the same conditions matters more than which formula is used.",
      },
    ],
    example: {
      title: "Worked example: 34-inch waist, 15-inch neck, 70-inch height",
      setup:
        "Waist 34 inches, neck 15 inches, height 70 inches. US Navy circumference method for men. Both logarithms are base ten.",
      rows: [
        { label: "Waist minus neck", value: "19 in", note: "34 - 15" },
        { label: "log10(19)", value: "1.27875", note: "base ten, not natural" },
        { label: "log10(70)", value: "1.84510", note: "base ten" },
        { label: "Estimated body fat", value: "17.51%", note: "86.010 x 1.27875 - 70.041 x 1.84510 + 36.76" },
      ],
      conclusion:
        "The estimate is 17.51%, and it is an estimate fitted to a sample rather than a measurement of this person. Its practical value is the trend: the same tape, the same landmarks and the same time of day applied monthly will show whether the composition is changing, even if the absolute figure sits a point or two off.",
    },
    mistakes: [
      {
        title: "Using natural logarithms",
        body: "The coefficients were fitted using base-ten logarithms. Substituting natural logs changes every term and produces a materially different answer.",
      },
      {
        title: "Measuring at a different point each time",
        body: "The formula is sensitive to the waist reading, and the waist is where measurement variance is largest. Consistency of landmark matters more than precision of the tape.",
      },
      {
        title: "Comparing your number to someone else's",
        body: "The formula carries individual error, so two people at the same true body fat can read differently. Compare a person to their own previous figures, not to another person.",
      },
    ],
  },

  "miles-per-gallon-calculator": {
    intro:
      "Miles per gallon is one division, and it becomes useful the moment it is converted to cost per mile. That conversion is what lets a fuel-efficiency figure compete with a price at the pump.",
    mechanics: [
      {
        title: "Miles over gallons",
        body: "Divide the distance driven by the fuel used: 320 miles on 10.5 gallons is 30.48 mpg. The measurement is only as good as the fuel record, and the reliable method is to fill the tank completely at each fill-up and divide the miles between fills by the gallons added.",
      },
      {
        title: "Cost per mile is the transferable figure",
        body: "Divide the price per gallon by the mpg. At $3.50 a gallon and 30.48 mpg that is $0.115 a mile, which prices any distance immediately. This is the figure that makes efficiency comparable to fuel price: improving from 30 to 35 mpg saves more per mile than a 50-cent drop in the pump price at typical prices.",
      },
      {
        title: "Why the trip computer disagrees",
        body: "In-dash economy displays are estimates derived from fuel injection data and are frequently optimistic, sometimes by several miles per gallon. A fill-to-fill calculation is the reference figure, and a persistent gap between the two is normal rather than a fault.",
      },
    ],
    example: {
      title: "Worked example: 320 miles on 10.5 gallons at $3.50 a gallon",
      setup:
        "Distance 320 miles between fill-ups. Fuel added 10.5 gallons. Price assumed at $3.50 a gallon.",
      rows: [
        { label: "Miles per gallon", value: "30.48", note: "320 / 10.5" },
        { label: "Cost per mile", value: "$0.115", note: "3.50 / 30.48" },
        { label: "Cost of 1,000 miles", value: "$114.84", note: "1000 x 0.11484" },
        { label: "Annual cost at 12,000 miles", value: "$1,378.12", note: "12000 x 0.11484" },
        { label: "The same at 25 mpg", value: "$1,680.00", note: "12000 / 25 x 3.50 — $302 more a year" },
      ],
      conclusion:
        "Thirty and a half miles per gallon is 11.5 cents a mile, which is $1,378 a year at 12,000 miles. Dropping to 25 mpg costs $302 more over the same distance — a difference worth more than most drivers would guess, and one that a change of vehicle rather than a change of driving style produces immediately.",
    },
    mistakes: [
      {
        title: "Dividing gallons by miles",
        body: "That gives gallons per mile, which is a legitimate measure used in some countries but is not mpg. It also inverts the intuition: with this measure, lower is better.",
      },
      {
        title: "Measuring between partial fill-ups",
        body: "The calculation requires the tank to be filled to the same level each time. Filling partially and recording the distance produces a figure that drifts unpredictably.",
      },
      {
        title: "Trusting the dashboard over the pump",
        body: "Trip computers estimate from injection data and are commonly optimistic. The fill-to-fill figure is the one that matches what you actually paid for.",
      },
    ],
  },

  "gpa-calculator": {
    intro:
      "GPA is a weighted mean of grade points, and the two things that vary most between schools are what the scale goes up to and whether courses are weighted. Both change the answer without changing the grades.",
    mechanics: [
      {
        title: "Quality points divided by credits",
        body: "Convert each grade to its point value, multiply by the credits that course carries, add the results and divide by the total credits. Three courses graded A, B and C over 3, 4 and 2 credits give 28 quality points over 9 credits, which is 3.111, or 3.11 to two places.",
      },
      {
        title: "The scale is not universal",
        body: "A four-point scale is common but not the only one. Some institutions use five for weighted advanced courses, some compress plus and minus grades into whole points, and some weight the scale for course difficulty. A 3.5 on one scale is not a 3.5 on another, which is why a GPA quoted without its scale is incomplete.",
      },
      {
        title: "Cumulative is not a fresh start",
        body: "A cumulative GPA weights every course taken, so each new term moves it less. Early grades continue to have an effect through the whole programme, which is why the marginal cost of a poor first term persists far longer than it feels it should.",
      },
    ],
    example: {
      title: "Worked example: three courses on a four-point scale",
      setup:
        "Course A: A (4.0) over 3 credits. Course B: B (3.0) over 4 credits. Course C: C (2.0) over 2 credits. Four-point scale, no weighting for difficulty.",
      rows: [
        { label: "Quality points", value: "28.0", note: "12.0 + 12.0 + 4.0" },
        { label: "Total credits", value: "9", note: "3 + 4 + 2" },
        { label: "GPA", value: "3.111", note: "28 / 9" },
        { label: "Reported to two places", value: "3.11", note: "conventional rounding" },
        { label: "As a percentage of the scale", value: "77.8%", note: "3.111 / 4 x 100" },
      ],
      conclusion:
        "The GPA is 3.11, or 77.8% of the four-point maximum. Note that the percentage is a translation, not a grade — many institutions do not convert between the two, and ones that do use their own table. The average is a weighted mean, and it moves whenever a credit value or a scale convention changes.",
    },
    mistakes: [
      {
        title: "Dividing by the number of courses",
        body: "The divisor is total credits. A one-credit course and a four-credit course are not equal contributions, and treating them as equal produces a figure no registrar recognises.",
      },
      {
        title: "Ignoring whether the scale is weighted",
        body: "Advanced and honours courses may use a five-point scale, which raises the maximum. A GPA computed on an unweighted scale and compared to a weighted one understates the result.",
      },
      {
        title: "Assuming the percentage conversion is standard",
        body: "The mapping between GPA and percentage varies by institution. Converting at all is an approximation unless the school publishes its own table.",
      },
    ],
  },

  "time-duration-calculator": {
    intro:
      "Duration arithmetic looks trivial until a span crosses midnight, and that is exactly when a hand calculation goes wrong. The reliable method is to convert both ends to a single unit, subtract, and convert back once.",
    mechanics: [
      {
        title: "Convert to minutes before subtracting",
        body: "Rather than subtracting hours and minutes separately, convert each time to minutes since midnight and subtract. 9:45 AM is 585 minutes past midnight and 4:30 PM is 990, so the interval is 990 minus 585, which is 405 minutes — 6 hours and 45 minutes. Subtracting the parts separately invites borrowing errors, because minutes borrow 60 rather than 100.",
      },
      {
        title: "Crossing midnight adds 24 hours",
        body: "A span from 10:00 PM to 6:15 AM is negative if both ends are treated as times on the same day. Adding 1,440 minutes for the intervening day gives the right answer: 6:15 AM is 375 minutes, 10:00 PM is 1,320, and 375 plus 1,440 minus 1,320 is 495 minutes, or 8 hours 15 minutes.",
      },
      {
        title: "Decimal hours are a different representation",
        body: "Timesheets often use decimal hours, where 45 minutes is 0.75 of an hour. That makes arithmetic with a rate simple, because hours multiplied by an hourly rate needs hours rather than a two-part notation. Converting back and forth is the source of most payroll errors.",
      },
    ],
    example: {
      title: "Worked example: two spans, one crossing midnight",
      setup:
        "Span one: 9:45 AM to 4:30 PM on the same day. Span two: 10:00 PM to 6:15 AM, crossing midnight. Both counted as elapsed time.",
      rows: [
        { label: "Span one in minutes", value: "405", note: "990 - 585" },
        { label: "Span one", value: "6 h 45 m", note: "405 / 60" },
        { label: "Span two in minutes", value: "495", note: "(375 + 1440) - 1320" },
        { label: "Span two", value: "8 h 15 m", note: "495 / 60, crossing midnight" },
        { label: "Combined total", value: "900 min / 15 h", note: "405 + 495" },
        { label: "Span one as decimal hours", value: "6.75 h", note: "45 minutes is 0.75 of an hour" },
      ],
      conclusion:
        "The two spans are 6 hours 45 minutes and 8 hours 15 minutes, totalling 15 hours. The overnight span is where a hand count fails, because subtracting the two clock times gives a negative number unless a day is added. Converting to minutes first makes the midnight case the same operation as the ordinary one.",
    },
    mistakes: [
      {
        title: "Subtracting clock times across midnight",
        body: "A negative result from subtracting the parts means a day boundary was crossed. Adding 24 hours to the end time — or 1,440 minutes — produces the elapsed time.",
      },
      {
        title: "Borrowing incorrectly across the hour",
        body: "Minutes borrow 60, not 100. Subtracting minutes and hours separately without accounting for that produces errors that are always a multiple of 40 minutes.",
      },
      {
        title: "Confusing 1.75 hours with 1 hour 75 minutes",
        body: "Decimal hours and the two-part notation are different systems. A decimal of 0.75 is 45 minutes; 75 minutes is 1 hour and 15 minutes, which as a decimal is 1.25.",
      },
    ],
  },

  "water-intake-calculator": {
    intro:
      "Fluid guidance is generally expressed as a total from all sources, and the drinks are only part of it. The common half-your-weight heuristic is a starting estimate, not a target to hit with a water bottle alone.",
    mechanics: [
      {
        title: "The half-your-weight heuristic",
        body: "The common rule suggests roughly half your body weight in ounces: 180 pounds gives 90 ounces, which is about 2.66 litres. It is a heuristic rather than a derived requirement, and it scales with body size, which is why it is more useful than a single fixed figure applied to everyone.",
      },
      {
        title: "Activity and climate move it far more than weight",
        body: "Sweat losses during exercise and in heat can be substantial, and they are not captured by body weight. A working figure is roughly 12 additional ounces for each half hour of activity, with more in heat or at altitude. For many people this term exceeds the adjustment for body size.",
      },
      {
        title: "Food and other drinks count",
        body: "A significant share of typical fluid intake comes from food, and all beverages count toward the total including coffee and tea. Guidance expressed as total fluid is therefore not a target for plain water alone. The practical indicators of adequacy are thirst and urine colour rather than a number.",
      },
    ],
    example: {
      title: "Worked example: 180 pounds",
      setup:
        "Body weight 180 pounds. Half-weight heuristic applied, plus a moderate exercise allowance. The additional figure per half hour of activity is a working approximation rather than a derived requirement.",
      rows: [
        { label: "Half body weight in ounces", value: "90 oz", note: "180 x 0.5" },
        { label: "In litres", value: "2.66 L", note: "90 / 33.814" },
        { label: "In 8-ounce glasses", value: "11.2", note: "90 / 8" },
        { label: "With one half-hour of exercise", value: "102 oz", note: "90 + 12" },
      ],
      conclusion:
        "The heuristic gives about 90 ounces, or 2.66 litres, rising to 102 with a half hour of exercise. Both figures include fluid from food and from every beverage, so the amount of plain water required is lower than the number suggests. The estimate scales sensibly with body size and activity, which is the most that can be said for it as a target.",
    },
    mistakes: [
      {
        title: "Drinking the whole figure as plain water",
        body: "The guidance is for total fluid, including food and all drinks. Treating it as a water-only target overshoots, and in large amounts consumed quickly can dilute blood sodium.",
      },
      {
        title: "Ignoring activity and heat",
        body: "Sweat losses are not captured by body weight and can exceed the adjustment for size. Exercise and hot weather move the requirement more than weight does.",
      },
      {
        title: "Applying a fixed figure to everyone",
        body: "Requirements vary with body size, activity, climate and health conditions. A single number applied universally is a rough average, not a personal target.",
      },
    ],
  },

  "due-date-calculator": {
    intro:
      "An estimated due date is a calculation from a date you know, not a prediction of when labour will begin. It marks a point on a distribution, and the range around it is wide.",
    mechanics: [
      {
        title: "280 days from the last menstrual period",
        body: "The standard estimate adds 280 days — forty weeks — to the first day of the last menstrual period. From 1 January that gives 8 October. The count starts at the period rather than at conception because the period date is the one that is reliably known.",
      },
      {
        title: "Naegele's rule is the same arithmetic restated",
        body: "The traditional form is: subtract three months from the first day of the last period, then add seven days and one year. For 1 January it gives 8 October of the same year, matching the 280-day version. Two routes to one number, which is a useful cross-check when the dates are awkward.",
      },
      {
        title: "Why the estimate is an estimate",
        body: "The 280-day figure assumes a regular 28-day cycle with ovulation on day 14. Cycles longer or shorter than that shift the estimate, and cycle length varies between people and between months. Ultrasound measurement in early pregnancy is more accurate than any date calculation, which is why the estimate is often revised.",
      },
    ],
    example: {
      title: "Worked example: last menstrual period on 1 January",
      setup:
        "First day of the last menstrual period: 1 January. Standard 280-day count, cross-checked against Naegele's rule. Both are estimates that a clinician may revise.",
      rows: [
        { label: "Estimated due date", value: "8 October", note: "1 January + 280 days" },
        { label: "Naegele's rule check", value: "8 October", note: "minus 3 months, plus 7 days, plus 1 year" },
        { label: "Weeks in the calculation", value: "40", note: "280 / 7" },
        { label: "Typical range around the estimate", value: "roughly 2 weeks either side", note: "a wide distribution, not a deadline" },
      ],
      conclusion:
        "Both methods give 8 October, which is the point of having two — they should agree, and when they do not, an arithmetic slip is the usual cause. The forty-week figure is a convention rather than a biological constant, and the estimate is a centre point with a wide range around it.",
    },
    mistakes: [
      {
        title: "Counting from conception",
        body: "The convention counts from the last menstrual period, which is roughly two weeks before conception. Counting from a known conception date gives a different and lower figure.",
      },
      {
        title: "Treating the date as a deadline",
        body: "It is the centre of a distribution. A wide range of dates around it is normal, and a clinician may revise the estimate after an early scan.",
      },
      {
        title: "Ignoring cycle length",
        body: "The 280-day rule assumes a 28-day cycle. A longer cycle shifts ovulation later and moves the estimate, which is one reason the calculated date is often adjusted.",
      },
    ],
  },

  "wallpaper-calculator": {
    intro:
      "Wallpaper is sold in rolls of fixed area, and the pattern repeat is what makes the difference between the area of the wall and the quantity of paper you have to buy.",
    mechanics: [
      {
        title: "Net wall area, after openings",
        body: "Multiply the room perimeter by wall height to get the gross area — 40 feet by 9 feet is 360 square feet — then subtract doors and windows. Two doors at 21 square feet and a window at 15 gives a net area of 303 square feet. Openings are subtracted because paper is not hung across them, but the waste they create is not.",
      },
      {
        title: "A roll covers less than it contains",
        body: "A roll is nominally a fixed area, but only part of it is usable once lengths are cut to the wall height. Around 33 square feet of usable coverage per roll is a reasonable working figure, so 303 square feet needs 9.18 rolls — which means 10.",
      },
      {
        title: "Pattern repeat is the quantity people forget",
        body: "A patterned paper with a repeat must have each strip aligned to the pattern, so every cut consumes up to a full repeat of extra length. Adding 15% for a moderate repeat takes the requirement from 9.18 to 10.56 rolls, which is 11 rather than 10. For a large repeat, more.",
      },
    ],
    example: {
      title: "Worked example: a 40-foot perimeter with 9-foot walls",
      setup:
        "Room perimeter 40 feet, wall height 9 feet. Two doors at 21 square feet each and one window at 15 square feet. Usable coverage assumed at 33 square feet per roll, which is a working figure rather than a fixed one.",
      rows: [
        { label: "Gross wall area", value: "360 sq ft", note: "40 x 9" },
        { label: "Less two doors", value: "-42 sq ft", note: "21 each" },
        { label: "Less one window", value: "-15 sq ft", note: "assumed" },
        { label: "Net wall area", value: "303 sq ft", note: "360 - 57" },
        { label: "Rolls at plain paper", value: "10", note: "303 / 33 = 9.18, rounded up" },
        { label: "Rolls with a pattern repeat, plus 15%", value: "11", note: "303 x 1.15 / 33 = 10.56, rounded up" },
      ],
      conclusion:
        "The same room needs 10 rolls of a plain paper and 11 of a patterned one. The extra roll is not waste — it is the pattern alignment, which consumes length on every strip that a plain paper does not. Working from the wall area alone, with no allowance for repeat, is how a job finishes one strip short.",
    },
    mistakes: [
      {
        title: "Ignoring the pattern repeat",
        body: "Patterned paper consumes extra length at every cut to align the design. Plain paper needs no allowance; a large repeat can need substantially more than 15%.",
      },
      {
        title: "Using the nominal roll area as usable coverage",
        body: "Only the part of a roll that becomes full-length strips counts. A working figure of about 33 square feet per roll is more realistic than the label area.",
      },
      {
        title: "Forgetting that openings create offcuts",
        body: "Doors and windows are subtracted from the area, but the strips around them are cut and largely wasted. Subtracting the area without allowing for the extra cutting understates the requirement.",
      },
    ],
  },

  "sleep-calculator": {
    intro:
      "Sleep runs in cycles of roughly ninety minutes, and waking between them feels different from waking inside one. Counting cycles rather than hours is a way of aiming at the boundary.",
    mechanics: [
      {
        title: "Cycles of about ninety minutes",
        body: "Sleep progresses through cycles of roughly ninety minutes, each ending with a lighter stage. Four cycles is six hours, five is seven and a half, six is nine. The figure is an average: cycles vary between people and across the night, with later cycles tending to be longer and lighter.",
      },
      {
        title: "Add the time it takes to fall asleep",
        body: "The time between getting into bed and sleeping is not part of a cycle. Fifteen minutes is a common working figure, so a wake time of 6:30 AM with five cycles means being in bed by 10:45 PM — seven and a half hours of sleep plus the fifteen minutes. Omitting that term puts bedtime fifteen minutes late every night.",
      },
      {
        title: "What the calculation cannot account for",
        body: "Alcohol, caffeine, late light exposure and irregular schedules all affect how quickly sleep arrives and how it is structured. A bedtime calculated from cycles assumes the transition happens on schedule, and the number of cycles achieved is an outcome rather than a decision.",
      },
    ],
    example: {
      title: "Worked example: aiming at a 6:30 AM wake time",
      setup:
        "Wake time 6:30 AM. Cycles of 90 minutes. Fifteen minutes allowed to fall asleep. Cycle length is an average rather than a fixed value.",
      rows: [
        { label: "Four cycles", value: "6.0 h", note: "4 x 90 minutes" },
        { label: "Five cycles", value: "7.5 h", note: "5 x 90 minutes" },
        { label: "Six cycles", value: "9.0 h", note: "6 x 90 minutes" },
        { label: "Bedtime for five cycles", value: "10:45 PM", note: "6:30 - 7.5 h - 15 min" },
        { label: "Bedtime for six cycles", value: "9:15 PM", note: "6:30 - 9 h - 15 min" },
      ],
      conclusion:
        "For a 6:30 AM wake time, five cycles means being in bed by 10:45 PM and six means 9:15 PM. The fifteen minutes is the part usually left out, and leaving it out means being fifteen minutes short of the cycle count aimed for — which defeats the purpose of counting them at all. Whether the cycles themselves arrive is a different question from how the bedtime was chosen.",
    },
    mistakes: [
      {
        title: "Forgetting the time to fall asleep",
        body: "The interval between getting into bed and sleeping is not part of a cycle. Omitting it makes the planned cycle count unreachable by exactly that margin.",
      },
      {
        title: "Treating 90 minutes as exact",
        body: "Cycle length varies between people and across the night. The boundaries shift, so a calculated wake time is an approximation rather than a schedule.",
      },
      {
        title: "Optimising only the bedtime",
        body: "Hitting a cycle boundary helps how waking feels. Total sleep duration, regularity and sleep quality are the larger determinants, and none of them appear in the cycle arithmetic.",
      },
    ],
  },

  "tdee-calculator": {
    intro:
      "Total daily energy expenditure is a resting rate multiplied by an activity factor — two estimates multiplied together, which means the error in the result is larger than the error in either input.",
    mechanics: [
      {
        title: "Basal rate from a formula",
        body: "Mifflin-St Jeor is the common contemporary estimate of resting energy use: ten times weight in kilograms, plus 6.25 times height in centimetres, minus five times age, plus five for men. For a 40-year-old male at 81.65 kilograms and 177.8 centimetres that gives 1,733 kilocalories a day. Each formula is a fit to a population and carries individual error.",
      },
      {
        title: "The activity factor is the largest uncertainty",
        body: "Multiplying by 1.2 for sedentary gives 2,079; by 1.55 for moderate gives 2,686; by 1.725 for very active gives 2,989. The span between sedentary and very active is over 900 kilocalories — larger than the error in the basal formula, and it is the input people estimate least carefully, usually by describing their intended activity rather than their actual week.",
      },
      {
        title: "Why the number drifts",
        body: "Expenditure falls as weight falls, because moving and maintaining less mass costs less. A figure calculated at one weight becomes progressively too high as that weight changes, which is why an intake set from a single calculation stops producing the expected result after a few months.",
      },
    ],
    example: {
      title: "Worked example: a 40-year-old male, 81.65 kg, 177.8 cm",
      setup:
        "Weight 81.65 kilograms, height 177.8 centimetres, age 40. Mifflin-St Jeor for men: 10 x kg + 6.25 x cm - 5 x age + 5. Activity multipliers applied to that basal figure.",
      rows: [
        { label: "Basal metabolic rate", value: "1,733 kcal", note: "816.5 + 1111.25 - 200 + 5" },
        { label: "Sedentary, x1.2", value: "2,079 kcal", note: "little deliberate exercise" },
        { label: "Moderate, x1.55", value: "2,686 kcal", note: "3-5 sessions a week" },
        { label: "Very active, x1.725", value: "2,989 kcal", note: "6-7 sessions a week" },
        { label: "Gap, sedentary to very active", value: "910 kcal", note: "2989 - 2079" },
      ],
      conclusion:
        "The same person spans 2,079 to 2,989 kilocalories a day depending entirely on which activity multiplier is chosen. That 910-kilocalorie range is larger than the error in the basal formula, and it is decided by a description of a typical week rather than by measurement. The formula's precision is misleading: the result is only as good as the multiplier.",
    },
    mistakes: [
      {
        title: "Choosing the activity multiplier by intention",
        body: "The multiplier describes what the week actually contains, not what it is meant to contain. Overstating it produces a target that does not match the results it predicts.",
      },
      {
        title: "Treating the output as measured",
        body: "Two estimates are multiplied here, so the result carries both errors. It is a reasonable starting point to adjust from, not a measurement of your metabolism.",
      },
      {
        title: "Reusing a figure calculated at a different weight",
        body: "Expenditure falls as weight falls. An intake set from one calculation becomes too high as the body changes, which is why the plan appears to stop working.",
      },
    ],
  },
  "auto-loan-calculator": {
    intro:
      "An auto loan is not the sticker price divided by the months. Two things move the number before the loan starts — what is traded in and what is still owed on it — and a third moves it after: interest is charged on the outstanding balance, so the earliest payments recover almost none of it.",
    mechanics: [
      {
        title: "The payment formula",
        body: "Your payment comes from M = P x r / (1 - (1 + r)^-n), where P is the amount financed, r is the monthly rate (APR divided by 12) and n is the number of monthly payments. The formula knows nothing about the car's price, your trade-in or your credit score — only those three numbers. Every other part of the deal is a way of changing what gets put into them.",
      },
      {
        title: "The amount financed is where the deal is actually made",
        body: "Price plus sales tax plus documentation and title fees plus any negative equity carried from a previous loan, minus the down payment and minus the trade-in allowance, equals the amount financed. Dealers negotiate on the monthly payment because lengthening the term lowers the payment while raising the total cost. A $30,000 loan at 7% over 60 months is $594.04 a month; the same loan over 48 months is $718.39 but costs $1,159.57 less in interest.",
      },
      {
        title: "Interest does not accrue evenly",
        body: "Interest each month is the outstanding balance multiplied by the monthly rate. In month one on $30,000 at 7%, that is $175.00 — 29.5% of a $594.04 payment. The remaining $419.04 reduces the balance. As the balance falls the interest share falls with it, which is why paying ahead early is worth far more than the same amount paid late.",
      },
    ],
    example: {
      title: "Worked example: $30,000 at 7% over 60 months",
      setup:
        "Amount financed $30,000 — the loan, not the car price. APR 7%, so the monthly rate is 0.07 / 12 = 0.00583333. Term 60 months. No down payment is modelled because the loan amount is already given.",
      rows: [
        { label: "Monthly payment (P&I)", value: "$594.04", note: "30000 x 0.00583333 / (1 - (1.00583333)^-60)" },
        { label: "Interest in payment 1", value: "$175.00", note: "0.00583333 x 30000" },
        { label: "Principal in payment 1", value: "$419.04", note: "594.04 - 175.00" },
        { label: "Share of payment 1 that is interest", value: "29.5%", note: "175.00 / 594.04" },
        { label: "Total paid over 60 months", value: "$35,642.16", note: "594.04 x 60" },
        { label: "Total interest", value: "$5,642.16", note: "35642.16 - 30000" },
      ],
      conclusion:
        "You repay $35,642.16 on a $30,000 loan. Of the first payment, $419.04 — 70.5% — reduces what is owed, which is a better ratio than a mortgage gets because the term is short. Stretch the same $30,000 over 72 months and the payment falls while total interest rises; shorten it to 48 months and the payment rises while $1,159.57 of interest disappears. After the rate, the term is the largest lever in the deal.",
    },
    mistakes: [
      {
        title: "Negotiating the monthly payment instead of the price",
        body: "Almost any price can be made to fit a payment target by lengthening the term, so a dealer can meet the target while the total cost rises. Negotiate the price and the rate as two separate numbers, then look at the payment that term produces.",
      },
      {
        title: "Rolling negative equity in without seeing it as a cost",
        body: "If the trade-in is worth less than the old loan balance, the difference is added to the new amount financed — so interest is paid on a car that is no longer owned. It also raises the loan-to-value, which commonly raises the rate as well.",
      },
      {
        title: "Comparing a quoted rate to an APR",
        body: "A rate and an APR are different figures. The APR folds in fees, so it is the only number comparable across lenders; 6.9% APR and a 6.9% rate are different loans once a $700 origination fee is attached to one of them.",
      },
    ],
  },

  "concrete-calculator": {
    intro:
      "Concrete is ordered by volume, and volume is easy to get wrong because slab thickness is quoted in inches while plans and suppliers work in feet and cubic yards. Guessing low means a cold joint or a second pour; guessing high means paying for material that has to be dumped.",
    mechanics: [
      {
        title: "Length x width x depth, all in the same unit",
        body: "A slab 10 feet by 20 feet and 4 inches thick is 10 x 20 x (4 / 12) = 66.67 cubic feet. Concrete is sold by the cubic yard and there are 27 cubic feet in a yard, so the slab is 66.67 / 27 = 2.47 cubic yards before any allowance.",
      },
      {
        title: "Order a waste allowance, not the exact figure",
        body: "Depth varies across a graded site, formwork is never perfectly square, and some concrete stays in the chute. Five to ten percent covers it: 2.47 cubic yards plus 10% is 2.72. Rounding up to the next half yard is normal, because a short load cannot be topped up once the first pour has begun to set.",
      },
      {
        title: "Bags versus a ready-mix truck",
        body: "A ready-mix truck carries a minimum load, usually around one cubic yard, so small jobs are often bagged instead. An 80-pound bag yields about 0.6 cubic feet and a 60-pound bag about 0.45, so 66.67 cubic feet needs roughly 111 eighty-pound bags or 148 sixty-pound bags. At that count, the delivery minimum rather than the volume is what usually decides the method.",
      },
    ],
    example: {
      title: "Worked example: a 10 ft x 20 ft slab 4 inches thick",
      setup:
        "Length 10 feet, width 20 feet, thickness 4 inches. Convert the thickness to feet: 4 / 12 = 0.3333. One cubic yard is 27 cubic feet.",
      rows: [
        { label: "Slab volume", value: "66.67 cu ft", note: "10 x 20 x 0.3333" },
        { label: "Volume in cubic yards", value: "2.47 cu yd", note: "66.67 / 27" },
        { label: "With a 10% waste allowance", value: "2.72 cu yd", note: "2.469 x 1.10" },
        { label: "80 lb bags if mixing by hand", value: "111 bags", note: "66.67 / 0.6" },
        { label: "60 lb bags if mixing by hand", value: "148 bags", note: "66.67 / 0.45" },
      ],
      conclusion:
        "The slab needs 2.47 cubic yards, or 2.72 with a ten percent allowance. That is small enough to be bagged rather than delivered — 111 eighty-pound bags — which is exactly the comparison that decides the method: not the volume, but the delivery minimum against the number of bags and the time to mix them.",
    },
    mistakes: [
      {
        title: "Multiplying inches by feet",
        body: "Thickness arrives in inches while length and width arrive in feet. Multiplying 10 x 20 x 4 gives 800, which is neither cubic feet nor cubic yards. Convert every dimension to one unit before multiplying.",
      },
      {
        title: "Dividing by 27 too early",
        body: "The 27 divisor converts cubic feet to cubic yards, so it only works once all three dimensions are in feet. Applying it before converting the thickness produces a volume that looks plausible and is wrong by a factor of twelve.",
      },
      {
        title: "Measuring the visible slab only",
        body: "Footings, steps and thickened edges are separate pours with separate volumes. Measuring only the flat slab understates the order, which is how an under-ordered day ends in a cold joint.",
      },
    ],
  },

  "credit-card-payoff-calculator": {
    intro:
      "A credit card minimum payment is calculated to keep the account open, not to close it. On a typical balance at a typical rate it recovers almost none of the principal, so the schedule that clears the debt and the schedule the issuer sets are two different things.",
    mechanics: [
      {
        title: "Interest posts before the payment is applied",
        body: "The monthly periodic rate is the APR divided by 12. On $5,000 at 22%, that is 0.22 / 12 = 0.018333, or $91.67 of interest in the first month. Because interest is added first, a payment below $91.67 increases the balance even though money was paid.",
      },
      {
        title: "A minimum is a percentage with a floor",
        body: "Issuers commonly set it at 2 to 3 percent of the balance with a dollar floor such as $25. On $5,000 at 2.5% the minimum is $125.00 — above that month's interest, so the balance falls, but only by about $33. As the balance shrinks the minimum shrinks with it, which is precisely why the schedule stretches out.",
      },
      {
        title: "The fixed payment is the variable that matters",
        body: "Interest depends on the balance and the rate; the balance depends on the payment. Raising the payment shortens the term disproportionately, because every month of interest not charged is also principal repaid earlier. A payment held constant as a dollar figure defeats the shrinking-minimum effect entirely.",
      },
    ],
    example: {
      title: "Worked example: $5,000 at 22% APR under three plans",
      setup:
        "Balance $5,000. APR 22%, so the monthly rate is 0.22 / 12 = 0.018333. Three plans compared: the issuer's 2.5% minimum, a fixed $150 a month, and a fixed $500 a month.",
      rows: [
        { label: "Month 1 interest", value: "$91.67", note: "5000 x 0.018333" },
        { label: "2.5% minimum payment", value: "$125.00", note: "5000 x 0.025" },
        { label: "Month 1 principal at the minimum", value: "$33.33", note: "125.00 - 91.67" },
        { label: "Payoff at $150 a month", value: "52 months", note: "fixed-payment amortisation" },
        { label: "Total paid at $150 a month", value: "$7,800.00", note: "150 x 52" },
        { label: "Total interest at $150 a month", value: "$2,800.00", note: "7800 - 5000" },
        { label: "Payoff at $500 a month", value: "12 months", note: "same formula" },
        { label: "Total interest at $500 a month", value: "$1,000.00", note: "6000 - 5000" },
      ],
      conclusion:
        "At $150 a month the balance takes 52 months and costs $2,800 in interest — more than half the original balance again. At $500 a month it takes 12 months and costs $1,000. Tripling the payment does not shorten the schedule by two thirds; it removes $1,800 of interest, because the later years of the slow schedule are almost entirely interest.",
    },
    mistakes: [
      {
        title: "Reading a falling balance as fast progress",
        body: "A minimum payment does reduce the balance, so it looks like movement. The reduction is the payment minus a full month of interest, which at these rates is a small fraction of the amount paid.",
      },
      {
        title: "Judging a balance-transfer offer on the promotional rate alone",
        body: "A transfer fee of around 3% is charged up front on the whole amount, and the promotional rate ends on a set date. Interest on whatever remains at the standard rate after that date can exceed the fee that was saved.",
      },
      {
        title: "Assuming the payment posts before interest for the month",
        body: "The month's interest is charged on the balance, not on a balance already reduced by a payment that has not yet posted. Timing within the cycle changes the figure at the margin.",
      },
    ],
  },

  "debt-snowball-calculator": {
    intro:
      "Debt payoff order is the most argued-about and least important part of getting out of debt. The order decides a small amount of interest; the total monthly payment decides how long the whole thing takes, and that is the larger number by an order of magnitude.",
    mechanics: [
      {
        title: "Two orderings, one arithmetic difference",
        body: "Snowball pays the smallest balance first and rolls each cleared payment into the next. Avalanche pays the highest interest rate first. Both send the same total amount every month; they differ only in which debt receives the surplus, so the difference between them is the rate spread on that surplus, applied for as long as it lasts.",
      },
      {
        title: "The surplus is what changes the schedule",
        body: "Minimums of $25.00 on a $500 balance and $60.00 on a $3,000 balance come to $85 of a $285 monthly outlay, leaving $200. Sending that $200 to a 24% debt instead of an 18% one avoids 200 x (0.24 - 0.18) / 12 = $1.00 of interest in the first month. Avalanche wins on arithmetic, and the win is small per month.",
      },
      {
        title: "Why the smaller-balance method still works for people",
        body: "Clearing a balance entirely removes its minimum from the schedule, which frees cash and produces a visible result. A method followed to completion beats an optimal method abandoned in month four. The calculator's job is to show the size of the trade, not to settle the argument.",
      },
    ],
    example: {
      title: "Worked example: one month, two debts, a $200 surplus",
      setup:
        "Debt A: $500 at 18%. Debt B: $3,000 at 24%. Minimum payments of 2% of the balance with a $25 floor. A $200 surplus is available on top of the minimums. Only the first month is shown, because the ordering decision is made once and then repeats.",
      rows: [
        { label: "Debt A monthly interest", value: "$7.50", note: "500 x 0.18 / 12" },
        { label: "Debt B monthly interest", value: "$60.00", note: "3000 x 0.24 / 12" },
        { label: "Minimums due", value: "$85.00", note: "25.00 + 60.00" },
        { label: "Total monthly outlay", value: "$285.00", note: "85 + 200 surplus" },
        { label: "Interest avoided by aiming the surplus at B", value: "$1.00", note: "200 x (0.24 - 0.18) / 12" },
        { label: "Share of the outlay that is interest", value: "23.7%", note: "67.50 / 285" },
      ],
      conclusion:
        "Aiming the $200 surplus at the 24% debt instead of the 18% debt avoids exactly $1.00 a month more in interest. That is the entire arithmetic difference between snowball and avalanche at a six-point spread. The $285 outlay is what closes the accounts: $67.50 of it is interest in month one, and only a larger payment or a lower rate changes that materially.",
    },
    mistakes: [
      {
        title: "Treating the ordering choice as the decision that matters",
        body: "At a six-point rate spread the surplus saves about half a percent a month. The size of the surplus and the rate on the largest balance dominate the arithmetic far more than the order does.",
      },
      {
        title: "Counting payments made as progress",
        body: "Every minimum includes that month's interest, so part of each payment goes nowhere. Measuring progress by what has been paid rather than by how much the balance fell overstates it.",
      },
      {
        title: "Closing an account the moment it clears",
        body: "Closing a cleared card is not required and changes how the remaining balances are reported, because the combined utilisation is measured against the total available limit.",
      },
    ],
  },

  "home-affordability-calculator": {
    intro:
      "What a lender will approve and what a household can carry are two different figures. The affordability rules describe the first one, and they are ratios rather than advice: the same income supports a very different payment depending on existing debt, local taxes and how much is put down.",
    mechanics: [
      {
        title: "Two ratios, one for housing and one for everything",
        body: "The front-end ratio compares housing cost to gross monthly income, and 28% is the conventional cap. The back-end ratio compares all debt payments — housing plus car, student loans and minimum card payments — and uses 36%. Housing alone at 28% is the ceiling until other debt exists, at which point the back-end ratio binds first.",
      },
      {
        title: "Housing cost is not the mortgage payment",
        body: "Principal and interest is one component. Property tax, homeowners insurance, mortgage insurance when the down payment is under 20%, and any HOA dues are added to it, and the ratio applies to the total. A high-tax county therefore consumes the cap with dollars that build no equity.",
      },
      {
        title: "A larger down payment changes two things at once",
        body: "It lowers the loan and so the payment, and it can remove mortgage insurance entirely. Below 20% down, mortgage insurance is calculated on the loan amount and added to the monthly cost, so the ratio is squeezed from both directions at once.",
      },
    ],
    example: {
      title: "Worked example: $100,000 income and a $300,000 house",
      setup:
        "Gross monthly income $100,000 / 12 = $8,333.33. The 28% front-end cap is $2,333.33. House price $300,000 with 20% down, so the loan is $240,000 at 6.5% over 30 years. Property tax assumed at 1.2% of price a year and insurance $1,500 a year.",
      rows: [
        { label: "Gross monthly income", value: "$8,333.33", note: "100000 / 12" },
        { label: "Front-end cap at 28%", value: "$2,333.33", note: "8333.33 x 0.28" },
        { label: "Principal and interest", value: "$1,516.96", note: "240000 x 0.00541667 / (1 - (1.00541667)^-360)" },
        { label: "Property tax per month", value: "$300.00", note: "300000 x 0.012 / 12" },
        { label: "Insurance per month", value: "$125.00", note: "1500 / 12" },
        { label: "Total housing cost", value: "$1,941.96", note: "1516.96 + 300 + 125" },
        { label: "Headroom under the cap", value: "$391.37", note: "2333.33 - 1941.96" },
        { label: "Maximum price at this cap", value: "$364,619", note: "price where total housing cost equals 2333.33" },
      ],
      conclusion:
        "A $300,000 house costs $1,941.96 a month all-in on these assumptions — 23.3% of gross income, under the 28% cap, with $391.37 of headroom. That headroom supports a price of about $364,619. Add a $420 car payment and the back-end ratio becomes the binding one: 36% of gross is $3,000.00, housing must fall to $2,580.00, and the maximum price moves down with it.",
    },
    mistakes: [
      {
        title: "Applying the ratio to principal and interest alone",
        body: "The 28% covers tax and insurance as well. In a high-tax area those alone can run several hundred dollars a month, so ignoring them overstates affordability by roughly the amount they add.",
      },
      {
        title: "Using take-home pay in the ratio",
        body: "Both ratios are defined against gross income. Substituting net pay produces a number that looks prudent but is not the one a lender will use, and it understates the approval.",
      },
      {
        title: "Reading the approved maximum as a comfortable payment",
        body: "The ratio is a lending limit, not a household budget. It leaves no room for the costs a home adds and an apartment does not — maintenance, utilities and a longer commute among them.",
      },
    ],
  },

  "overtime-calculator": {
    intro:
      "Overtime is calculated on the regular rate of pay for hours worked past 40 in a workweek, and both halves of that sentence cause disputes: which hours count, and what the regular rate actually is.",
    mechanics: [
      {
        title: "Forty hours in a workweek, not per day",
        body: "The threshold is 40 hours in a fixed seven-day workweek. Working 12 hours on Monday does not trigger overtime by itself; working 44 hours across the week does, and only the four hours past 40 carry the premium. The workweek is an employer-defined seven-day period and is not necessarily the calendar week.",
      },
      {
        title: "Time and a half applies to the regular rate",
        body: "The regular rate is total non-overtime pay divided by the hours it covers, not the hourly wage on its face. It includes most non-discretionary bonuses, shift differentials and commissions. A worker paid $20 an hour for one role and $25 for another therefore has a blended regular rate and a blended overtime rate.",
      },
      {
        title: "The premium is half, not a separate full rate",
        body: "The extra cost of an overtime hour is half the regular rate, because the hour is already being paid at the straight rate within the weekly total. For someone on $25.00 an hour the premium is $12.50, which takes the overtime hour to $37.50.",
      },
    ],
    example: {
      title: "Worked example: $25 an hour, 50 hours in one workweek",
      setup:
        "Straight-time rate $25.00. Hours in the workweek: 50, of which 40 are straight time and 10 are past the threshold. The overtime rate is 1.5 times the regular rate.",
      rows: [
        { label: "Straight-time pay for 40 hours", value: "$1,000.00", note: "40 x 25.00" },
        { label: "Overtime rate", value: "$37.50", note: "25.00 x 1.5" },
        { label: "Pay for 10 overtime hours", value: "$375.00", note: "10 x 37.50" },
        { label: "Total gross pay", value: "$1,375.00", note: "1000 + 375" },
        { label: "Effective average rate", value: "$27.50", note: "1375 / 50" },
        { label: "Of which the overtime premium", value: "$125.00", note: "10 x 12.50" },
      ],
      conclusion:
        "Fifty hours at $25.00 produces $1,375.00, an effective $27.50 an hour. The premium itself is $125.00: the ten hours are already paid at the straight rate within the weekly total and the premium adds half again on top. Multiplying 50 x $25.00 x 1.5 would give $1,875.00, which is wrong — the multiplier applies only to the hours past the threshold.",
    },
    mistakes: [
      {
        title: "Applying 1.5 to every hour worked",
        body: "That overstates the pay by the premium on the first 40 hours. Only the hours past the threshold carry the multiplier; the rest are paid straight.",
      },
      {
        title: "Treating the calendar week as the workweek",
        body: "An employer may start the workweek on any day, and hours do not average across two weeks. A 30-hour week followed by a 50-hour week is not two 40-hour weeks; the second owes ten hours of overtime.",
      },
      {
        title: "Excluding bonuses from the regular rate",
        body: "Non-discretionary bonuses and shift differentials are generally part of the regular rate, so overtime computed on the base wage alone understates what is owed.",
      },
    ],
  },

  "self-employment-tax-calculator": {
    intro:
      "Self-employment tax is the employee and employer halves of Social Security and Medicare, both paid by one person. The rate looks like double the payroll figure, and one deduction takes part of it back.",
    mechanics: [
      {
        title: "The base is 92.35% of net profit, not 100%",
        body: "The law treats 7.65% of net profit as though it were the employer half and taxes the remainder. The taxable base is therefore net profit x 0.9235, and the rate applied to that base is 15.3% — 12.4% for Social Security and 2.9% for Medicare. The two steps together produce an effective 14.13% of net profit.",
      },
      {
        title: "The Social Security part has a ceiling; Medicare does not",
        body: "Social Security tax stops once wages plus self-employment income reach the annual wage base. Medicare has no ceiling, and an additional 0.9% applies to earned income above a high threshold. Which of those binds depends entirely on how much is earned, so the calculator rather than a rule of thumb is the right instrument.",
      },
      {
        title: "Half of the tax is deductible above the line",
        body: "The employer-equivalent half — 7.65% of net profit — is deducted from gross income whether or not itemised deductions are used. It reduces income tax, not self-employment tax, and it is why the combined burden is lower than the headline rate suggests.",
      },
    ],
    example: {
      title: "Worked example: $80,000 of net self-employment profit",
      setup:
        "Net profit $80,000 — gross receipts less ordinary business expenses. It is below the Social Security wage base, so the 12.4% portion applies to the whole base. No other wages.",
      rows: [
        { label: "Net profit", value: "$80,000.00", note: "starting point" },
        { label: "Taxable base at 92.35%", value: "$73,880.00", note: "80000 x 0.9235" },
        { label: "Social Security at 12.4%", value: "$9,161.12", note: "73880 x 0.124" },
        { label: "Medicare at 2.9%", value: "$2,142.52", note: "73880 x 0.029" },
        { label: "Total self-employment tax", value: "$11,303.64", note: "9161.12 + 2142.52" },
        { label: "Effective rate on net profit", value: "14.13%", note: "11303.64 / 80000" },
        { label: "Above-the-line deduction", value: "$5,651.82", note: "11303.64 / 2" },
      ],
      conclusion:
        "On $80,000 of net profit the self-employment tax is $11,303.64 — 14.13% of profit rather than 15.3%, because of the 92.35% base. Half of it, $5,651.82, is deductible against income tax. The arithmetic scales exactly: $40,000 of net profit carries $5,651.82 of self-employment tax and a $2,825.91 deduction. The ceiling only enters once the base passes the annual wage base.",
    },
    mistakes: [
      {
        title: "Applying 15.3% directly to net profit",
        body: "That ignores the 92.35% base and overstates the tax. On $80,000 the two methods differ by $936.36 a year.",
      },
      {
        title: "Treating the deduction as a reduction of the tax itself",
        body: "The half-deduction lowers taxable income for income tax purposes. It does not reduce the self-employment tax, which is calculated first and in full.",
      },
      {
        title: "Blending two taxes with two different rules",
        body: "Social Security has a ceiling and Medicare does not. A single blended rate produces a wrong figure above the wage base, where only the Medicare portion continues to apply.",
      },
    ],
  },

  "social-security-calculator": {
    intro:
      "A Social Security benefit is two calculations stacked: an average of the highest earning years, converted through a progressive formula, then adjusted for the age it is claimed. The first is fixed by the earnings record; the second is the part still under control.",
    mechanics: [
      {
        title: "The benefit is built from an indexed career average",
        body: "Each year's earnings are indexed to the national average wage level, then the highest 35 years are averaged and divided by 12 to give the average indexed monthly earnings. Years with no earnings — early retirement, caregiving, unemployment — count as zero in that 35-year set, which is why extra working years can raise a benefit even late in a career.",
      },
      {
        title: "The formula applies percentages to bands, not to the whole average",
        body: "The average indexed monthly earnings figure is split at fixed bend points. The lowest band receives the highest replacement percentage, the middle band a lower one, and everything above the top bend point a lower one still. The result is the primary insurance amount — the figure quoted for claiming at full retirement age.",
      },
      {
        title: "Claiming age multiplies, it does not add",
        body: "Claiming early reduces the primary insurance amount permanently: 5/9 of 1% a month for the first 36 months early and 5/12 of 1% for each month beyond. Claiming at 62 against a full retirement age of 67 is a 30% reduction. Delaying past full retirement age adds 2/3 of 1% a month — 8% a year — up to age 70, so the same record can produce a benefit 24% larger.",
      },
    ],
    example: {
      title: "Worked example: a $2,000 full-retirement-age benefit claimed at three ages",
      setup:
        "Primary insurance amount $2,000 a month at a full retirement age of 67. Three claiming ages compared. The percentages are the statutory adjustments; the base figure comes from the earnings record.",
      rows: [
        { label: "Claim at 62", value: "$1,400.00", note: "2000 x 0.70, a 30% reduction" },
        { label: "Claim at 67 (full retirement age)", value: "$2,000.00", note: "the primary insurance amount" },
        { label: "Claim at 70", value: "$2,480.00", note: "2000 x 1.24, 8% a year for 36 months" },
        { label: "Monthly difference, 62 against 70", value: "$1,080.00", note: "2480 - 1400" },
        { label: "Payments given up by waiting from 62 to 70", value: "$134,400", note: "1400 x 12 x 8" },
        { label: "Years at $1,080 more to recover the wait", value: "10.4", note: "134400 / (1080 x 12)" },
      ],
      conclusion:
        "The same earnings record produces $1,400, $2,000 or $2,480 depending only on when it is claimed. Waiting from 62 to 70 forgoes $134,400 of payments and adds $1,080 a month; at that rate the wait takes 10.4 years to recover. The arithmetic is exact, but whether ten years is a reasonable bet depends on circumstances the calculator cannot see.",
    },
    mistakes: [
      {
        title: "Comparing claiming ages on the monthly amount alone",
        body: "The break-even depends on how long payments continue, so the comparison turns on a factor that is not in the calculation. The monthly figures are exact; the conclusion drawn from them is not.",
      },
      {
        title: "Assuming the reduction and the credit are symmetrical",
        body: "They are not. Four years early costs 25% at these ages, while four years late adds about 32%. The same four years is not worth the same in both directions.",
      },
      {
        title: "Ignoring work after claiming",
        body: "Earnings after claiming before full retirement age can temporarily reduce benefits under the earnings test, while additional years of earnings can raise the underlying average at the same time. The two effects pull in opposite directions.",
      },
    ],
  },

  "tip-calculator": {
    intro:
      "A tip is a percentage of the bill, and the two things that go wrong are the base it is taken from and the rounding. Both are small per transaction and both change what the service worker actually receives.",
    mechanics: [
      {
        title: "The base is the amount before tax",
        body: "Sales tax is not part of the service, so a tip calculated on the post-tax total is larger than the percentage suggests. On a $64.50 bill with 8% tax the tax is $5.16, and a 20% tip on the total is $13.93 against $12.90 on the pre-tax amount — $1.03 more, an effective 21.6% of the pre-tax bill.",
      },
      {
        title: "Moving the decimal is the fast method",
        body: "Ten percent is the amount shifted one place, which is $6.45 on a $64.50 bill. Half of that is 5%, and doubling it is 20%. Any rate in the usual range is a combination of those, so the arithmetic does not need a calculator at the table.",
      },
      {
        title: "Splitting decides who absorbs the rounding",
        body: "Dividing a tip evenly rarely lands on a whole cent. Whether the group rounds up or down decides whether the shortfall falls on the server or on the diners, and the difference compounds across a shift.",
      },
    ],
    example: {
      title: "Worked example: a $64.50 bill at four rates",
      setup:
        "Pre-tax bill $64.50. Each percentage is applied to the pre-tax amount. The 10% figure is the bill shifted one decimal place, and the others are built from it.",
      rows: [
        { label: "10% (the anchor)", value: "$6.45", note: "64.50 / 10" },
        { label: "15% tip", value: "$9.68", note: "64.50 x 0.15" },
        { label: "18% tip", value: "$11.61", note: "64.50 x 0.18" },
        { label: "20% tip", value: "$12.90", note: "64.50 x 0.20, the 10% figure doubled" },
        { label: "Total with a 20% tip", value: "$77.40", note: "64.50 + 12.90" },
        { label: "20% tip split four ways", value: "$3.23", note: "12.90 / 4" },
        { label: "Total each, split four ways", value: "$19.35", note: "77.40 / 4" },
      ],
      conclusion:
        "The tip moves from $9.68 to $14.19 as the rate goes from 15% to 22%, a range of $4.51 on a $64.50 bill. Split four ways, the difference between 15% and 20% is about 81 cents a person. What matters is applying the rate to the pre-tax amount and agreeing the rounding before the card is handed over, because a tip entered as a total that does not match the written percentage is the error that gets corrected afterwards.",
    },
    mistakes: [
      {
        title: "Calculating on the post-tax total",
        body: "Tax is a government charge, not a service. Tipping on it inflates the tip by the tax rate applied to the bill — about 1.6 percentage points of the pre-tax amount at an 8% sales tax.",
      },
      {
        title: "Entering the tip on the wrong base in a card terminal",
        body: "Some terminals prompt for a percentage of the post-tax total while printing the pre-tax figure as the amount. Reading the wrong line produces a tip that does not match the intended rate.",
      },
      {
        title: "Rounding a split without deciding who absorbs it",
        body: "Four people splitting $12.90 cannot each pay $3.225. Rounding each share down leaves the group short; rounding up charges more than the bill. Either is defensible, but it should be chosen rather than left to whoever reads the total.",
      },
    ],
  },
};
