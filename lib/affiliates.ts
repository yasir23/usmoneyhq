// lib/affiliates.ts — affiliate offer registry for US Money HQ.
// Maps high-intent calculator pages -> relevant affiliate offers (contextual).
// GEO RULE: all affiliate CTAs render ONLY for US visitors (geo-gated in
// components/AffiliateBlock.tsx via Cloudflare country header / client IP).
//
// Placeholder links are REAL deep links where possible; swap in the tracked
// affiliate URL after each program approval (same pattern as the Shopify guide).
import type { ToolDef } from "./tools";

export type AffiliateOffer = {
  id: string;
  name: string;          // brand shown to user
  blurb: string;         // 1-line value prop
  href: string;          // affiliate deep link (replace after approval)
  program: "shopify" | "impact-finance" | "etsy" | "canva" | "wayfair" | "michaels" | "fiverr" | "direct";
  payout: string;        // short payout description (internal note)
  // when empty, offer shows on all tools; when set, only on those tools
  tools?: string[];
  // optional subId so we can attribute channel/source
  subId?: string;
};

const SHOPIFY = "https://shopify.pxf.io/c/6480733/1101159/13624?subId1=usmoneyhq-web";

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: "shopify-store",
    name: "Shopify",
    blurb: "Start the online store you've been planning — free trial, no credit card.",
    href: SHOPIFY,
    program: "shopify",
    payout: "$25-150 / full-price signup",
    tools: [],
    subId: "usmoneyhq-web",
  },
  {
    id: "canva-pro",
    name: "Canva Pro",
    blurb: "Design budgets, printables, and brand graphics in minutes — 30-day Pro trial.",
    href: "https://www.canva.com/", // swap for tracked URL after approval
    program: "canva",
    payout: "~$36 / Pro sub",
    tools: [],
  },
  {
    id: "wayfair-home",
    name: "Wayfair",
    blurb: "Furnish the home you just budgeted for — see today's decor deals.",
    href: "https://www.wayfair.com/", // swap for tracked URL after approval
    program: "wayfair",
    payout: "4-6% (AOV $300-500)",
    tools: ["home-affordability-calculator", "mortgage-calculator", "closing-costs-calculator"],
  },
  {
    id: "etsy-printables",
    name: "Etsy Printables",
    blurb: "Budget planners & finance printables from independent creators.",
    href: "https://www.etsy.com/search?q=budget%20planner%20printable", // swap after approval
    program: "etsy",
    payout: "~4% basket",
    tools: ["budget-calculator", "savings-goal-calculator", "debt-payoff-calculator"],
  },
  {
    id: "fiverr-hustle",
    name: "Fiverr",
    blurb: "Turn a skill into income — browse the freelance work people hire for.",
    href: "https://www.fiverr.com/", // swap for tracked URL after approval
    program: "fiverr",
    payout: "$50-150 / new buyer",
    tools: ["hourly-to-salary-calculator", "salary-to-hourly-calculator", "take-home-pay-calculator", "salary-after-tax-calculator"],
  },
  {
    id: "michaels-craft",
    name: "Michaels",
    blurb: "Craft & DIY supplies for the projects in your budget.",
    href: "https://www.michaels.com/", // swap after approval
    program: "michaels",
    payout: "4-6%",
    tools: ["concrete-calculator", "paint-calculator", "home-remodel-cost-calculator"],
  },
];

export const GEO_ONLY_US = true; // affiliate CTAs appear only to US visitors
export const AFFILIATE_DISCLOSURE = "We may earn a commission if you buy through links on this page — at no extra cost to you.";
