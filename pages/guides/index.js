import Head from "next/head";
import Link from "next/link";
import { SITE_URL } from "../../lib/tools";

/**
 * /guides — guides hub.
 *
 * REWRITTEN 2026-10-04. Two problems with the previous version:
 *
 * 1. It said "Four cornerstone guides with the calculators built in" above a grid
 *    of EIGHTEEN. A hardcoded count that was true once and silently stopped being
 *    true — the same stale-number class as "Ad-free across all 733 pages" on
 *    /premium. The count is now derived from the list itself.
 *
 * 2. It was a flat grid of 18 cards with no orientation, which is the shape
 *    AdSense calls "low value content" — a directory page with nothing on it.
 *    Grouped into six areas, each with a line saying what that area answers, so a
 *    reader can find the two guides relevant to them instead of scanning 18.
 */

// Plain JS file — no type annotations here, this is pages/*.js not a .ts module.
const GUIDES = [
  { href: "/guides/how-much-house-can-i-afford", title: "How Much House Can I Afford in 2026?", desc: "The 28/36 rule, down payments, and real salary-to-price examples.", group: "Borrowing & housing" },
  { href: "/guides/mortgage-calculator-guide", title: "How Mortgage Payments Work", desc: "PITI, 15 vs 30 years, and rates — the four parts of your payment.", group: "Borrowing & housing" },
  { href: "/guides/home-improvement-guide", title: "Home Improvement Budgeting", desc: "Remodel costs by room, the 10% materials rule, DIY vs pro.", group: "Borrowing & housing" },

  { href: "/guides/salary-after-tax-guide", title: "How Much of Your Salary You Actually Keep", desc: "Federal brackets, FICA, and why your state matters most.", group: "Pay & tax" },
  { href: "/guides/tax-refund-guide", title: "Tax Refunds Decoded", desc: "Why a big refund means you overpaid — and the fix.", group: "Pay & tax" },

  { href: "/guides/debt-payoff-guide", title: "The Fastest Way to Pay Off Debt", desc: "Snowball vs avalanche, and the power of extra payments.", group: "Debt" },
  { href: "/guides/debt-snowball-guide", title: "Multiple Debts? Run the Snowball", desc: "The debt-free date and the method that keeps you going.", group: "Debt" },
  { href: "/guides/debt-consolidation-2026", title: "Debt Consolidation (2026)", desc: "Snowball vs avalanche vs consolidation — the math.", group: "Debt" },

  { href: "/guides/401k-guide", title: "The 401k Guide", desc: "Match, limits, Roth vs traditional — the free money rule.", group: "Investing & retirement" },
  { href: "/guides/how-to-start-investing-2026", title: "How to Start Investing (2026)", desc: "The 5-step beginner path with compounding math.", group: "Investing & retirement" },
  { href: "/guides/investing-basics-guide", title: "Investing Basics", desc: "Compound growth, index funds, and time in the market.", group: "Investing & retirement" },
  { href: "/guides/rmd-guide", title: "RMDs Explained", desc: "Required distributions, the penalty, and the math.", group: "Investing & retirement" },
  { href: "/guides/529-guide", title: "The 529 Plan Guide", desc: "Tax-free growth, state deductions, and college costs.", group: "Investing & retirement" },

  { href: "/guides/best-cd-rates-2026", title: "Best CD Rates (2026)", desc: "Where to lock a high rate, term by term.", group: "Where to keep cash" },
  { href: "/guides/best-high-yield-savings-2026", title: "Best High-Yield Savings (2026)", desc: "What your emergency fund should earn.", group: "Where to keep cash" },

  { href: "/guides/best-budgeting-apps-2026", title: "Best Budgeting Apps (2026)", desc: "Free vs paid — which budget app actually saves you money.", group: "Everyday money" },
  { href: "/guides/health-fitness-guide", title: "Health & Fitness Numbers", desc: "TDEE, BMI, hydration, sleep — the boring wins first.", group: "Everyday money" },
  { href: "/guides/shopify-vs-etsy-vs-wix-2026", title: "Shopify vs Etsy vs Wix (2026)", desc: "Startup costs, fees, and which platform pays off for a side hustle.", group: "Everyday money" },
];

/** What each group answers. A directory with no orientation is a list, not a guide. */
const GROUP_NOTES = {
  "Borrowing & housing": "What a lender will actually approve, what the payment is made of, and what it costs to keep the house afterwards.",
  "Pay & tax": "The gap between what you are offered and what arrives, and how state of residence changes it.",
  Debt: "What each payoff method really does to the interest and the timeline, and which one you will stick to.",
  "Investing & retirement": "What compounding does over decades, and the account rules that decide how much of it you keep.",
  "Where to keep cash": "What money you are not investing should earn, and what to check before moving it.",
  "Everyday money": "Budgets, health numbers and side income — the recurring decisions that add up.",
};

const GROUPS = Array.from(new Set(GUIDES.map((g) => g.group)));

export default function GuidesHub() {
  return (
    <>
      <Head>
        <title>Money Guides — Plain English, With the Calculator Built In | US Money HQ</title>
        <meta
          name="description"
          content={`${GUIDES.length} plain-English money guides, each with the calculator built into the page: borrowing, pay and tax, debt payoff, investing, and where to keep cash.`}
        />
        <link rel="canonical" href={`${SITE_URL}/guides`} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs">
          <span>Home</span> <span aria-hidden="true">›</span> <span>Guides</span>
        </nav>
        <h1>Money Guides, No Jargon</h1>
        {/*
          The count is derived from GUIDES, not typed. The previous version said
          "Four cornerstone guides" above a grid of eighteen and had no way to
          notice it had gone stale.
        */}
        <p className="sub">
          {GUIDES.length} guides, each with the calculator built into the page — so you can
          read why the answer is what it is, then run your own numbers without leaving.
        </p>

        <div className="seo" style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2>How to use these</h2>
          <p>
            Every guide here works the same way: it explains the mechanism first, shows a worked
            example with the arithmetic visible, and then hands you the calculator already loaded
            with that example. You can change one input and see exactly which way the answer
            moves, which is the part a paragraph alone cannot show you.
          </p>
          <p>
            Start with the one question you actually have today. These are written to be read in
            ten minutes, not to be worked through in order.
          </p>
        </div>

        {GROUPS.map((group) => (
          <section key={group} style={{ marginTop: 40 }}>
            <h2>{group}</h2>
            <p className="sub" style={{ maxWidth: 760 }}>{GROUP_NOTES[group]}</p>
            <div className="tool-grid">
              {GUIDES.filter((g) => g.group === group).map((g) => (
                <Link key={g.href} href={g.href} className="tool-card">
                  <h3>{g.title}</h3>
                  <p>{g.desc}</p>
                  <span className="cta">Read the guide →</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
