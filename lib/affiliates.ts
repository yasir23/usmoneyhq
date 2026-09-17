// lib/affiliates.ts — affiliate offer registry for US Money HQ.
// Maps high-intent calculator pages -> relevant affiliate offers (contextual).
// GEO RULE: all affiliate CTAs render ONLY for US visitors (geo-gated in
// components/AffiliateBlock.tsx via the middleware `geo` cookie, the server
// country prop, or a US-only timezone check — see lib/geo.js).
//
// ⚠️ THE `live` FLAG (added 2026-09-17). Only offers with a REAL tracked link may
// render. Before this, six of seven offers pointed at plain brand homepages
// (canva.com, wayfair.com, etsy.com, fiverr.com) with no affiliate parameter at
// all: a visitor clicking them earned nothing, so the block gave up page space
// and user trust for zero revenue, while LOOKING fully monetized. An offer with
// `live: false` is not rendered — it is a documented roadmap slot. To switch one
// on: replace `href` with the tracked URL from the program dashboard and set
// `live: true`. That is the whole activation step.
//
// Current reality (verified 2026-09-17): Impact hosts exactly ONE approved
// advertiser — Shopify (Campaign 13624, $25-150 per full-price signup). Every
// other entry below is an application not yet made or not yet approved.
export type AffiliateOffer = {
  id: string;
  name: string;          // brand shown to user
  blurb: string;         // 1-line value prop
  href: string;          // affiliate deep link (tracked URL once approved)
  program: "shopify" | "impact-finance" | "etsy" | "canva" | "wayfair" | "michaels" | "fiverr" | "direct";
  payout: string;        // short payout description (internal note)
  live: boolean;         // TRUE only when href is a real tracked link
  apply?: string;        // where to apply / how to activate (internal note)
  // when empty, offer shows on all tools; when set, only on those tools
  tools?: string[];
  // optional subId so we can attribute channel/source
  subId?: string;
};

