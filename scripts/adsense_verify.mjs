#!/usr/bin/env node
/**
 * scripts/adsense_verify.mjs — make an AdSense "Not found" impossible to CAUSE.
 *
 * WHY THIS EXISTS
 *
 * AdSense's ads.txt column does not report whether a file exists. It reports
 * whether Google found ITS publisher id in a file at the root of the site. So the
 * only way the site can produce "Not found" is if something the site controls is
 * internally inconsistent:
 *
 *   1. public/ads.txt hardcodes an id that disagrees with lib/ads.ts
 *   2. the ad script / verification meta on the page announce a different id
 *   3. the file is served malformed — BOM, CRLF, no trailing LF, extra blank
 *      lines, a bad field count, a wrong cert-authority id, a wrong relationship
 *
 * Every one of those is detectable in the source tree, so none of them should
 * ever reach production. This script DERIVES ads.txt from the source of truth
 * (self-healing), then independently VERIFIES the result and the whole tree, and
 * exits non-zero if anything disagrees. The build fails rather than shipping a
 * site that can read as "Not found" for a reason we control.
 *
 * This is the same discipline as lib/sitemap-urls.ts: one definition, derived
 * everywhere, verified at build time. Every hardcoded duplicate of a shared value
 * in this repo has eventually gone stale — "733 pages", "54 widgets", "Four
 * cornerstone guides", "1,938 indexable pages". A hardcoded pub id in ads.txt is
 * that same bug waiting to fire, except this one costs the whole account.
 *
 * WHAT IT CANNOT DO
 *
 * It cannot fix a Google-side staleness or an account mismatch — if the AdSense
 * account reading this site is not the account that owns this pub id, the site
 * can be perfect forever and still read "Not found". That is not a code defect and
 * no amount of building will change it. What this script guarantees is narrower
 * but total: if the site ever reads "Not found", it is not because of anything in
 * this repository.
 *
 * Run:  node scripts/adsense_verify.mjs
 * Exit: 0 all consistent   1 something disagrees (build must not proceed)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Google's own seller id inside the ads.txt spec. Not account-specific. */
const GOOGLE_CERT_AUTHORITY_ID = "f08c47fec0942fa0";
const ADS_TXT_PATH = path.join(ROOT, "public", "ads.txt");
const ADS_TS_PATH = path.join(ROOT, "lib", "ads.ts");

const failures = [];
const checks = [];

function pass(msg) {
  checks.push(msg);
}
function fail(msg) {
  failures.push(msg);
}

// ---------------------------------------------------------------------------
// 1. Source of truth
// ---------------------------------------------------------------------------

if (!fs.existsSync(ADS_TS_PATH)) {
  fail(`lib/ads.ts is missing — there is no source of truth for the pub id.`);
}

const adsTs = fs.existsSync(ADS_TS_PATH) ? fs.readFileSync(ADS_TS_PATH, "utf8") : "";

