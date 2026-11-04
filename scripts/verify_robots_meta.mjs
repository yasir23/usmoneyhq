#!/usr/bin/env node
/**
 * verify_robots_meta.mjs — build-time guard: exactly ONE robots meta tag per page.
 *
 * WHY THIS EXISTS
 * A site-wide `<meta name="robots" content="index, follow, ...">` has now been
 * added to pages/_document.js and removed again TWICE:
 *
 *   2026-09-18 -> 09-22   broke the 2,907 amount x state pages
 *   2026-11-02 -> 11-04   broke every noindex variant page (shipped trying to
 *                         add max-image-preview:large site-wide); found by
 *                         site_integrity_heartbeat.py as ROBOTS_CONFLICT and left
 *                         live for two days
 *
 * Every noindex variant page then served TWO robots tags:
 *
 *     <meta name="robots" content="noindex, follow"/>
 *     <meta name="robots" content="index, follow, max-image-preview:large"/>
 *
 * That is the self-contradiction this site was rejected for. Google resolves the
 * conflict to the most restrictive directive, so the intent held by luck — the
 * page still stated both things at once, and the site depended on conflict
 * resolution instead of a plain declaration.
 *
 * WHY A SOURCE ASSERTION IS REQUIRED (not just an HTML scan)
 * The conflicting pages are SERVER-RENDERED variants, so they are NOT present in
 * .next/server/pages/*.html. Scanning prerendered HTML alone reports "clean"
 * while ~2,900 live URLs conflict. The regression lives in ONE file, so the
 * primary guard asserts on that file directly; the HTML scan is the backstop for
 * any other source that emits a second tag.
 *
 * CONTRACT
 *   exit 0 — one tag per page (or none), and no site-wide tag in _document.js
 *   exit 1 — a violation, with the offending page/file named
 *
 * Usage:
 *   node scripts/verify_robots_meta.mjs              # build gate
 *   node scripts/verify_robots_meta.mjs --selftest   # fixtures, both directions
 */

import fs from "node:fs";
import path from "node:path";

/* ------------------------------------------------------------------ detectors */

/** All `<meta name="robots">` tags in a chunk of HTML, attribute order tolerant. */
export function robotsTags(html) {
  return [...html.matchAll(/<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*>/gi)].map((m) =>
    (m[0].match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [null, ""])[1].trim()
  );
}

/**
 * Classify a page's robots directives.
 * A page is a violation if it carries more than one tag (regardless of whether
 * they happen to agree — two tags is how the conflict gets invented later), or if
 * a single tag carries both `index` and `noindex`.
 */
export function classify(tags) {
  const tokens = tags.flatMap((t) => t.toLowerCase().split(/[\s,]+/).filter(Boolean));
  const hasIndex = tokens.includes("index");
  const hasNoindex = tokens.includes("noindex");
  if (tags.length > 1) {
    return { ok: false, reason: `${tags.length} robots tags: ${JSON.stringify(tags)}` };
  }
  if (hasIndex && hasNoindex) {
    return { ok: false, reason: `single tag mixes index and noindex: ${JSON.stringify(tags)}` };
  }
  return { ok: true, noindex: hasNoindex };
}

/* -------------------------------------------------------------------- fixtures */

const FIXTURES = [
  // [name, html, expected ok]
  ["clean, no tag", "<head><title>x</title></head>", true],
  ["clean, one index tag", '<head><meta name="robots" content="index, follow, max-image-preview:large"></head>', true],
  ["clean, one noindex tag", '<head><meta name="robots" content="noindex, follow"/></head>', true],
  ["BAD: the shipped regression", '<head><meta name="robots" content="noindex, follow"/><meta name="robots" content="index, follow, max-image-preview:large"></head>', false],
  ["BAD: two identical tags", '<head><meta name="robots" content="index, follow"><meta name="robots" content="index, follow"></head>', false],
  ["BAD: one tag mixing both", '<head><meta name="robots" content="index, noindex"></head>', false],
  ["tolerates attribute order", "<head><meta content='noindex, follow' name='robots'></head>", true],
  ["ignores other meta", '<head><meta name="googlebot" content="index"></head>', true],
];

