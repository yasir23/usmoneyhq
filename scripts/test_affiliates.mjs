// Guards the affiliate registry. Run before any deploy that touches offers.
// The failure this prevents: flipping `live: true` on a placeholder homepage,
// which renders a CTA that earns nothing while looking monetized.
import {
  AFFILIATE_OFFERS, LIVE_OFFERS, PENDING_OFFERS,
  NETWORK_STACK, VERTICALS_30DAY_TEST, AFFILIATE_DISCLOSURE,
  expectedRevenuePerVisitor, rankOffers, complianceGaps,
} from "../lib/affiliates.ts";

let fails = 0;
let warns = 0;
function check(label, cond, detail = "") {
  console.log(`  ${label.padEnd(64)} ${cond ? "PASS" : `FAIL ${detail}`}`);
  if (!cond) fails++;
}
function warn(label, cond, detail = "") {
  console.log(`  ${label.padEnd(64)} ${cond ? "PASS" : `WARN ${detail}`}`);
  if (!cond) warns++;
}

// A real affiliate URL carries a tracking marker. A bare brand homepage does not.
const TRACKED = /(pxf\.io|\/c\/\d+|subId|utm_|aff_|affiliate|clickref|irclickid|awin1)/i;

console.log("1. LIVE OFFERS MUST BE TRACKED");
check("at least one live offer exists", LIVE_OFFERS.length >= 1, `got ${LIVE_OFFERS.length}`);
for (const o of LIVE_OFFERS) {
  check(`live offer '${o.id}' has a tracked href`, TRACKED.test(o.href), o.href);
  check(`live offer '${o.id}' declares live:true`, o.live === true);
}

console.log("\n2. PENDING OFFERS MUST NOT BE RENDERED AND MUST SAY HOW TO ACTIVATE");
for (const o of PENDING_OFFERS) {
  check(`pending '${o.id}' has live:false`, o.live === false);
  check(`pending '${o.id}' documents where to apply`, Boolean(o.apply && o.apply.length > 4));
}

console.log("\n3. REGISTRY INTEGRITY");
const ids = AFFILIATE_OFFERS.map((o) => o.id);
check("ids are unique", new Set(ids).size === ids.length, ids.join(","));
check("live + pending = total", LIVE_OFFERS.length + PENDING_OFFERS.length === AFFILIATE_OFFERS.length);

console.log("\n4. INTENT MATCH — the finance offers must target finance tools");
const byId = Object.fromEntries(AFFILIATE_OFFERS.map((o) => [o.id, o]));
const expectMap = {
  "lendingtree-refi": "mortgage-calculator",
  "sofi-personal-loan": "personal-loan-calculator",
  "webull-invest": "retirement-calculator",
  "turbotax-filing": "take-home-pay-calculator",
};
for (const [offerId, toolSlug] of Object.entries(expectMap)) {
  const o = byId[offerId];
  check(`${offerId} covers ${toolSlug}`, Boolean(o && o.tools && o.tools.includes(toolSlug)),
        o ? (o.tools || []).join(",") : "missing");
}

// ── 5. COMPLIANCE LINT on everything a reader actually sees ───────────────────
// AUSTERE for a site presenting as a financial calculator resource. The claims
// below are the ones a reader cannot verify and a regulator will ask about.
console.log("\n5. PROHIBITED CLAIMS IN USER-FACING COPY");
const PROHIBITED = [
  [/guarantee/i,                "guarantee"],
  [/guaranteed/i,               "guaranteed"],
  [/risk[- ]?free/i,            "risk-free"],
  [/instant approval/i,         "instant approval"],
  [/no risk/i,                  "no risk"],
  [/\bpromise/i,                "promise"],
  [/always (approved|qualify)/i, "always approved/qualify"],
];
const SOFT = [
  [/\bbest\b/i,                         "'best' — needs defined criteria and evidence"],
  [/no impact on your credit score/i,   "credit-score claim — confirm the advertiser's own wording"],
  [/\d+(\.\d+)?%\s*(apr|rate|interest)/i, "specific rate claim"],
];
for (const o of AFFILIATE_OFFERS) {
  const copy = `${o.name} ${o.blurb}`;
  for (const [re, label] of PROHIBITED) {
    check(`'${o.id}' avoids: ${label}`, !re.test(copy), copy.slice(0, 60));
  }
  for (const [re, label] of SOFT) {
    warn(`'${o.id}' soft claim: ${label}`, !re.test(copy), copy.slice(0, 60));
  }
}
check("disclosure states that compensation may affect which products are shown",
      /influence which products/i.test(AFFILIATE_DISCLOSURE), AFFILIATE_DISCLOSURE.slice(0, 50));

