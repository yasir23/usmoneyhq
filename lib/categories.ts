// lib/categories.ts — shared category definitions for homepage + category landing pages.
//
// TIER decides prominence, and it encodes a positioning decision rather than a
// layout preference.
//
// A 2026-10-05 growth audit found the homepage reading as "a small general
// calculator directory" rather than a focused US personal-finance publisher,
// because mortgage tools sat beside TDEE, BMI, concrete and GPA. Google needs one
// reason to classify a site; a visitor needs one reason to trust it with a salary
// figure. So finance categories lead, and the rest are demoted into a section that
// says plainly what it is.
//
// What this deliberately does NOT do: re-slug the hubs. The audit recommends
// re-cutting them into five finance clusters, and then warns in the same document
// not to restructure "blindly -- first use Search Console and Analytics to identify
// whether they have meaningful US demand." That data is not available here (no GSC
// access), and re-slugging a site mid-AdSense-review trades real URL churn for an
// uncertain gain. Prominence is reversible in one commit; a URL change is not.
// When GSC data exists, that is the moment to re-cut the slugs, with redirects.
//
// DEEPENED 2026-10-06. The five hub pages rendered a tool grid and a list of the
// other hubs — 278 words, and none of it explained anything about the subject.
// Each category now carries `intro` sections that state the mistakes these
// calculators exist to prevent. Every claim in them is arithmetic or a
// definition, not a rate or a price, so nothing here goes stale when markets move.
export type CategoryTier = "finance" | "other";

/** One editorial block on a hub page. */
export type CategorySection = {
  heading: string;
  body: string[];
};

