import Head from "next/head";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { SITE_URL } from "../../lib/tools";

/**
 * /guides/home-price-to-income-by-metro-2026 — a citable data page.
 *
 * WHY THIS PAGE EXISTS
 * --------------------
 * It is the linkable asset. A journalist or a local newsroom cannot cite
 * data/metro-affordability.json, and an outreach pitch that says "see our data" with
 * nothing readable to link to is an unlinkable claim. This page is the citable
 * target: the full table, the method, the limitation, and an attribution string.
 *
 * EVERY NUMBER IS READ FROM THE FILE AT BUILD TIME. Nothing is retyped, so the page
 * cannot drift from the data it publishes. If the file is missing or empty the page
 * 404s rather than rendering an empty report.
 *
 * THE LIMITATION IS STATED ON THE PAGE, NOT HIDDEN. Median home value and median
 * household income describe different households. The ratio is an area-level
 * indicator. Presenting it as "what a family can afford" would be the exact
 * overreach that a finance site gets punished for.
 */
const DATA = path.join(process.cwd(), "data", "metro-affordability.json");

export async function getStaticProps() {
  if (!fs.existsSync(DATA)) return { notFound: true };
  const raw = JSON.parse(fs.readFileSync(DATA, "utf8"));
  const metros = (raw.metros || []).slice().sort((a, b) => b.price_to_income - a.price_to_income);
  if (!metros.length) return { notFound: true };

  const above5 = metros.filter((m) => m.price_to_income >= 5).length;
  return {
    props: {
      metros,
      above5,
      total: metros.length,
      top: metros[0],
      bottom: metros[metros.length - 1],
      meta: raw._meta || {},
    },
    revalidate: 86400,
  };
}

const money = (n) => "$" + n.toLocaleString("en-US");

export default function HomePriceToIncome({ metros, above5, total, top, bottom }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "US metro home price to income ratio, 2023 ACS 5-year",
    description:
      "Median value of owner-occupied housing units divided by median household income, for the largest US metros. Computed from the same ACS release for both figures.",
    url: `${SITE_URL}/guides/home-price-to-income-by-metro-2026`,
    creator: { "@type": "Organization", name: "US Money HQ", url: SITE_URL },
    isAccessibleForFree: true,
    temporalCoverage: "2019/2023",
    spatialCoverage: "United States",
    variableMeasured: [
      "Median household income (ACS B19013)",
      "Median home value (ACS B25077)",
      "Price-to-income ratio (derived)",
    ],
    citation:
      "US Census Bureau, American Community Survey 2023 5-year estimates, tables B19013 and B25077",
  };

  return (
    <>
      <Head>
        <title>Home Price to Income Ratio by Metro (2026) | US Money HQ</title>
        <meta
          name="description"
          content={`Median home value divided by median household income across ${total} US metros. ${above5} metros exceed five times local income. Sourced from Census ACS 2023.`}
        />
        <link rel="canonical" href={`${SITE_URL}/guides/home-price-to-income-by-metro-2026`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs">
          <Link href="/">Home</Link> <span aria-hidden="true">›</span>{" "}
          <Link href="/guides">Guides</Link> <span aria-hidden="true">›</span>{" "}
          <span>Home price to income</span>
        </nav>

        <h1>Home Price to Income Ratio by Metro</h1>
        <p className="muted">
          Census ACS 2023 5-year · {total} metros · updated 29 October 2026
        </p>

        <p>
          In <strong>{top.metro}, {top.state}</strong> the median home value is{" "}
          <strong>{top.price_to_income.toFixed(2)} times</strong> median household income
          ({money(top.median_home_value)} against {money(top.median_household_income)}).
          At the other end, <strong>{bottom.metro}, {bottom.state}</strong> sits at{" "}
          <strong>{bottom.price_to_income.toFixed(2)} times</strong>. Across the {total}{" "}
          metros measured, <strong>{above5}</strong> exceed five times local income.
        </p>

        <h2>The full table</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Metro</th>
                <th>State</th>
                <th style={{ textAlign: "right" }}>Median home value</th>
                <th style={{ textAlign: "right" }}>Median household income</th>
                <th style={{ textAlign: "right" }}>Price / income</th>
              </tr>
            </thead>
            <tbody>
              {metros.map((m) => (
                <tr key={`${m.metro}-${m.state}`}>
                  <td>{m.metro}</td>
                  <td>{m.state}</td>
                  <td style={{ textAlign: "right" }}>{money(m.median_home_value)}</td>
                  <td style={{ textAlign: "right" }}>{money(m.median_household_income)}</td>
                  <td style={{ textAlign: "right" }}>
                    <strong>{m.price_to_income.toFixed(2)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Method</h2>
        <p>
          Both figures come from the same release and the same geography: median value of
          owner-occupied housing units (ACS table B25077) divided by median household income
          (ACS table B19013), at place level, for the principal city of each metro. Nothing
          is mixed across vintages and no vendor estimates are used. Source files are the
          Census table-based summary files for the 2023 5-year estimates.
        </p>

        <h2>What this ratio is not</h2>
        <p>
          Median home value and median household income describe <em>different</em>{" "}
          households. The ratio is an area-level affordability indicator — it says how far
          the typical home price sits above the typical local income, not what any
          particular family can afford. A buyer putting 20% down and carrying a 30-year
          loan faces a very different monthly figure. Use the{" "}
          <Link href="/home-affordability-calculator">home affordability calculator</Link>{" "}
          for a specific household, and the{" "}
          <Link href="/mortgage-calculator">mortgage calculator</Link> for a payment on a
          given price.
        </p>

        <h2>Attribution</h2>
        <p>
          Cite as: “US Money HQ, <em>Home Price to Income Ratio by Metro</em> (2026),
          derived from US Census Bureau ACS 2023 5-year estimates, tables B19013 and
          B25077.” Data file:{" "}
          <a href="/data/metro-affordability.json">metro-affordability.json</a>.
        </p>
      </main>
    </>
  );
}
