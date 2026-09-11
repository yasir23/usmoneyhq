/**
 * Guide-level FAQ content.
 *
 * These are deliberately DIFFERENT questions from the ones in each guide's
 * embedded calculator (lib/tools.ts -> tool.faq). Before this existed, every
 * guide re-rendered the calculator's Q&A verbatim, which made the guide compete
 * with its own tool page for the same queries and added no FAQPage markup.
 *
 * Rule of thumb when adding a guide: ask what a reader who has already decided
 * to act needs to know (strategy, sequencing, what to expect), not what the
 * calculator inputs mean — that is the tool page's job.
 */

export type GuideFaqItem = { q: string; a: string };

export const GUIDE_FAQ: Record<string, GuideFaqItem[]> = {
  "mortgage-calculator-guide": [
    {
      q: "How much of my first mortgage payment actually goes to interest?",
      a: "On a $400,000 loan at 6.5% over 30 years, the first payment is about $2,528 and roughly $2,167 of it is interest — about 86%. Principal doesn't overtake interest until around year 19, which is why early extra payments save so much more than later ones.",
    },
    {
      q: "Is one extra payment a year better than paying biweekly?",
      a: "They do the same thing. One extra full payment per year retires a 30-year loan in roughly 25-26 years and removes most of the interest. Biweekly billing just automates it, so pick whichever your servicer handles without adding a fee.",
    },
    {
      q: "Should I recast, refinance, or just pay extra?",
      a: "Paying extra cuts the balance and the total interest but leaves the required payment unchanged. A recast lowers the required payment, usually for a small flat fee. Refinancing replaces the loan outright — only worth it if the new rate beats your current one by about 0.75% or more and you will stay past the break-even month.",
    },
    {
      q: "Do I need to compare more than one lender?",
      a: "Yes — the same borrower is routinely quoted rates half a point apart in the same week. Get three quotes inside a 14-day window, because mortgage credit pulls in that window count as one inquiry for scoring purposes, so shopping costs you nothing.",
    },
  ],

  "401k-guide": [
    {
      q: "How much do I need to put in to retire with a million dollars?",
      a: "About $600 a month from age 30 at a 7% return reaches roughly $1M by 65. Starting at 40 instead takes closer to $1,250 a month for the same target — waiting a decade costs you more than double per month.",
    },
    {
      q: "What happens to my 401k when I change jobs?",
      a: "You can leave it, roll it into the new plan, or roll it to an IRA. Rolling to an IRA often means lower fees and a wider fund menu, but it can complicate backdoor Roth contributions later — check that before you move a large balance.",
    },
    {
      q: "Is contributing 6% enough?",
      a: "6% plus a 50% employer match is 9% of gross, which is below the 10-15% most planners recommend but a reasonable start. The floor is always the full employer match — contributing less than that gives up guaranteed money.",
    },
    {
      q: "Does my 401k balance count for anything besides retirement?",
      a: "Yes, in three ways: it shelters income from creditors in most bankruptcies, it doesn't count as an asset in the federal college aid formula, and it can be borrowed against if your plan allows — though an unpaid loan becomes a taxable distribution if you leave the job.",
    },
  ],

  "529-guide": [
    {
      q: "How much should I save per month for college?",
      a: "A four-year in-state public degree runs roughly $110,000-$120,000 all-in today and a private one roughly $260,000. From birth, about $300 a month at a 6% return lands near $115,000 by age 18; starting at age 6, the same goal needs closer to $500 a month.",
    },
    {
      q: "What happens to the money if my child skips college?",
      a: "Nothing is lost. The money can go to any eligible school — trade and vocational programs, apprenticeships, and many foreign universities all qualify — and you can change the beneficiary to a sibling or to yourself. Unused balances can also roll to the beneficiary's Roth IRA (lifetime cap, and the account must have been open 15 years).",
    },
    {
      q: "Do 529 plans hurt financial aid?",
      a: "Far less than most people think. A parent-owned 529 is reported as a parental asset and assessed at a maximum of 5.64% of its value in the federal formula, versus 20% for a student-owned account. Keep the account in the parent's name.",
    },
    {
      q: "Should I fund a 529 before a Roth IRA?",
      a: "No — get the full 401k match, then fill a Roth IRA, then fund the 529. Retirement has no other funding source and no loans; college does have loans, scholarships, and work-study. Once retirement is on track, a 529 beats a custodial brokerage account for education money because the growth is tax-free while the parent keeps control of the account.",
    },
  ],

  "health-fitness-guide": [
    {
      q: "How long does losing 10 pounds realistically take?",
      a: "A 500-calorie daily deficit is about a pound a week, so 10 pounds takes roughly 10-12 weeks after the first week's water weight flushes out. Any plan promising 10 pounds in two weeks is selling water loss, not fat loss.",
    },
    {
      q: "Do I have to track calories forever?",
      a: "No. Track for two to three weeks to learn what your normal portions actually cost, then spot-check a few days a month. After that, weigh yourself weekly and adjust one habit — protein at breakfast, late-night eating, or daily steps — rather than logging every meal.",
    },
    {
      q: "Is cardio or strength training better for fat loss?",
      a: "Both, for different reasons. Strength training protects the muscle you already have while you're eating less; cardio burns more calories per minute. Three strength sessions a week plus 8,000-10,000 daily steps captures most of the benefit of doing either one alone.",
    },
    {
      q: "Will my weight loss stall even if I'm doing everything right?",
      a: "Yes, and it isn't failure. As you lose weight, your maintenance calories fall, so the same intake that created a deficit becomes break-even. Two weeks of no scale movement is the signal to lower intake slightly or add movement — not to quit or to cut calories drastically.",
    },
  ],

  "debt-payoff-guide": [
    {
      q: "Should I save money or pay off debt first?",
      a: "Keep one month of expenses in cash, then send everything else at the highest-rate balance. Paying off a 22% credit card is a guaranteed 22% return, and no investment offers that with certainty.",
    },
    {
      q: "Should I empty my emergency fund to kill a card?",
      a: "Only down to about one month of expenses. Draining it to zero is the single most common way people end up back in card debt a few months later, usually over a car repair or a medical bill that arrives right after.",
    },
    {
      q: "Does a balance transfer actually help?",
      a: "It helps if you clear the balance inside the 0% window and treat the interest you're no longer paying as extra principal. It backfires when the 3-5% transfer fee gets rolled into the balance and the promo window closes with debt still on the card.",
    },
    {
      q: "How fast does paying down debt change my credit score?",
      a: "Utilization is about 30% of your FICO score and it refreshes every statement, so getting each card under 30% — then under 10% — is usually worth more points than anything else you can change within a month. Payment history matters more, but it moves slowly.",
    },
  ],

  "debt-snowball-guide": [
    {
      q: "How many debts do I need before the snowball method matters?",
      a: "Two is enough to run it; four or more is where the order starts making a visible difference. The method only changes which balance gets the extra money — every minimum gets paid either way.",
    },
    {
      q: "What if one of my debts is a 0% promotional balance?",
      a: "Pay it last regardless of size, and pay only the minimum while the 0% holds. Write the end date down somewhere you will see it: a promotional balance that isn't cleared by then re-prices to 20%+ overnight and can undo months of progress.",
    },
    {
      q: "Do I roll in the whole old payment or just the extra?",
      a: "The whole payment. When a debt is gone, everything you were sending it — minimum plus extra — moves to the next balance. Rolling in only part of it means each payoff speeds up the next debt less than it should.",
    },
    {
      q: "Is the snowball still worth it if the smallest debt has the lowest rate?",
      a: "Yes, if quitting is your risk. Snowball finishes accounts sooner, which is why people stick with it longer; avalanche saves more interest but the first win can be a year away. The best method is the one you don't abandon in month four.",
    },
  ],

  "home-improvement-guide": [
    {
      q: "How much should I budget on top of the contractor's estimate?",
      a: "Add 15-20% for planned work and 30% if walls or systems are being opened, because the surprises live behind drywall. A $20,000 kitchen realistically lands at $23,000-$26,000 once something unexpected turns up.",
    },
    {
      q: "Which projects actually pay back at resale?",
      a: "Garage doors, entry doors, insulated siding, and modest kitchen or bath refreshes recover the largest share of their cost — often 60-100%. Pools, room additions, and high-end finishes recover the least per dollar spent.",
    },
    {
      q: "Should I DIY or hire this out?",
      a: "DIY pays best on painting, tiling, landscaping, and demolition, where labor is a big share of the bill and a mistake is cheap to fix. Hire out electrical, plumbing, roofing, and anything structural — those mistakes can cost several times what the labor would have.",
    },
    {
      q: "Will renovating raise my property taxes?",
      a: "Not automatically. Most assessors revalue on sale or when a permit is pulled, and many states cap how much the assessment can rise in a year. Pull the permit anyway — unpermitted work surfaces at sale and is far more expensive to resolve than the tax would have been.",
    },
  ],

  "how-much-house-can-i-afford": [
    {
      q: "What if the bank approves me for more than I should spend?",
      a: "Pre-approval measures debt capacity, not your budget. Lenders will often go to a 43-45% debt-to-income ratio, and spending that leaves nothing for retirement, repairs, or a bad month. Treat the 28% housing guideline as the ceiling and the approval as the credit limit.",
    },
    {
      q: "How much do I need beyond the down payment?",
      a: "Closing costs run 2-5% of the purchase price, and ownership costs about 1-2% of the price per year for taxes, insurance, maintenance, and any HOA dues. On a $400,000 home, budget roughly $12,000 at closing and $5,000-$8,000 a year after that.",
    },
    {
      q: "Does a bigger down payment or a lower rate help more?",
      a: "On a $400,000 home, adding 5% to the down payment cuts the monthly payment more than a half-point rate reduction — and it avoids PMI, which a rate cut does not. A lower rate wins once you already have 20% down and can refinance later if rates fall further.",
    },
    {
      q: "What income do I need for a $500,000 house?",
      a: "At the 28% guideline with 20% down and no other debt, a $500,000 home takes roughly $135,000-$145,000 of gross income at today's rates. Every $500 a month of existing car, student, or card payments pushes that requirement up by about $20,000.",
    },
  ],

  "salary-after-tax-guide": [
    {
      q: "Why does my take-home change partway through the year?",
      a: "Social Security tax stops once your wages pass the annual wage base, so high earners see noticeably larger checks late in the year. The opposite surprise — a smaller check — usually means a bonus landed, since bonuses are withheld at a flat supplemental rate that may not match your real bracket.",
    },
    {
      q: "Should I claim zero allowances for a bigger refund?",
      a: "The allowance system is gone; the current W-4 uses dollar amounts. Withholding extra only buys you a bigger refund, which means you lent the IRS your money interest-free all year. Aim for break-even and keep the cash.",
    },
    {
      q: "How much does a 401k contribution lower my take-home pay?",
      a: "Less than the amount you contribute, because pretax dollars are discounted by your marginal tax rate. Putting in $6,000 a year typically reduces take-home by roughly $4,000-$4,500 for someone in the 22-24% federal bracket plus state tax.",
    },
    {
      q: "Can a raise actually leave me with less?",
      a: "Rarely in take-home pay, and never because of the tax brackets — only the dollars above each threshold are taxed at the higher rate. It can happen at benefit cliffs, where a raise ends an ACA subsidy, raises an income-driven student loan payment, or phases out a credit by more than the raise adds.",
    },
  ],

  "tax-refund-guide": [
    {
      q: "How long should my refund take?",
      a: "E-filed with direct deposit, most refunds arrive in 10-21 days. A paper return takes six weeks or more. If you claim the Earned Income Tax Credit or the Additional Child Tax Credit, the IRS is legally barred from releasing the refund before mid-February no matter how early you filed.",
    },
    {
      q: "How do I check on my refund?",
      a: "Use the IRS Where's My Refund tool, which updates once every 24 hours and needs your SSN, filing status, and the exact refund amount from your return. If it still shows only \"return received\" 21 days after e-filing, that is the point to call.",
    },
    {
      q: "Are refund advances or same-day refund loans worth it?",
      a: "No. Those products cost the equivalent of 20-40% annualized for money the IRS was already going to send you, and the fee often comes straight out of the refund. E-file free and wait the three weeks instead.",
    },
    {
      q: "How do I make next year's refund smaller?",
      a: "File a new W-4 and put a dollar amount in Step 4(c) for extra withholding, or claim the credits and deductions you expect. Aim for a refund under a few hundred dollars — that means you kept your own cash all year while still staying clear of an underpayment penalty.",
    },
  ],

  "rmd-guide": [
    {
      q: "What happens if I miss an RMD?",
      a: "The penalty is 25% of the amount you should have withdrawn, reduced to 10% if you correct it within the correction window. The IRS has been forgiving of first-time misses, but that relief is discretionary — fix it immediately rather than waiting to see if it's waived.",
    },
    {
      q: "Can I delay my first RMD to the next year?",
      a: "Yes, but only for the first one, and only until April 1 of the following year. That usually means taking two distributions in the same tax year, which can push you into a higher bracket or trigger Medicare IRMAA surcharges two years later — often worse than taking the first one on time.",
    },
    {
      q: "Do Roth accounts have required distributions?",
      a: "Roth IRAs have no lifetime RMDs for the owner, and Roth accounts inside employer plans no longer require them either. If you hold a large traditional balance, that is what makes partial Roth conversions in low-income years worth modeling.",
    },
    {
      q: "How do RMDs affect my Medicare premiums?",
      a: "Medicare surcharges are based on income from two years earlier, so a large RMD year raises your Part B and Part D premiums two years later. A qualified charitable distribution sent straight from the IRA can satisfy the RMD without adding to your taxable income, which is why it is a common lever for people who don't need the cash.",
    },
  ],

  "investing-basics-guide": [
    {
      q: "What is the difference between saving and investing?",
      a: "Timing. Money you need within about five years belongs in savings — a market drop can't be waited out on a short deadline. Money you won't touch for a decade belongs in investments, where short-term drops are noise that compounding survives.",
    },
    {
      q: "How much money do I need to start investing?",
      a: "Practically nothing. Most brokers have no account minimum, and fractional shares mean $50 can buy a slice of a broad index fund. The monthly amount matters far less than the automation — a small automatic contribution keeps buying through the drops that scare people out.",
    },
    {
      q: "Do index funds really beat picking stocks?",
      a: "Over 15-year stretches, the large majority of actively managed US stock funds trail their own benchmark after fees. Owning the whole market for a few basis points locks in the market return instead of paying roughly 1% a year for a coin flip at beating it.",
    },
    {
      q: "What am I supposed to do when the market crashes?",
      a: "Keep contributing and rebalance if your mix has drifted. Broad US market drawdowns have recovered in the past, though never on a predictable schedule. The people who turned temporary losses into permanent ones sold and waited for clarity that never arrived.",
    },
  ],
};