// Read the id by executing the module's own literal, not by copying it.
const idMatch = adsTs.match(/ADSENSE_PUB_ID\s*=\s*["'`]([^"'`]+)["'`]/);
const declaredId = idMatch ? idMatch[1].trim() : "";

if (!declaredId) {
  fail("could not read ADSENSE_PUB_ID from lib/ads.ts.");
}
if (declaredId.includes("XXX")) {
  fail(
    `ADSENSE_PUB_ID is still the placeholder (${declaredId}). A placeholder id ` +
      `served in ads.txt is worse than no file: it authorises nobody and reads ` +
      `as a misconfiguration.`
  );
}

// ca-pub-1234567890123456  ->  pub-1234567890123456
const digits = declaredId.replace(/^ca-/, "").replace(/^pub-/, "");
const pubId = `pub-${digits}`;
const caPubId = `ca-pub-${digits}`;

if (!/^pub-\d{10,20}$/.test(pubId)) {
  fail(`ADSENSE_PUB_ID is not a well-formed publisher id: ${declaredId}`);
} else {
  pass(`source of truth lib/ads.ts -> ${caPubId}`);
}

// ---------------------------------------------------------------------------
// 2. Derive ads.txt from it, compare to what is committed, self-heal
// ---------------------------------------------------------------------------

const expectedLine = `google.com, ${pubId}, DIRECT, ${GOOGLE_CERT_AUTHORITY_ID}`;
const expectedBytes = Buffer.from(`${expectedLine}\n`, "utf8");

const hadFile = fs.existsSync(ADS_TXT_PATH);
const before = hadFile ? fs.readFileSync(ADS_TXT_PATH) : null;

if (before && before.equals(expectedBytes)) {
  pass(`public/ads.txt already matches the source of truth (${before.length} bytes)`);
} else {
  // ads.txt is a derived artifact, so regenerate rather than fail. This covers
  // every way it can drift — wrong id, BOM, CRLF, missing trailing newline, blank
  // line, empty, or absent entirely. Treating "absent" as a hard failure was the
  // first version of this script and it was wrong: absence is just drift, and
  // after a build the file cannot be missing or malformed at all.
  fs.writeFileSync(ADS_TXT_PATH, expectedBytes);
  const show = (b) => (b === null ? "absent" : `${b.length}B ${JSON.stringify(b.toString("utf8"))}`);
  pass(
    `public/ads.txt was ${hadFile ? "stale" : "absent"} and has been ` +
      `regenerated from lib/ads.ts\n` +
      `        was: ${show(before)}\n` +
      `        now: ${show(expectedBytes)}`
  );
}

// ---------------------------------------------------------------------------
// 3. Verify the file ON DISK as bytes — BOM, CRLF, LF, blank lines, records
// ---------------------------------------------------------------------------

if (fs.existsSync(ADS_TXT_PATH)) {
  const bytes = fs.readFileSync(ADS_TXT_PATH);

  // UTF-8 BOM. Google reads the first line literally; a BOM prepended to
  // "google.com" makes the domain field "\uFEFFgoogle.com" and matches nothing.
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    fail("ads.txt begins with a UTF-8 BOM — the first record's domain will not match.");
  } else {
    pass("no BOM");
  }

  // CRLF. Tolerated by some parsers, not by all; the spec says LF.
  if (bytes.includes(0x0d)) {
    fail("ads.txt contains CR (CRLF line endings). Use plain LF.");
  } else {
    pass("LF line endings only");
  }

  // Must end with exactly one LF — a missing one is an unterminated last record.
  if (bytes[bytes.length - 1] !== 0x0a) {
    fail("ads.txt does not end with a newline — the last record is unterminated.");
  } else if (bytes.length >= 2 && bytes[bytes.length - 2] === 0x0a) {
    fail("ads.txt ends with a blank line.");
  } else {
    pass("terminated by exactly one LF");
  }

  const text = bytes.toString("utf8");
  const lines = text.split("\n").filter((l) => l.trim() !== "");

  if (lines.length === 0) {
    fail("ads.txt has no records — an empty file reads as authorising nobody.");
  }

  let recordOk = 0;
  for (const [i, raw] of lines.entries()) {
    const line = raw.trim();

    if (line.startsWith("#")) {
      pass(`line ${i + 1}: comment`);
      continue;
    }

    const parts = line.split(",").map((p) => p.trim());

    if (parts.length !== 4) {
      fail(
        `ads.txt line ${i + 1} has ${parts.length} fields, expected 4 ` +
          `(domain, publisher id, relationship, cert authority).`
      );
      continue;
    }

    const [domain, id, relationship, cert] = parts;

    if (domain.toLowerCase() !== "google.com") {
      fail(`ads.txt line ${i + 1}: domain is "${domain}", expected "google.com".`);
    }
    if (!/^pub-\d{10,20}$/.test(id)) {
      fail(`ads.txt line ${i + 1}: "${id}" is not a well-formed publisher id.`);
    }
    if (id !== pubId) {
      fail(
        `ads.txt line ${i + 1}: publisher id is ${id} but lib/ads.ts declares ` +
          `${pubId}. A mismatch here is the single most common cause of a ` +
          `permanent, unshakable "Not found".`
      );
    }
    if (!["DIRECT", "RESELLER"].includes(relationship.toUpperCase())) {
      fail(`ads.txt line ${i + 1}: relationship "${relationship}" must be DIRECT or RESELLER.`);
    }
    if (cert.toLowerCase() !== GOOGLE_CERT_AUTHORITY_ID) {
      fail(
        `ads.txt line ${i + 1}: cert authority "${cert}" is not Google's ` +
          `${GOOGLE_CERT_AUTHORITY_ID}.`
      );
    }
    recordOk += 1;
  }

  if (recordOk >= 1 && failures.length === 0) {
    pass(`1 valid record, publisher id ${pubId}`);
  }
}

