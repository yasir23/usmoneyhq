import Head from "next/head";
import { staticPageSchema } from "../lib/pageSchema";
import { TOOLS } from "../lib/tools";

/**
 * /editorial-policy — how the tools are built, sourced and corrected.
 *
 * This is the page that answers "why should a reviewer believe these numbers".
 * Deliberately makes no claim of credentialed review, because there is no CFP or
 * CPA attached yet. Claiming one that does not exist would be the single fastest
 * way to lose the account that this page is meant to help win.
 *
 * DEEPENED 2026-11-02. Measured at 442 visible words (scripts/thin_breakdown.py) —
 * the second-thinnest page on a domain whose whole appeal turns on whether the
 * figures can be trusted. Two rules governed the expansion: every claim had to be
 * checkable against the repository (the build gate, lib/calc.ts, the content
 * verifier), and the tool count had to be DERIVED from the registry rather than
 * typed, so it cannot drift the way the hardcoded counts did elsewhere.
 *
 * The state-tax paragraph deliberately reuses the "interpolated" wording that
 * scripts/claims_verify.mjs enforces across every file describing the method, and
 * this file was added to that script's DESCRIBERS list in the same change.
 */
const SCHEMA = staticPageSchema({
  name: "Editorial Policy | US Money HQ",
  description:
    "How US Money HQ builds its calculators, which sources the figures come from, what is checked before a release, and how corrections are handled.",
  path: "/editorial-policy",
  type: "WebPage",
  dateModified: "2026-11-02",
});

