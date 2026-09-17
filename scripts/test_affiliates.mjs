// Guards the affiliate registry. Run before any deploy that touches offers.
// The failure this prevents: flipping `live: true` on a placeholder homepage,
// which renders a CTA that earns nothing while looking monetized.
import { AFFILIATE_OFFERS, LIVE_OFFERS, PENDING_OFFERS } from "../lib/affiliates.ts";

let fails = 0;
function check(label, cond, detail = "") {
  console.log(`  ${label.padEnd(64)} ${cond ? "PASS" : `FAIL ${detail}`}`);
  if (!cond) fails++;
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

console.log();
if (fails) {
  console.log(`FAILED: ${fails}`);
  process.exit(1);
}
console.log(`ALL AFFILIATE REGISTRY CHECKS PASSED — ${LIVE_OFFERS.length} live, ${PENDING_OFFERS.length} pending.`);
