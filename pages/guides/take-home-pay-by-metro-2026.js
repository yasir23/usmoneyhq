import Head from "next/head";
import Link from "next/link";
import fs from "fs";
import path from "path";
import ToolClient from "../../components/ToolClient";
import GuideFaq from "../../components/GuideFaq";
import AdSlot from "../../components/AdSlot";
import { getTool, SITE_URL } from "../../lib/tools";
import { contentDateLabel } from "../../lib/content-dates";

/**
 * /guides/take-home-pay-by-metro-2026 — the published HTML face of our own
 * take-home-pay dataset.
 *
 * WHY THIS PAGE EXISTS
 * --------------------
 * `public/data/take-home-pay.json` has been live since 2026-09-16 and is the
 * asset the backlink / digital-PR campaign is built on — but until now it had
 * no human-readable page. A journalist cannot cite a JSON file, and an outreach
 * pitch that says "see our data" with nothing to link to is an unlinkable
 * claim. This page is the citable target: real numbers, the full method, the
 * stated limitations, and an explicit attribution string.
 *
 * EVERY NUMBER IS DERIVED, NEVER RETYPED
 * --------------------------------------
 * The table and the headline gap are read from the JSON at build time and the
 * top/bottom metros are SORTED out of it. Nothing here is a hardcoded figure,
 * so the page cannot drift from the data it is publishing. If the file is
 * missing or empty the page returns 404 rather than rendering an empty report —
 * a data page that silently renders nothing is worse than a missing one.
 *
 * HONESTY NOTE ON THE GRAIN OF THE DATA
 * -------------------------------------
 * The model applies STATE-level effective rates, so every metro inside one
 * state reports the same figure (all six California metros are identical, as
 * are the twelve in no-income-tax states). That is disclosed in the methodology
 * section rather than implied away: the page is titled "by metro" because the
 * reader wants their metro, and it says plainly when two metros share a number
 * and why. Local city income taxes are excluded.
 */

const money = (n) => "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const pct = (n) => n.toFixed(1) + "%";

export async function getStaticProps() {
  const file = path.join(process.cwd(), "public", "data", "take-home-pay.json");
  let data = null;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    data = null;
  }
  const metros = data && Array.isArray(data.metros) ? data.metros : [];
  if (metros.length === 0) {
    // Fail loudly. An empty report would publish as "0 metros" and read as a
    // real result, which is the failure mode this whole page exists to avoid.
    return { notFound: true };
  }

  // Sorted, so "highest / lowest" is a measurement rather than an assumption
  // about the order the file happens to be written in.
  const ranked = [...metros].sort(
    (a, b) => b.net_100000 - a.net_100000 || String(a.metro).localeCompare(String(b.metro))
  );
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];

  return {
    props: {
      metros: ranked,
      generated: data.generated || null,
      salaries: data.salaries || [60000, 100000, 150000],
      top,
      bottom,
      gap: top.net_100000 - bottom.net_100000,
      distinctOutcomes: new Set(metros.map((m) => m.net_100000)).size,
      distinctStates: new Set(metros.map((m) => m.state)).size,
    },
    revalidate: 86400,
  };
}