export type Category = {
  slug: string;
  name: string;
  h1: string;
  desc: string;
  tier: CategoryTier;
  match: string[];
  /** Editorial context for the hub page. */
  intro: CategorySection[];
  /** Slug of the calculator a first-time visitor should open. Must exist in TOOLS. */
  startWith: string;
  startWithWhy: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "tax-retirement",
    name: "Tax & Retirement",
    h1: "Tax & Retirement Calculators",
    desc: "Salary after tax, tax brackets, 401k, RMD, Social Security, and investment growth — by state and filing status.",
    tier: "finance",
    match: ["salary", "paycheck", "tax", "capital-gains", "overtime", "social-security", "rmd", "401k", "retirement", "investment", "dividend", "savings-bond", "cd-", "compound-interest", "investment-property", "savings-goal", "savings-rate", "rule-of-72", "roi", "inflation"],
    startWith: "paycheck-calculator",
    startWithWhy: "It is the number everything else depends on — what actually lands in your account.",
    intro: [
      {
        heading: "Start from the number that actually arrives",
        body: [
          "A salary figure is not your pay. Between the offer letter and your bank account sit pre-tax deductions, federal withholding, FICA, and your state's own rules — and each one behaves differently.",
          "Pre-tax retirement contributions reduce your taxable income but generally do not reduce FICA. FICA itself is two separate taxes with different ceilings: Social Security stops applying above an annual wage base, Medicare does not. That is why a raise late in the year can behave differently from the same raise in January.",
          "These calculators exist to make that chain visible instead of mysterious, so a job offer or a raise can be evaluated on take-home rather than headline.",
        ],
      },
      {
        heading: "Marginal is not average",
        body: [
          "The single most common misunderstanding about income tax is the bracket. Being pushed into a higher bracket does not tax all of your income at the higher rate — only the portion above the threshold is taxed there. A raise therefore cannot reduce your take-home pay, and any calculator that suggests otherwise is wrong.",
          "Average tax rate and marginal tax rate answer different questions. The average rate tells you what fraction of your income went to tax. The marginal rate tells you what the next dollar costs you, and it is the number that should drive the decision about an extra shift, an overtime hour, or a Roth versus traditional contribution.",
        ],
      },
      {
        heading: "Retirement projections are arithmetic on an assumption",
        body: [
          "A retirement calculator is a growth-rate assumption wrapped in a compounding formula. The formula is exact; the assumption is yours. A one-percentage-point difference in the assumed return, compounded over thirty years, moves the answer by more than most people expect.",
          "Required minimum distributions work differently from contributions: they are driven by a divisor from a published table that changes with your age, applied to the prior year-end balance, and a first-year distribution is due in the year you reach the threshold. The RMD guide on this site walks through that calculation from the table itself.",
          "Treat every projection as a way to test an assumption, not a forecast of your future.",
        ],
      },
    ],
  },
  {
    slug: "money-loans",
    name: "Loans, Debt & Housing",
    h1: "Loan, Debt & Housing Calculators",
    desc: "Mortgage, auto loan, debt payoff, and credit calculators — accurate US formulas, no sign-up.",
    tier: "finance",
    match: ["mortgage", "auto-loan", "loan", "debt", "credit", "heloc", "refinance", "student-loan", "dti", "car-affordability", "lease-vs-buy", "simple-interest", "amortization", "mortgage-points", "escrow", "closing-costs", "home-equity", "pmi", "commission", "price-per-square-foot", "property-tax"],
    startWith: "mortgage-calculator",
    startWithWhy: "It shows the amortization that explains every other lending decision.",
    intro: [
      {
        heading: "The payment is arithmetic, the rate is not",
        body: [
          "A loan payment comes from one formula, and every calculator here uses it: the principal is amortised at the periodic rate over the number of periods, which is why the payment is fixed while the split between interest and principal changes every month.",
          "Interest is charged on the outstanding balance, so the balance is largest at the beginning and most of each early payment is interest. That single fact explains why paying extra early saves far more than paying the same amount late, and why a loan in its final years barely responds to overpayment.",
          "The rate is the part we cannot give you — it depends on your lender, your credit, and the day you apply. Every rate in these calculators is an input you control, which is why the same calculator gives different people different answers.",
        ],
      },
      {
        heading: "Compare total cost, not the monthly payment",
        body: [
          "Stretching a loan lowers the payment and raises the total interest paid. Both effects are real and they point in opposite directions, which is why the monthly figure alone is a bad way to choose a term.",
          "The same trap appears in refinancing and in mortgage points. A refi replaces one interest cost with another and adds closing costs; points are an upfront fee in exchange for a lower rate. In every case the honest question is the break-even: how many months of the saving does it take to repay the upfront cost, and will you still have the loan then?",
          "A lower rate on a longer term can cost more in total than a higher rate on a shorter one. The calculators report total interest and total paid so that comparison is available without spreadsheet work.",
        ],
      },
      {
        heading: "What a payment calculator does not know about you",
        body: [
          "A mortgage payment is not the whole monthly housing cost. Property tax, homeowners insurance, mortgage insurance, and any HOA dues sit alongside it, and the first two are usually collected in escrow on top of principal and interest.",
          "Affordability tools use ratios — income against debt service — as a screen, not a verdict. They describe what a lender may be willing to approve, which is not the same as what leaves you comfortable, particularly once maintenance and the cost of moving are included. The rent-versus-buy calculator exists to make that full comparison, including the costs that are easy to forget because they are not part of a loan.",
        ],
      },
    ],
  },
  {
    slug: "everyday-business",
    name: "Everyday & Business",
    h1: "Everyday & Business Calculators",
    desc: "Percentage, discount, sales tax, markup, margin, and budgeting tools for daily life and work.",
    tier: "other",
    match: ["percentage", "discount", "sales-tax", "tip", "budget", "net-worth", "emergency-fund", "due-date", "gpa", "grade", "markup", "margin", "tax-refund", "moving-cost", "life-insurance"],
    startWith: "percentage-calculator",
    startWithWhy: "Almost every other tool here is a percentage calculation wearing a different hat.",
    intro: [
      {
        heading: "Percentage change has a direction, and most errors are in it",
        body: [
          "A change from 100 to 125 is a 25% increase. A change from 125 back to 100 is a 20% decrease. The two numbers differ because the base differs — the percentage is always of the starting value, and reversing a change never returns you to the number you began with unless the percentages are recalculated against the new base.",
          "This is the same reason a price that falls 20% and then rises 20% lands below where it started, and why a salary cut followed by an equal-percentage raise does not restore the original wage. Getting the base right is the entire calculation.",
        ],
      },
      {
        heading: "Markup and margin are not the same number",
        body: [
          "Markup is profit as a percentage of cost. Margin is profit as a percentage of the selling price. A 25% markup is a 20% margin, because the same profit sits on top of a larger base once it is included in the total.",
          "Confusing the two is the most expensive routine error in small-business pricing: a business that prices at a target margin by marking up by that margin percentage will consistently under-price. The margin calculator converts between them directly.",
        ],
      },
      {
        heading: "Everyday money and business money follow different rules",
        body: [
          "Sales tax is charged on the pre-tax price, and so is a customary tip — applying either to the post-discount total rather than the original changes who pays the difference. Discounts do not simply add together either: two successive percentages compound, so 20% off followed by 10% off is 28% off, not 30%.",
          "A tax refund deserves the same scepticism. A refund is generally the result of having had more withheld during the year than was owed, which means it was your money in the meantime — an interest-free loan you made rather than a windfall you received. The refund calculator is most useful in the other direction, as a way to check whether your withholding is set sensibly for next year.",
        ],
      },
    ],
  },
  {
    slug: "home-improvement",
    name: "Home & Improvement",
    h1: "Home & Improvement Calculators",
    desc: "Concrete, tile, paint, mulch, gravel, drywall, and remodel cost calculators for DIY and contractors.",
    tier: "other",
    match: ["concrete", "paint", "mulch", "square-footage", "tile", "fence", "gravel", "topsoil", "carpet", "wallpaper", "sod", "drywall", "construction-cost", "electricity", "gas-cost", "miles-per-gallon", "remodel"],
    startWith: "square-footage-calculator",
    startWithWhy: "Every material quantity on this page starts as an area you have to measure correctly.",
    intro: [
      {
        heading: "Measure the shape, not just the room",
        body: [
          "Area is length times width only for a rectangle. An L-shaped room is two rectangles, a room with a bay is a rectangle plus a triangle, and a room that is not square at the corners — which is most rooms — is not exactly a rectangle at all. Measuring the two longest walls and multiplying is the single most common source of a short order.",
          "The unit matters as much as the number. A fence is measured in linear feet, paint and flooring in square feet, and concrete and soil in cubic feet or cubic yards. Those are not interchangeable, and the most frequently confused pair is area and volume: concrete needs a depth, so a patio is not an area problem, it is a volume problem.",
        ],
      },
      {
        heading: "Order overage, because offcuts are not optional",
        body: [
          "Almost nothing installs at exactly the area you measured. Tile is cut at every edge and around every fixture, and a patterned tile wastes more because the pattern has to line up. Paint needs a second coat, and a second coat is a second full quantity even though it covers what is already there. Flooring wastes on seams and direction changes.",
          "The calculators apply a waste allowance rather than pretending it does not exist, and it is better to have a spare box of tile than to discover the dye lot has changed by the time you need more. The exception runs the other way: concrete starts setting once it is mixed, so over-ordering it is money poured on the ground.",
        ],
      },
      {
        heading: "Cost estimates are rates you supply",
        body: [
          "Material quantities are arithmetic and are the same everywhere. Labour and unit prices are not — they vary by region, season, and who is doing the work. These calculators take the per-unit cost as an input for exactly that reason, so the number they produce is a function of your local rate rather than a national average presented as a quote.",
          "Use them to size the job and to sanity-check a contractor's estimate line by line, not as a substitute for one.",
        ],
      },
    ],
  },
  {
    slug: "health-fitness",
    name: "Health & Fitness",
    h1: "Health & Fitness Calculators",
    desc: "TDEE, BMI, body fat, water intake, sleep, and calorie deficit calculators — evidence-based formulas.",
    tier: "other",
    match: ["tdee", "bmi", "body-fat", "water-intake", "sleep", "calorie-deficit", "heart-rate"],
    startWith: "tdee-calculator",
    startWithWhy: "It gives you the maintenance number that every other target is a percentage of.",
    intro: [
      {
        heading: "What these formulas can and cannot tell you",
        body: [
          "The health calculators on this site use published equations, and the key word is equation. They take a small number of inputs — height, weight, age, sex, activity level — and return a population-level estimate for someone with those inputs. They do not measure you.",
          "Body mass index is the clearest example. It divides weight by height squared and says nothing about what that weight is made of, so a person carrying a lot of muscle and a person carrying a lot of fat can share a BMI. Body fat methods have their own error margins, and the ones that are convenient are not the accurate ones. Use these numbers as a trend line for one person over time, not as a verdict on a body.",
        ],
      },
      {
        heading: "Energy balance is arithmetic; the multiplier is the guess",
        body: [
          "Total daily energy expenditure is a resting metabolic estimate multiplied by an activity factor. The estimate comes from a published equation; the activity factor comes from you choosing among a handful of descriptions, and that choice is where most of the uncertainty lives. Two people with identical measurements can land a few hundred calories apart purely on whether they call themselves lightly or moderately active.",
          "A deficit is then straightforward arithmetic against that total, using the convention that roughly 3,500 kilocalories corresponds to a pound of fat. That convention is an approximation and it degrades over time — expenditure falls as body mass falls, so a deficit that produces steady loss at the start produces less later. Recalculate rather than assuming the first number holds.",
        ],
      },
      {
        heading: "Not medical advice",
        body: [
          "Heart rate zones, water intake, and pregnancy dating all sit closer to clinical territory than the arithmetic suggests. Estimated delivery dates are calculated from a standard interval and most births do not land on the estimate. Water needs shift with medication, climate, and kidney or heart conditions.",
          "These tools are for general education and self-tracking. Talk to a clinician before acting on them, and never use them to replace one.",
        ],
      },
    ],
  },
];

/** Finance categories first, then the rest. Stable order for every consumer. */
export const FINANCE_CATEGORIES = CATEGORIES.filter((c) => c.tier === "finance");
export const OTHER_CATEGORIES = CATEGORIES.filter((c) => c.tier === "other");

/**
 * Which category a tool belongs to.
 *
 * First match wins, so ORDER IS SEMANTIC: the finance categories are declared before
 * the catch-all "Everyday & Business", which is why a slug containing "tax" lands in
 * Tax & Retirement rather than the everyday bucket. Reordering CATEGORIES changes
 * which tools appear on which hub.
 */
export function categorize(slug: string): Category {
  for (const c of CATEGORIES) {
    if (c.match.some((k) => slug.includes(k))) return c;
  }
  return CATEGORIES[CATEGORIES.length - 1];
}
