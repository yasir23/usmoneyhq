#!/usr/bin/env node
/**
 * verify_static_schema.mjs — build-time guard for the pages that carry the
 * site's identity and its guide collection.
 *
 * WHY THIS EXISTS
 * On 2026-10-21 /about, /methodology and /contact shipped with ZERO
 * application/ld+json blocks, and /guides — the hub linking every guide —
 * also shipped none. Tool pages and individual guides were fine, so the gap
 * was invisible unless you fetched exactly those URLs. That is the class of
 * defect that comes back: nothing fails, nothing 500s, the pages simply stop
 * telling an answer engine who publishes them.
 *
 * A note in a skill is not a guard. This runs in `npm run build` after
 * `next build` and FAILS the build.
 *
 * WHAT IT ASSERTS (per page below):
 *   1. at least one <script type="application/ld+json"> block
 *   2. every block parses as JSON
 *   3. an Organization node is present somewhere in the graph
 *   4. the page's own @type is present (AboutPage / ContactPage / WebPage /
 *      CollectionPage / WebSite)
 *   5. /guides additionally carries an ItemList whose numberOfItems matches the
 *      number of ListItems actually emitted
 *
 * Usage:
 *   node scripts/verify_static_schema.mjs                 # assert (default set)
 *   node scripts/verify_static_schema.mjs --page privacy-policy --type WebPage
 *       # red-test: point it at a page that should FAIL
 */
import fs from "node:fs";
import path from "node:path";

const PAGES_DIR = path.join(process.cwd(), ".next", "server", "pages");

/** page file -> schema @type it must carry */
const REQUIRED = {
  "index.html": "WebSite",
  "about.html": "AboutPage",
  "contact.html": "ContactPage",
  "methodology.html": "WebPage",
  "guides.html": "CollectionPage",
  "privacy-policy.html": "WebPage",
  "terms.html": "WebPage",
};

const args = process.argv.slice(2);
const argOf = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1] || null;
};

const targets = argOf("--page")
  ? { [`${argOf("--page")}.html`]: argOf("--type") || "WebPage" }
  : REQUIRED;

function collectTypes(node, out = []) {
  if (Array.isArray(node)) {
    node.forEach((n) => collectTypes(n, out));
  } else if (node && typeof node === "object") {
    if (node["@type"]) out.push(node["@type"]);
    Object.values(node).forEach((v) => collectTypes(v, out));
  }
  return out;
}

let failures = 0;
const fail = (page, msg) => {
  console.error(`FAIL ${page}: ${msg}`);
  failures += 1;
};

for (const [file, wantedType] of Object.entries(targets)) {
  const abs = path.join(PAGES_DIR, file);
  if (!fs.existsSync(abs)) {
    fail(file, `prerendered HTML not found at ${abs}`);
    continue;
  }
  const html = fs.readFileSync(abs, "utf8");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);

  if (blocks.length === 0) {
    fail(file, "no application/ld+json block — this page tells no engine who publishes it");
    continue;
  }

  let types = [];
  let parsedAll = true;
  for (const raw of blocks) {
    try {
      types = types.concat(collectTypes(JSON.parse(raw)));
    } catch (e) {
      parsedAll = false;
      fail(file, `invalid JSON-LD: ${e.message}`);
    }
  }
  if (!parsedAll) continue;

  if (!types.includes("Organization")) {
    fail(file, "JSON-LD graph has no Organization node (publisher identity missing)");
  }
  if (!types.includes(wantedType)) {
    fail(file, `expected a "${wantedType}" node, found: ${[...new Set(types)].join(", ")}`);
  }

  // CollectionPage must enumerate what it collects.
  if (wantedType === "CollectionPage") {
    const list = blocks
      .map((b) => JSON.parse(b))
      .flatMap((d) => (d["@graph"] ? d["@graph"] : [d]))
      .find((n) => n["@type"] === "ItemList");
    if (!list) {
      fail(file, "CollectionPage has no ItemList — the guide set is not machine-readable");
    } else if (!Array.isArray(list.itemListElement) || list.itemListElement.length !== list.numberOfItems) {
      fail(file, `ItemList numberOfItems (${list.numberOfItems}) does not match emitted items (${list.itemListElement?.length ?? 0})`);
    } else if (list.numberOfItems < 10) {
      fail(file, `ItemList lists only ${list.numberOfItems} items — the hub renders far more`);
    }
  }
}

if (failures > 0) {
  console.error(`\nSTATIC SCHEMA CHECK FAILED — ${failures} problem(s).`);
  process.exit(1);
}
console.log(`STATIC SCHEMA CHECK — OK: ${Object.keys(targets).length} page(s) carry valid JSON-LD with a publisher node.`);