export default function TakeHomePayByMetro({ metros, generated, top, bottom, gap, distinctOutcomes, distinctStates }) {
  const tool = getTool("take-home-pay-calculator");
  const updated = contentDateLabel("guides");
  const title = "Take-Home Pay in America's 50 Largest Metros (2026) | US Money HQ";
  const description =
    `On a $100,000 salary, the same gross pay nets ${money(top.net_100000)} in ${top.metro} and ` +
    `${money(bottom.net_100000)} in ${bottom.metro} — a ${money(gap)} gap for identical work. ` +
    `Full table for 50 metros, with method and limitations.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}/guides/take-home-pay-by-metro-2026`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: "Take-Home Pay in America's 50 Largest Metros (2026)",
              description,
              author: { "@type": "Organization", name: "US Money HQ" },
              publisher: { "@type": "Organization", name: "US Money HQ" },
              datePublished: "2026-10-12",
              dateModified: "2026-10-12",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Dataset",
              name: "Real take-home pay in America's 50 largest metros (2026)",
              description:
                "Annual net pay after federal income tax, FICA and state income tax for three reference salaries in 50 US metros, computed with the US Money HQ pay engine.",
              creator: { "@type": "Organization", name: "US Money HQ" },
              license: `${SITE_URL}/terms`,
              isAccessibleForFree: true,
              url: `${SITE_URL}/guides/take-home-pay-by-metro-2026`,
              distribution: [
                {
                  "@type": "DataDownload",
                  encodingFormat: "application/json",
                  contentUrl: `${SITE_URL}/data/take-home-pay.json`,
                },
              ],
            }),
          }}
        />
      </Head>
      <main className="container">
        <nav className="breadcrumbs">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href="/guides">Guides</Link>
          <span aria-hidden="true">›</span>
          <span>Take-Home Pay by Metro</span>
        </nav>
        <h1>Take-Home Pay in America&rsquo;s 50 Largest Metros</h1>
        <p className="sub">
          The same gross salary does not buy the same net pay. We ran three reference salaries through
          our own pay engine for all {metros.length} metros and published the whole table.
        </p>
        <p className="sub" style={{ fontSize: "0.875rem" }}>
          Last updated {updated}. Figures computed {generated ? generated.slice(0, 10) : "by our engine"}.
        </p>

        <AdSlot id="guide-thp-top" />

        <div className="seo">
          <h2>The finding</h2>
          <p>
            On a <strong>$100,000</strong> salary, annual take-home pay runs from{" "}
            <strong>{money(top.net_100000)}</strong> in {top.metro}, {top.state} down to{" "}
            <strong>{money(bottom.net_100000)}</strong> in {bottom.metro}, {bottom.state}. That is a{" "}
            <strong>{money(gap)}</strong> difference for identical gross pay — about{" "}
            {money(Math.round(gap / 12))} a month.
          </p>
          <p>
            Across the {metros.length} metros there are only{" "}
            <strong>{distinctOutcomes} distinct outcomes</strong>, because income tax is charged by the
            state, not the city: the {metros.length} metros span {distinctStates} states. Every metro in a
            state without an income tax reports the same figure, and every metro in California reports
            the same figure regardless of local cost of living.
          </p>
          <p>
            State income tax is the whole story at this salary. Federal brackets and FICA are identical
            everywhere, so the entire spread is the state rate — which is why the ranking below is
            essentially a ranking of state tax policy, and why a remote worker who can choose their
            state of residence is choosing this number.
          </p>
        </div>

        <div className="seo">
          <h2>Annual take-home pay, {metros.length} metros</h2>
          <p>
            Each row is one metro. The right-hand column is the total effective rate — federal income
            tax plus FICA plus state income tax — as a share of gross pay at $100,000.
          </p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Metro</th>
                <th>State</th>
                <th>Net on $60,000</th>
                <th>Net on $100,000</th>
                <th>Net on $150,000</th>
                <th>Eff. rate @ $100k</th>
              </tr>
            </thead>
            <tbody>
              {metros.map((m) => (
                <tr key={`${m.metro}-${m.state}`}>
                  <td>{m.metro}</td>
                  <td>{m.state}</td>
                  <td>{money(m.net_60000)}</td>
                  <td>{money(m.net_100000)}</td>
                  <td>{money(m.net_150000)}</td>
                  <td>{pct(m.eff_rate_100000)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="seo">
          <h2>Method</h2>
          <p>
            Each metro was run through a single-filer model at three reference salaries ($60,000,
            $100,000, $150,000):
          </p>
          <ul>
            <li>
              <strong>Federal income tax</strong> — 2026 single-filer brackets, with the standard
              deduction applied before the brackets.
            </li>
            <li>
              <strong>FICA</strong> — 6.2% Social Security up to the wage base, plus 1.45% Medicare with
              no cap. These apply identically in every state.
            </li>
            <li>
              <strong>State income tax</strong> — the state&rsquo;s own rate schedule. States with a flat
              rate use that rate; states with progressive brackets are interpolated between their lowest
              and highest marginal rates across the taxable amount.
            </li>
          </ul>
          <p>
            The engine is the same one behind our{" "}
            <Link href="/salary-after-tax-calculator">salary after tax calculator</Link> and{" "}
            <Link href="/take-home-pay-calculator">take-home pay calculator</Link>, so any figure here can
            be reproduced by running one salary through either tool and picking the state.
          </p>
        </div>

        <div className="seo">
          <h2>What this table does not include</h2>
          <p>
            Read these as comparisons, not as a filing figure. The model deliberately excludes:
          </p>
          <ul>
            <li>
              <strong>Local and city income taxes</strong> — so New York City, Philadelphia and Columbus
              are in practice lower than shown here.
            </li>
            <li>
              <strong>State deductions, exemptions and credits</strong> — a state&rsquo;s effective rate
              on real returns is often lower than its schedule suggests once these apply.
            </li>
            <li>
              <strong>Anything beyond income tax</strong> — property tax, sales tax and cost of living do
              not appear at all. A higher take-home does not mean a higher standard of living.
            </li>
            <li>
              <strong>Metro-level rates</strong> — the model uses the state rate, which is why metros in
              one state share a figure. It does not attempt to price cost-of-living differences between
              Los Angeles and Sacramento.
            </li>
          </ul>
          <p>
            For a personal number, run your own salary and state through the{" "}
            <Link href="/take-home-pay-calculator">take-home pay calculator</Link> — it takes the same
            inputs and shows the per-paycheck split.
          </p>
        </div>

        {tool && <ToolClient tool={tool} showFaq={false} />}

        <GuideFaq slug="take-home-pay-by-metro-2026" />

        <div className="seo">
          <h2>Use this data</h2>
          <p>
            Free to cite and republish with attribution: &ldquo;Source: US Money HQ
            (usmoneyhq.com)&rdquo;. A machine-readable copy of the full table is served at{" "}
            <a href="/data/take-home-pay.json">/data/take-home-pay.json</a>.
          </p>
          <h2>Related tools</h2>
          <ul>
            <li>
              <Link href="/take-home-pay-calculator">Take-Home Pay Calculator</Link> — your salary, your
              state, per paycheck
            </li>
            <li>
              <Link href="/salary-after-tax-calculator">Salary After Tax Calculator</Link> — the full
              deduction breakdown
            </li>
            <li>
              <Link href="/paycheck-calculator">Paycheck Calculator</Link> — what lands each pay period
            </li>
            <li>
              <Link href="/states">All 50 states</Link> — browse the state tables used here
            </li>
            <li>
              <Link href="/guides/salary-after-tax-guide">How Much of Your Salary You Actually Keep</Link>{" "}
              — why the state matters most
            </li>
            <li>
              <Link href="/methodology">Our methodology</Link> — how the calculators and this dataset are
              built
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}