export default function EditorialPolicy() {
  const toolCount = TOOLS.length;
  return (
    <>
      <Head>
        <title>Editorial Policy &amp; Fact-Checking | US Money HQ</title>
        <meta
          name="description"
          content="How US Money HQ builds its calculators, which sources the figures come from, what is checked before a release, and how corrections are handled."
        />
        <link rel="canonical" href="https://usmoneyhq.com/editorial-policy" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Editorial policy</span></nav>
        <h1>Editorial Policy &amp; Fact-Checking</h1>
        <p className="muted">Last updated: 2 November 2026</p>

        <p>
          This page explains how a figure gets onto this site, what is checked before a page is published, what we
          will not publish, and what happens when something turns out to be wrong. It applies to every calculator in
          the registry — currently {toolCount} of them — and to the guides that embed them.
        </p>

        <h2>How a calculator gets published</h2>
        <ol>
          <li>
            <strong>The formula is written down first.</strong> Every tool records the formula it applies and
            the inputs it accepts, in plain language, on the tool page itself.
          </li>
          <li>
            <strong>The rates come from the agency that publishes them.</strong> Federal tax brackets and
            standard deductions from the IRS, Social Security rules from the SSA, retirement contribution
            limits from the IRS, state income tax from the state revenue department&apos;s own schedule, and
            published borrowing thresholds from the CFPB where a rule is involved.
          </li>
          <li>
            <strong>Every rate carries the year it applies to.</strong> A tool that has not been updated for
            the current tax year says so on the page rather than silently showing last year&apos;s figure.
          </li>
          <li>
            <strong>The output is tested before release.</strong> The build fails if a published claim does
            not match what the code computes, and a calculation check runs against known-value cases.
          </li>
        </ol>

        <h2>Where each figure comes from</h2>
        <p>
          The source for a figure is the agency or schedule that governs it. Where a tool depends on a rate the
          publisher does not control — an interest rate, a premium, a fee — the figure comes from your input, not from
          an assumption we have made for you.
        </p>
        <ul>
          <li><strong>IRS</strong> — federal income tax brackets and standard deductions, retirement contribution limits, and the filing-status rules that select between them.</li>
          <li><strong>Social Security Administration</strong> — FICA rates and the wage base, and the benefit adjustments that apply when a claim starts before or after full retirement age.</li>
          <li><strong>Consumer Financial Protection Bureau</strong> — published lending thresholds and guidance, where a rule is encoded in a tool such as a debt-to-income or affordability check.</li>
          <li><strong>HUD</strong> — the FHA mortgage insurance structure: the upfront premium financed into the loan and the annual premium charged on the base loan amount.</li>
          <li><strong>Department of Veterans Affairs</strong> — the VA funding-fee schedule by down payment and prior use, and the exemption that applies to a disabled veteran.</li>
          <li><strong>US Census Bureau</strong> — the metro-level income and home-value inputs behind the studies and guides that compare places to one another.</li>
          <li><strong>State revenue departments</strong> — each state&apos;s income tax type and its published rates, which is what the state pages are built on.</li>
        </ul>

        <h2>One engine, no hand-typed results</h2>
        <p>
          Every figure the site publishes is computed by a single calculation layer from the inputs on the page, at
          the moment the page is rendered. Numbers are not typed into the page text by hand. Where explanatory prose
          quotes a worked example — &quot;on a 300,000 loan at 6.5 percent, the payment is this&quot; — that example
          is produced by the same code that produces the calculator&apos;s output, so the explanation and the tool
          cannot drift apart.
        </p>
        <p>
          This is a deliberate constraint, and it is the reason some pages are thinner than they could be. An
          illustrative number that was never computed is the easiest way to make a calculator site wrong, so it is
          not allowed here.
        </p>

        <h2>What runs before a release</h2>
        <p>
          Publishing is gated. A build that fails any of the following does not deploy:
        </p>
        <ul>
          <li>
            <strong>A claim check</strong> that compares every description of how state income tax is calculated
            against what the code actually does, and fails on wordings that overstate it.
          </li>
          <li>
            <strong>A calculation suite</strong> of known-value cases — inputs whose correct output is established
            independently — covering the tax, loan, retirement and everyday tools.
          </li>
          <li>
            <strong>A content verifier</strong> that recomputes the worked examples in the long-form explanatory text
            and asserts each published figure against the engine.
          </li>
          <li>
            <strong>Structural checks</strong> on the guides, the structured data on each page, and the machine-readable
            summary the site publishes for search engines and AI agents.
          </li>
        </ul>
        <p>
          When one of these fails, the page is rewritten or the code is fixed — the check is not relaxed to let the
          page through.
        </p>

        <h2>State income tax is an estimate, and is labelled as one</h2>
        <p>
          State income tax is where a general calculator is most likely to mislead, so the method is worth stating
          precisely. Flat-rate states use their exact published rate, and the states that levy no income tax return
          zero. Progressive states are <strong>interpolated</strong> between that state&apos;s own lowest and highest
          marginal rates. The method does not model state bracket thresholds, deductions, credits, or local and city
          taxes, so a state figure can differ from what you actually owe. State figures are presented as estimates
          for that reason.
        </p>

        <h2>What we will not publish</h2>
        <ul>
          <li>A number we cannot derive from a stated formula.</li>
          <li>A figure without a source year attached to it.</li>
          <li>An estimate presented as a quoted rate.</li>
          <li>Unreviewed machine-generated text presented as expert guidance.</li>
        </ul>

        <h2>Review status, stated plainly</h2>
        <p>
          The calculators are built and tested by the publisher against primary government sources. As of the
          date above, no external Certified Financial Planner, CPA or Enrolled Agent has reviewed them, and
          we do not claim one has. If a credentialed reviewer is engaged, their name, credential and
          verification link will appear on this page and in the author markup of every page they review.
        </p>
        <p>
          We do not publish invented bylines. Where a page has no named human author, it does not carry a name.
        </p>

        <h2>How automation is used</h2>
        <p>
          Drafting, research and testing on this site are assisted by software, and the publisher is responsible for
          everything that ships. Automation does not get to assert a figure: every number is derived by the
          calculation layer and checked by the gates described above before publication. Explanatory text is reviewed
          by a person before it goes live, and machine-drafted text is not published as expert guidance.
        </p>

        <h2>Corrections</h2>
        <p>
          If a rate is wrong or outdated, tell us through the address on the <a href="/about">about page</a>.
          Corrections to a figure are applied to the calculator and the page date is updated. Anything
          affecting a published result is corrected before any new tool is built.
        </p>
        <p>
          When a correction changes a number a reader may already have relied on, the replacement figure is published
          with the same derivation as the original — a correction that cannot be derived is not a correction, it is a
          second guess.
        </p>

        <h2>Freshness and dates</h2>
        <p>
          Dates on this site reflect material content changes, not deployments. A rate change, a formula change or a
          rewritten explanation moves the date; a stylesheet fix or a server upgrade does not. The date published for
          each section of the site comes from a maintained record of those changes, which is why two pages updated in
          the same week can carry different dates.
        </p>

        <h2>Independence</h2>
        <p>
          Advertising and affiliate relationships are disclosed on the <a href="/disclosure">disclosure page</a>. No
          advertiser or affiliate partner reviews, approves or edits the formula behind any calculator on this site,
          and no commercial relationship changes a result. The formula-level detail behind each tool is on the{" "}
          <a href="/methodology">methodology page</a>.
        </p>
      </main>
    </>
  );
}