// ── 6. OFFER REGISTRY RECORD ─────────────────────────────────────────────────
// Reported, not enforced. An empty field is honest; an invisible empty field is
// not. Nothing here invents a date to make the report look clean.
console.log("\n6. OFFER REGISTRY RECORD (compliance)");
const gaps = complianceGaps();
if (gaps.length === 0) {
  check("every live offer has a complete compliance record", true);
} else {
  console.log(`  ${gaps.length} live offer(s) with an incomplete record — reported, not blocking:`);
  for (const g of gaps) console.log(`      ${g.id}: missing ${g.missing.join(", ")}`);
  check("gaps are surfaced rather than hidden", gaps.every((g) => g.missing.length > 0));
}
for (const o of LIVE_OFFERS) {
  check(`live '${o.id}' has a payoutEvent`, Boolean(o.payoutEvent), "unknown payout event");
}

// ── 7. EXPECTED REVENUE PER VISITOR ──────────────────────────────────────────
// The point of this metric is to stop ranking on advertised payout, so the test
// that matters most is that it REFUSES to produce a number from missing inputs.
console.log("\n7. EXPECTED REVENUE PER VISITOR NEVER INVENTS A NUMBER");
check("missing every input -> null", expectedRevenuePerVisitor({}) === null);
check("missing approvalRate -> null", expectedRevenuePerVisitor({ ctr: 0.1, commission: 100 }) === null);
check("missing commission -> null", expectedRevenuePerVisitor({ ctr: 0.1, approvalRate: 0.5 }) === null);
check("NaN input -> null", expectedRevenuePerVisitor({ ctr: NaN, approvalRate: 0.5, commission: 100 }) === null);
check("negative input -> null", expectedRevenuePerVisitor({ ctr: -1, approvalRate: 0.5, commission: 100 }) === null);
check("complete inputs -> ctr x approvalRate x commission",
      Math.abs(expectedRevenuePerVisitor({ ctr: 0.1, approvalRate: 0.5, commission: 100 }) - 5) < 1e-9);

const ranked = rankOffers(AFFILIATE_OFFERS, {
  // shopify: 0.03 x 0.05 x 400 = 0.60   — big advertised payout, few approvals
  "shopify-store": { ctr: 0.03, approvalRate: 0.05, commission: 400 },
  // sofi:   0.08 x 0.50 x  30 = 1.20   — 13x smaller commission, 10x approvals
  "sofi-personal-loan": { ctr: 0.08, approvalRate: 0.5, commission: 30 },
});
const top = ranked[0];
check("a smaller commission with a far better approval rate outranks a big one",
      top.id === "sofi-personal-loan" && Math.abs(top.ev - 1.2) < 1e-9,
      `top=${top.id} ev=${top.ev}`);
check("the offer with the largest advertised commission is NOT ranked first",
      top.id !== "shopify-store");
check("unrankable offers are kept and labelled, not dropped",
      ranked.length === AFFILIATE_OFFERS.length &&
      ranked.filter((r) => r.ev === null).every((r) => r.unrankable));
check("unrankable offers sort last",
      ranked.findIndex((r) => r.ev === null) > ranked.findIndex((r) => r.ev !== null));

// ── 8. NETWORK STACK ─────────────────────────────────────────────────────────
console.log("\n8. NETWORK STACK INTEGRITY");
const prios = NETWORK_STACK.map((n) => n.priority);
check("priorities are unique", new Set(prios).size === prios.length, prios.join(","));
check("priorities are contiguous from 1",
      [...prios].sort((a, b) => a - b).every((p, i) => p === i + 1), prios.join(","));
check("the two direct-route networks are flagged as direct",
      NETWORK_STACK.filter((n) => n.direct).map((n) => n.id).sort().join(",") === "lendingtree,mediaalpha");
check("every network documents at least one action", NETWORK_STACK.every((n) => n.notes.length > 0));
check("no network is falsely marked approved",
      NETWORK_STACK.every((n) => n.status === "approved" ? n.id === "impact" : true));
check("the 30-day test is exactly three verticals", VERTICALS_30DAY_TEST.length === 3);

console.log();
if (fails) {
  console.log(`FAILED: ${fails}${warns ? `  (${warns} warning(s))` : ""}`);
  process.exit(1);
}
console.log(`ALL AFFILIATE REGISTRY CHECKS PASSED — ${LIVE_OFFERS.length} live, ${PENDING_OFFERS.length} pending` +
            `${warns ? `, ${warns} warning(s) to review` : ""}.`);
