// Test the US-only geo decision in BOTH directions before deploying.
// A gate that never opens and a gate that never closes are both bugs: the first
// earned zero affiliate revenue for weeks, the second would show US offers to
// Canada (America/Toronto) and every other country.
import { shouldShowUS, normalizeCountry } from "../lib/geo.js";

let fails = 0;
function check(label, got, want) {
  const ok = got === want;
  console.log(`  ${label.padEnd(62)} ${ok ? "PASS" : `FAIL (got ${got}, want ${want})`}`);
  if (!ok) fails++;
}

console.log("1. SERVER SIGNAL IS AUTHORITATIVE");
check("server US -> show", shouldShowUS("US", "", ""), true);
check("server GB -> hide", shouldShowUS("GB", "", ""), false);
check("server US beats a GB cookie", shouldShowUS("US", "GB", "Asia/Karachi"), true);
check("server GB beats a US cookie", shouldShowUS("GB", "US", "America/New_York"), false);
check("lowercase 'us' normalises", shouldShowUS("us", "", ""), true);
check("whitespace ' US ' normalises", shouldShowUS(" US ", "", ""), true);

console.log("\n2. COOKIE FALLBACK (this is what the 111 static pages now rely on)");
check("no server, cookie US -> show", shouldShowUS("", "US", ""), true);
check("no server, cookie GB -> hide", shouldShowUS("", "GB", "America/New_York"), false);

console.log("\n3. TIMEZONE FALLBACK (only when no real country exists)");
check("tz America/New_York -> show", shouldShowUS("", "", "America/New_York"), true);
check("tz America/Los_Angeles -> show", shouldShowUS("", "", "America/Los_Angeles"), true);
check("tz America/Toronto -> HIDE (Canada, must not leak)", shouldShowUS("", "", "America/Toronto"), false);
check("tz America/Vancouver -> HIDE", shouldShowUS("", "", "America/Vancouver"), false);
check("tz America/Mexico_City -> HIDE", shouldShowUS("", "", "America/Mexico_City"), false);
check("tz Asia/Karachi -> hide", shouldShowUS("", "", "Asia/Karachi"), false);
check("tz Europe/London -> hide", shouldShowUS("", "", "Europe/London"), false);
check("no signal at all -> hide (fail closed)", shouldShowUS("", "", ""), false);

console.log("\n4. NORMALISATION");
check("'us' -> US", normalizeCountry("us"), "US");
check("undefined -> ''", normalizeCountry(undefined), "");
check("' USA ' -> US (truncated to 2)", normalizeCountry(" USA "), "US");

console.log();
if (fails) {
  console.log(`FAILED: ${fails}`);
  process.exit(1);
}
console.log("ALL GEO CHECKS PASSED — gate opens for US, closes for everyone else.");
