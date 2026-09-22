// lib/affiliates.ts — affiliate offer registry for US Money HQ.
// Maps high-intent calculator pages -> relevant affiliate offers (contextual).
// GEO RULE: all affiliate CTAs render ONLY for US visitors (geo-gated in
// components/AffiliateBlock.js via the middleware `geo` cookie, the server
// country prop, or a US-only timezone check — see lib/geo.js). Note the
// component is .js, not .tsx; this comment said .tsx until 2026-09-22 and sent
// a reader looking for a file that does not exist.
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

  // ── OFFER REGISTRY RECORD (compliance) ────────────────────────────────────
  // Added 2026-09-22. The offer registry is a compliance artefact, not just
  // routing config: it must show the advertiser, the states served, when it was
  // approved, what event pays, the disclosure shown, and when it was last
  // reviewed. All fields are OPTIONAL on purpose — an entry that has not been
  // through a review yet should say nothing rather than carry a plausible-
  // looking default. `complianceGaps()` reports which live offers are missing
  // what, so an incomplete record is visible instead of assumed complete.
  network?: string;      // which network carries this offer, e.g. "fintel-connect"
  states?: string[];     // US states served; [] = unconfirmed, NOT "all states"
  approvedOn?: string;   // ISO date the offer was approved ("" = not yet applied)
  payoutEvent?: string;  // what actually pays: click | lead | qualified-lead | funded-loan | signup
  lastReviewed?: string; // ISO date of last compliance review
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
    // Known facts only. approvedOn and lastReviewed are left blank because
    // nobody recorded them — complianceGaps() surfaces that rather than a
    // plausible-looking date being invented here.
    network: "impact",
    payoutEvent: "signup",
  },

  // ─── HIGH-INTENT FINANCE SLOTS (the relevant ones for this audience) ─────
  // A mortgage calculator visitor is a mortgage lead, not a furniture shopper.
  // These are the programs that actually match the intent of the pages they load
  // on, listed in the order worth applying for. All need an application first,
  // most live on Impact (already have an account) or a direct network.
  {
    id: "lendingtree-refi",
    name: "Compare Refinance Rates",
    // Blurb softened 2026-09-22. It previously read "... — no impact on your
    // credit score." That is a claim about a third party's product that we
    // cannot substantiate; it may well be true of LendingTree's own process, but
    // we are not the advertiser and the sentence asserts it on their behalf.
    // The compliance lint in scripts/test_affiliates.mjs flagged it. Removed
    // rather than left as a standing warning.
    blurb: "Compare refinance offers from multiple lenders side by side.",
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

/**
 * Disclosure shown beside every affiliate recommendation.
 *
 * Strengthened 2026-09-22. The previous text said only that a commission may be
 * earned. For a site that presents itself as a financial calculator resource,
 * the material thing a reader cannot otherwise know is that compensation can
 * influence WHICH products appear — so that is now stated, alongside the
 * commitment that keeps it honest. Do not shorten this back to a bare
 * commission line.
 */
export const AFFILIATE_DISCLOSURE =
  "We may earn a commission if you buy through links on this page — at no extra cost to you. " +
  "Compensation can influence which products are shown; it does not change the figures any calculator produces.";

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK STACK — the order to apply in, and the route to use for each.
//
// Ranked by fit for calculator-driven US finance intent, not by size. The two
// entries flagged `direct: true` are NOT self-serve publisher signups: their
// public partner material addresses lenders, agents and advertisers, so an
// application sent through the obvious form may go to the wrong desk and die
// there. Ask the publisher/referral question explicitly.
//
// Everything here is a plan, not a partnership. `status` is the only field that
// claims anything, and none of these is approved.
// ─────────────────────────────────────────────────────────────────────────────
export type NetworkTarget = {
  id: string;
  name: string;
  priority: number;
  covers: string[];
  role: string;
  /** true = direct business-development conversation, not a publisher signup */
  direct: boolean;
  /** What to ask/do, in the order it matters. */
  notes: string[];
  status: "not-applied" | "applied" | "approved" | "rejected";
};

export const NETWORK_STACK: NetworkTarget[] = [
  {
    id: "fintel-connect",
    name: "Fintel Connect",
    priority: 1,
    covers: ["deposits", "credit-cards", "personal-loans", "mortgages", "insurance", "investing"],
    role: "Primary finance network",
    direct: false,
    notes: [
      "Apply as a CALCULATOR AND COMPARISON PUBLISHER. A generic 'finance blog' description is the weak application.",
      "State the calculator pages, the traffic sources, the target audience and the planned disclosures.",
      "Finance-specialist inventory, so this is the one to get right first.",
    ],
    status: "not-applied",
  },
  {
    id: "cj",
    name: "CJ Affiliate",
    priority: 2,
    covers: ["credit-cards", "loans", "banking", "investing", "insurance", "credit-score"],
    role: "Broad secondary network — fills gaps Fintel does not cover",
    direct: false,
    notes: [
      "Deep links, widgets and cross-device tracking are available; use deep links so the landing page matches the calculator's intent.",
      "Do NOT pick an offer on advertised commission alone — rank on expected revenue per visitor (see rankOffers).",
    ],
    status: "not-applied",
  },
  {
    id: "flexoffers",
    name: "FlexOffers",
    priority: 3,
    covers: ["credit-score", "credit-monitoring", "loans", "banking", "debt-services"],
    role: "Supplemental coverage",
    direct: false,
    notes: [
      "Useful for programs that are hard to obtain individually.",
      "Use extra caution with debt-relief, credit-repair and high-cost lending: these carry real compliance and reputation risk on a site presenting as a trusted calculator resource.",
    ],
    status: "not-applied",
  },
  {
    id: "lendingtree",
    name: "LendingTree",
    priority: 4,
    covers: ["mortgage", "refinance", "home-equity", "personal-loans", "auto-loans", "business-loans"],
    role: "Direct lead/marketplace partnership",
    direct: true,
    notes: [
      "PUBLISHER ROUTE UNCERTAIN: the public 'Partner with Us' material is written for lenders and product providers. Ask specifically about a publisher/referral route before assuming the lender form is correct.",
      "Ask: can traffic come from calculator pages; required disclosures and consent language; paid per click, lead, qualified lead, application or funded loan; exclusive or shared leads; state and licensing restrictions.",
    ],
    status: "not-applied",
  },
  {
    id: "mediaalpha",
    name: "MediaAlpha",
    priority: 5,
    covers: ["auto-insurance", "home-insurance", "life-insurance", "health-insurance", "renters-insurance"],
    role: "Insurance lead marketplace",
    direct: true,
    notes: [
      "Treat as business development, not a self-serve publisher signup.",
      "Insurance lead quality varies widely. Negotiate and then MEASURE: exclusive vs shared, lead freshness, geographic eligibility, contact-validity requirements, duplicate and refund rules, buyer response time.",
    ],
    status: "not-applied",
  },
  {
    id: "impact",
    name: "impact.com",
    priority: 6,
    covers: ["banking", "fintech", "investing", "cards", "insurance", "finance-apps"],
    role: "Second phase — direct brand partnerships once traffic is meaningful",
    direct: false,
    notes: [
      "Already have an account (Shopify is live through it).",
      "Becomes worth real effort when there is an email list, consistent organic traffic and enough volume to negotiate custom payouts.",
    ],
    status: "approved",
  },
  {
    id: "financeads",
    name: "financeAds",
    priority: 7,
    covers: ["banking", "loans", "insurance", "fintech"],
    role: "Test only — verify US supply first",
    direct: false,
    notes: [
      "Finance-specialist, but inventory skews European. Before spending implementation time, confirm per offer: US traffic accepted, eligible states, payout model, disclosures, payment threshold/timing, and whether programmatic pages are accepted.",
    ],
    status: "not-applied",
  },
];

/**
 * The 30-day test: THREE verticals, not the whole finance market.
 * Two or three offers each. Restricted scope is the point — a wide launch
 * produces no readable signal about which offer deserves the traffic.
 */
export const VERTICALS_30DAY_TEST = [
  { id: "mortgage", label: "Mortgage / refinance" },
  { id: "personal-loan", label: "Personal loans or credit cards" },
  { id: "insurance", label: "Auto or home insurance" },
] as const;

/**
 * Expected revenue per visitor.
 *
 *   EV = click-through rate x approved-conversion rate x commission per conversion
 *
 * Every input is REQUIRED and none has a default. The whole reason to compute
 * this is to stop ranking offers by advertised payout, which is the number that
 * flatters a bad offer — a high commission with a poor approval rate loses to a
 * modest commission that actually pays. Returning a number from guessed inputs
 * would reproduce exactly the mistake this exists to prevent, so with a missing
 * input this returns null and `rankOffers` reports the offer as unrankable.
 */
export function expectedRevenuePerVisitor(input: {
  ctr?: number | null;
  approvalRate?: number | null;
  commission?: number | null;
}): number | null {
  const { ctr, approvalRate, commission } = input;
  if (ctr == null || approvalRate == null || commission == null) return null;
  if (!Number.isFinite(ctr) || !Number.isFinite(approvalRate) || !Number.isFinite(commission)) return null;
  if (ctr < 0 || approvalRate < 0 || commission < 0) return null;
  return ctr * approvalRate * commission;
}

export type RankedOffer = {
  id: string;
  ev: number | null;
  /** Why it could not be ranked — shown, never hidden. */
  unrankable?: string;
};

/**
 * Rank offers by expected revenue per visitor.
 *
 * Unrankable offers sort LAST rather than being dropped, so an offer with no
 * measurement is visibly missing from the ranking instead of quietly absent from
 * it. `metrics` is keyed by offer id and comes from observed data (the ledger or
 * the network dashboard), never from the offer's own advertising copy.
 */
export function rankOffers(
  offers: AffiliateOffer[] = AFFILIATE_OFFERS,
  metrics: Record<string, { ctr?: number | null; approvalRate?: number | null; commission?: number | null }> = {}
): RankedOffer[] {
  return offers
    .map((o) => {
      const m = metrics[o.id];
      if (!m) return { id: o.id, ev: null, unrankable: "no measured metrics yet" };
      const ev = expectedRevenuePerVisitor(m);
      return ev === null
        ? { id: o.id, ev: null, unrankable: "incomplete metrics (need ctr, approvalRate, commission)" }
        : { id: o.id, ev };
    })
    .sort((a, b) => {
      if (a.ev === null && b.ev === null) return a.id.localeCompare(b.id);
      if (a.ev === null) return 1;
      if (b.ev === null) return -1;
      return b.ev - a.ev;
    });
}

/**
 * Which LIVE offers have an incomplete compliance record.
 *
 * A live offer with no states, no payout event and no review date is one that is
 * showing to readers without anyone having recorded what was agreed. Report it
 * rather than block it: this is a young registry and an empty field is honest,
 * but it must not stay invisible.
 */
export function complianceGaps(): { id: string; missing: string[] }[] {
  return LIVE_OFFERS.map((o) => {
    const missing: string[] = [];
    if (!o.network) missing.push("network");
    if (!o.states || o.states.length === 0) missing.push("states");
    if (!o.approvedOn) missing.push("approvedOn");
    if (!o.payoutEvent) missing.push("payoutEvent");
    if (!o.lastReviewed) missing.push("lastReviewed");
    return { id: o.id, missing };
  }).filter((g) => g.missing.length > 0);
}
