// Guards the geo gate that decides whether US-only affiliate CTAs render.
//
// Why a script and not a browser check: the affiliate offers are US-only
// programs, so the property that must never regress is "a non-US visitor sees
// nothing". A browser running in Pakistan can only ever exercise that one
// branch — it cannot prove the US branch works. shouldShowUS is a pure
// function, so both directions are testable here.
//
// The precedence under test (from lib/geo.js):
//   1. server country  — authoritative, from Cloudflare edge data
//   2. geo cookie      — same data, for the static pages that have no server prop
//   3. timezone        — last resort, only when neither of the above exists
// An explicit non-US country from 1 or 2 is FINAL; it must not fall through to
// the timezone guess.
import { shouldShowUS } from "../lib/geo.js";

let fails = 0;
function t(label, got, want) {
  const ok = got === want;
  if (!ok) fails++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(62)} got=${got} want=${want}`);
}

console.log("1. SERVER COUNTRY IS AUTHORITATIVE");
t("US server -> show", shouldShowUS("US", "", ""), true);
t("PK server -> hide", shouldShowUS("PK", "", ""), false);
t("PK server beats US cookie -> hide", shouldShowUS("PK", "US", ""), false);

console.log("\n2. GEO COOKIE IS THE FALLBACK FOR STATIC PAGES (the real US path)");
t("no server + US cookie -> show", shouldShowUS("", "US", ""), true);
t("no server + PK cookie -> hide", shouldShowUS("", "PK", ""), false);

console.log("\n3. AN EXPLICIT NON-US SIGNAL IS FINAL — NO TIMEZONE FALL-THROUGH");
t("PK server + US tz -> hide", shouldShowUS("PK", "", "America/New_York"), false);
t("PK cookie + US tz -> hide", shouldShowUS("", "PK", "America/New_York"), false);

console.log("\n4. TIMEZONE IS THE LAST RESORT, ONLY WHEN NOTHING ELSE EXISTS");
t("nothing + US tz -> show", shouldShowUS("", "", "America/New_York"), true);
t("nothing + PK tz -> hide", shouldShowUS("", "", "Asia/Karachi"), false);
t("nothing + Toronto tz -> hide (Canada is not the US)",
  shouldShowUS("", "", "America/Toronto"), false);

console.log("\n5. NORMALISATION");
t("lowercase us -> show", shouldShowUS("us", "", ""), true);
t("padded ' US ' -> show", shouldShowUS(" US ", "", ""), true);

console.log("\n6. FAIL CLOSED — no signal at all must NOT show a US-only offer");
t("all empty -> hide", shouldShowUS("", "", ""), false);

console.log(fails === 0 ? "\nALL GEO CHECKS PASSED." : `\n${fails} GEO CHECK(S) FAILED.`);
process.exit(fails === 0 ? 0 : 1);
