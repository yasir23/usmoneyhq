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
};