function selftest() {
  let bad = 0;
  for (const [name, html, expected] of FIXTURES) {
    const got = classify(robotsTags(html)).ok;
    if (got !== expected) {
      console.error(`SELFTEST FAIL ${name}: expected ok=${expected}, got ok=${got}`);
      bad += 1;
    }
  }
  // The source detector must fire on the exact text that shipped.
  const regressed = '          <meta name="robots" content="index, follow, max-image-preview:large" />';
  const clean = "          {/* no site-wide robots tag */}";
  if (sitewideTag(regressed) === null) {
    console.error("SELFTEST FAIL: sitewideTag() missed the exact shipped regression line");
    bad += 1;
  }
  if (sitewideTag(clean) !== null) {
    console.error("SELFTEST FAIL: sitewideTag() fired on a file with no robots tag");
    bad += 1;
  }
  if (bad > 0) {
    console.error(`\nROBOTS SELFTEST FAILED — ${bad} fixture(s).`);
    process.exit(1);
  }
  console.log(`ROBOTS SELFTEST — OK: ${FIXTURES.length + 2} fixtures, both directions.`);
  process.exit(0);
}

/* -------------------------------------------------------------- source guard */

/** The site-wide tag in _document.js, if present. Matches JSX, not a comment. */
export function sitewideTag(fileText) {
  const stripped = fileText.replace(/\{\/\*[\s\S]*?\*\/\}/g, ""); // drop JSX comments
  const tags = robotsTags(stripped);
  return tags.length > 0 ? tags : null;
}

/* ---------------------------------------------------------------------- main */

function walkHtml(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(abs, out);
    else if (entry.name.endsWith(".html")) out.push(abs);
  }
  return out;
}

function main() {
  if (process.argv.includes("--selftest")) selftest();

  // --doc <path> runs the SOURCE assertion only, against an arbitrary file.
  // That is how the guard is proven in the red direction: point it at the
  // pre-fix revision (`git show <sha>:pages/_document.js > /tmp/old.js`) and it
  // must fail; point it at the current file and it must pass.
  const docArgIdx = process.argv.indexOf("--doc");
  const docOnly = docArgIdx !== -1 ? process.argv[docArgIdx + 1] : null;

  const root = process.cwd();
  let failures = 0;
  const fail = (where, msg) => {
    console.error(`FAIL ${where}: ${msg}`);
    failures += 1;
  };

  // 1. PRIMARY — _document.js must not emit a robots tag, ever.
  const docPath = docOnly ? path.resolve(docOnly) : path.join(root, "pages", "_document.js");
  if (!fs.existsSync(docPath)) {
    fail("pages/_document.js", "not found — cannot assert the one-tag invariant");
  } else {
    const tags = sitewideTag(fs.readFileSync(docPath, "utf8"));
    if (tags) {
      fail(
        docOnly || "pages/_document.js",
        `emits a site-wide robots tag ${JSON.stringify(tags)}. It renders on EVERY route, ` +
          `so every page declaring its own directive gets TWO tags. Put the directive in the ` +
          `page-level tag instead (see components/ToolPageShell.tsx). This has shipped twice.`
      );
    }
  }

  if (docOnly) {
    if (failures > 0) {
      console.error(`\nROBOTS META CHECK FAILED — ${failures} problem(s).`);
      process.exit(1);
    }
    console.log(`ROBOTS META CHECK — OK: ${docOnly} emits no site-wide robots tag.`);
    return;
  }

  // 2. BACKSTOP — every prerendered page must carry at most one robots tag.
  const pagesDir = path.join(root, ".next", "server", "pages");
  const files = walkHtml(pagesDir);
  if (files.length === 0) {
    fail(".next/server/pages", "no prerendered HTML found — is this running after `next build`?");
  }
  for (const abs of files) {
    const rel = path.relative(pagesDir, abs);
    const verdict = classify(robotsTags(fs.readFileSync(abs, "utf8")));
    if (!verdict.ok) fail(rel, verdict.reason);
  }

  if (failures > 0) {
    console.error(`\nROBOTS META CHECK FAILED — ${failures} problem(s).`);
    process.exit(1);
  }
  console.log(
    `ROBOTS META CHECK — OK: _document.js emits no site-wide tag; ${files.length} prerendered page(s) carry at most one.`
  );
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invokedDirectly) main();