// ---------------------------------------------------------------------------
// 4. Every ca-pub / pub id mentioned anywhere in the tree must agree
// ---------------------------------------------------------------------------

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build", "out", "coverage", ".vercel",
]);
const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".txt",
  ".html", ".css", ".yml", ".yaml",
]);

const found = new Map(); // id -> Set(files)

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full);
    } else if (e.isFile()) {
      if (!TEXT_EXT.has(path.extname(e.name))) continue;
      let body;
      try {
        body = fs.readFileSync(full, "utf8");
      } catch {
        continue;
      }
      for (const m of body.matchAll(/\b(?:ca-)?pub-\d{10,20}\b/g)) {
        // Normalise to pub-<digits> so "ca-pub-X" and "pub-X" count as one
        // account rather than two. They are the same publisher id.
        const id = m[0].replace(/^ca-/, "");
        if (!found.has(id)) found.set(id, new Set());
        found.get(id).add(path.relative(ROOT, full));
      }
    }
  }
}
walk(ROOT);

// This checker is not a declaration site — its examples are illustrations, and
// counted as declarations they would make the check fail on its own source.
const SELF = path.relative(ROOT, fileURLToPath(import.meta.url));

// An obvious placeholder is documentation, not a declaration. Two shapes cover
// every placeholder convention in this repo: an ascending digit run
// (1234567890, 1234567890123456) and all zeros (0000000000).
//
// Deliberately NOT an all-same-digit rule. "9999999999999999" and
// "2222222222222222" are unusual but well-formed publisher ids, and treating
// them as examples would make the guard silently ignore a real disagreement —
// exactly the failure mode it exists to prevent. Anything not matching the two
// shapes below is presumed to be a real account id and must agree.
const isExample = (id) => {
  const d = id.replace(/^ca-/, "").replace(/^pub-/, "");
  return /^1?234567890\d*$/.test(d) || /^0+$/.test(d);
};

const declared = new Map(); // real ids -> files that mention them
const examples = new Map();

for (const [id, files] of found) {
  const real = [...files].filter((f) => f !== SELF);
  if (!real.length) continue;
  const bucket = isExample(id) ? examples : declared;
  if (!bucket.has(id)) bucket.set(id, new Set());
  for (const f of real) bucket.get(id).add(f);
}

const mismatched = [...declared.keys()].filter((id) => id !== pubId);

if (mismatched.length) {
  for (const id of mismatched) {
    const files = [...declared.get(id)].slice(0, 6).join(", ");
    fail(
      `the tree declares ${id} but lib/ads.ts declares ${pubId} — in ${files}. ` +
        `Two publisher ids means one of them is the wrong account, and AdSense ` +
        `reports the one it cannot find as "Not found".`
    );
  }
} else {
  const refs = [...declared.values()].reduce((n, s) => n + s.size, 0);
  const n = declared.size;
  pass(
    `${n} publisher id${n === 1 ? "" : "s"} in the tree, agreeing across ` +
      `${refs} file reference${refs === 1 ? "" : "s"}`
  );
}

for (const [id, files] of examples) {
  pass(`example id ${id} in ${[...files].join(", ")} — documentation, never served`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const line = "─".repeat(68);
console.log(`\n${line}\nAdSense consistency — derived from lib/ads.ts, verified end to end\n${line}`);
console.log(`  publisher id   ${caPubId}\n`);
for (const c of checks) console.log(`  ok    ${c}`);

if (failures.length) {
  console.log();
  for (const f of failures) console.log(`  FAIL  ${f}`);
  const word = failures.length === 1 ? "inconsistency" : "inconsistencies";
  console.log(
    `\n${failures.length} ${word} — refusing to build.\n` +
      `A site that can read as "Not found" for a reason we control must not ship.\n`
  );
  process.exit(1);
}

console.log(`\n  0 inconsistencies. /ads.txt is exactly what the source of truth implies.`);
console.log(`  Any "Not found" from here is Google-side, not this repository.\n`);
process.exit(0);
