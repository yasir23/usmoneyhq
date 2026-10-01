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
};