const SHOPIFY = "https://shopify.pxf.io/c/6480733/1101159/13624?subId1=usmoneyhq-web";

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  // ─── LIVE ────────────────────────────────────────────────────────────────
  {
    id: "shopify-store",
    name: "Shopify",
    blurb: "Start the online store you've been planning — free trial, no credit card.",
    href: SHOPIFY,
    program: "shopify",
    payout: "$25-150 / full-price signup",
    live: true,
    tools: [],
    subId: "usmoneyhq-web",
  },

  // ─── HIGH-INTENT FINANCE SLOTS (the relevant ones for this audience) ─────
  // A mortgage calculator visitor is a mortgage lead, not a furniture shopper.
  // These are the programs that actually match the intent of the pages they load
  // on, listed in the order worth applying for. All need an application first,
  // most live on Impact (already have an account) or a direct network.
  {
    id: "lendingtree-refi",
    name: "Compare Refinance Rates",
    blurb: "See refinance offers from multiple lenders — no impact on your credit score.",
    href: "https://www.lendingtree.com/", // PLACEHOLDER — activate after approval
    program: "impact-finance",
    payout: "$20-100+ per qualified lead (pay-per-lead)",
    live: false,
    apply: "impact.com -> Discover -> search 'LendingTree' (account already approved on Impact)",
    tools: ["mortgage-calculator", "refinance-calculator", "heloc-calculator", "home-affordability-calculator", "fha-mortgage-calculator", "va-mortgage-calculator", "closing-costs-calculator", "mortgage-payoff-calculator"],
  },
  {
    id: "sofi-personal-loan",
    name: "SoFi Personal Loans",
    blurb: "Check your rate for a personal loan in two minutes — no fees, no obligation.",
    href: "https://www.sofi.com/", // PLACEHOLDER
    program: "impact-finance",
    payout: "$50-150 / funded loan",
    live: false,
    apply: "impact.com -> Discover -> 'SoFi' (Impact also runs their banking + invest offers)",
    tools: ["personal-loan-calculator", "debt-payoff-calculator", "credit-card-payoff-calculator", "student-loan-calculator", "auto-loan-calculator"],
  },
  {
    id: "policygenius-life",
    name: "Compare Life Insurance",
    blurb: "Compare term life quotes from top insurers — takes about two minutes.",
    href: "https://www.policygenius.com/", // PLACEHOLDER
    program: "impact-finance",
    payout: "$20-60 / qualified lead",
    live: false,
    apply: "impact.com -> Discover -> 'Policygenius' (also EverQuote / SelectQuote for the same slot)",
    tools: ["life-insurance-calculator", "how-long-will-my-money-last-calculator", "net-worth-calculator", "deductible-calculator"],
  },
  {
    id: "turbotax-filing",
    name: "File Your Taxes",
    blurb: "File federal and state returns — import last year's return and go.",
    href: "https://turbotax.intuit.com/", // PLACEHOLDER
    program: "direct",
    payout: "$5-30 / filing (peaks Jan-Apr)",
    live: false,
    apply: "Impact -> Intuit (off-season approvals reported slower); H&R Block + TaxSlayer as backups",
    tools: ["salary-after-tax-calculator", "take-home-pay-calculator", "self-employment-tax-calculator", "paycheck-calculator", "salary-percentile-calculator", "capital-gains-tax-calculator"],
  },
  {
    id: "webull-invest",
    name: "Open an Investment Account",
    blurb: "Commission-free investing with fractional shares and a welcome bonus.",
    href: "https://www.webull.com/", // PLACEHOLDER
    program: "direct",
    payout: "$50-350 / funded account (CPA — the largest payout here)",
    live: false,
    apply: "Webull / Robinhood / M1 partner programs. Verify US onboarding + state eligibility before activating.",
    tools: ["retirement-calculator", "401k-calculator", "401k-contribution-calculator", "compound-interest-calculator", "investment-calculator", "roth-ira-calculator", "net-worth-calculator", "roi-calculator", "rule-of-72-calculator", "dividend-calculator"],
  },
  {
    id: "credit-karma",
    name: "Check Your Credit Score",
    blurb: "Free credit score and report — see what lenders see before you apply.",
    href: "https://www.creditkarma.com/", // PLACEHOLDER
    program: "direct",
    payout: "$8-40 / qualified signup",
    live: false,
    apply: "Credit Karma / Experian partner programs",
    tools: ["credit-card-payoff-calculator", "debt-to-income-calculator", "auto-loan-calculator", "personal-loan-calculator"],
  },

  // ─── RETAINED SLOTS, NOT LIVE (no tracked link, low relevance to finance intent)
  {
    id: "canva-pro",
    name: "Canva Pro",
    blurb: "Design budgets, printables, and brand graphics in minutes — 30-day Pro trial.",
    href: "https://www.canva.com/", // PLACEHOLDER — no affiliate parameter, earns nothing
    program: "canva",
    payout: "~$36 / Pro sub",
    live: false,
    apply: "canva.com affiliate program (direct)",
    tools: [],
  },
  {
    id: "fiverr-hustle",
    name: "Fiverr",
    blurb: "Turn a skill into income — browse the freelance work people hire for.",
    href: "https://www.fiverr.com/", // PLACEHOLDER
    program: "fiverr",
    payout: "$50-150 / new buyer",
    live: false,
    apply: "Fiverr affiliate program (direct)",
    tools: ["hourly-to-salary-calculator", "salary-to-hourly-calculator", "take-home-pay-calculator"],
  },
  {
    id: "wayfair-home",
    name: "Wayfair",
    blurb: "Furnish the home you just budgeted for — see today's decor deals.",
    href: "https://www.wayfair.com/", // PLACEHOLDER
    program: "wayfair",
    payout: "4-6% (AOV $300-500)",
    live: false,
    apply: "Wayfair partner program",
    tools: ["home-affordability-calculator", "closing-costs-calculator"],
  },
  {
    id: "etsy-printables",
    name: "Etsy Printables",
    blurb: "Budget planners & finance printables from independent creators.",
    href: "https://www.etsy.com/search?q=budget%20planner%20printable", // PLACEHOLDER
    program: "etsy",
    payout: "~4% basket",
    live: false,
    apply: "Awin / Etsy affiliate",
    tools: ["budget-calculator", "savings-goal-calculator", "debt-payoff-calculator"],
  },
  {
    id: "michaels-craft",
    name: "Michaels",
    blurb: "Craft & DIY supplies for the projects in your budget.",
    href: "https://www.michaels.com/", // PLACEHOLDER
    program: "michaels",
    payout: "4-6%",
    live: false,
    apply: "Michaels partner program",
    tools: ["concrete-calculator", "paint-calculator", "home-remodel-cost-calculator"],
  },
];

/** Only offers that can actually be paid for. Everything else is a roadmap slot. */
export const LIVE_OFFERS = AFFILIATE_OFFERS.filter((o) => o.live);

/** Slots waiting on an application — useful for the weekly affiliate review. */
export const PENDING_OFFERS = AFFILIATE_OFFERS.filter((o) => !o.live);

export const GEO_ONLY_US = true; // affiliate CTAs appear only to US visitors
export const AFFILIATE_DISCLOSURE = "We may earn a commission if you buy through links on this page — at no extra cost to you.";
