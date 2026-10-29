import Head from "next/head";
import { staticPageSchema } from "../lib/pageSchema";

/**
 * /editorial-policy — how the tools are built, sourced and corrected.
 *
 * This is the page that answers "why should a reviewer believe these numbers".
 * Deliberately makes no claim of credentialed review, because there is no CFP or
 * CPA attached yet. Claiming one that does not exist would be the single fastest
 * way to lose the account that this page is meant to help win.
 */
const SCHEMA = staticPageSchema({
  name: "Editorial Policy | US Money HQ",
  description:
    "How US Money HQ builds its calculators, which sources the figures come from, and how corrections are handled.",
  path: "/editorial-policy",
  type: "WebPage",
  dateModified: "2026-10-29",
});

export default function EditorialPolicy() {
  return (
    <>
      <Head>
        <title>Editorial Policy &amp; Fact-Checking | US Money HQ</title>
        <meta
          name="description"
          content="How US Money HQ builds its calculators, which sources the figures come from, and how corrections are handled."
        />
        <link rel="canonical" href="https://usmoneyhq.com/editorial-policy" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Editorial policy</span></nav>
        <h1>Editorial Policy &amp; Fact-Checking</h1>
        <p className="muted">Last updated: 29 October 2026</p>

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

        <h2>Corrections</h2>
        <p>
          If a rate is wrong or outdated, tell us through the address on the <a href="/about">about page</a>.
          Corrections to a figure are applied to the calculator and the page date is updated. Anything
          affecting a published result is corrected before any new tool is built.
        </p>

        <h2>Independence</h2>
        <p>
          Advertising and affiliate relationships are disclosed on the{" "}
          <a href="/disclosure">disclosure page</a>. No advertiser or affiliate partner reviews, approves or
          edits the formula behind any calculator on this site.
        </p>
      </main>
    </>
  );
}
