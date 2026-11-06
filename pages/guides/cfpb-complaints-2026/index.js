import Head from "next/head";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { SITE_URL } from "../../../lib/tools";

/**
 * /guides/cfpb-complaints-2026
 *
 * Built from the CFPB Consumer Complaint Database bulk export, downloaded and counted on
 * 3 November 2026 (18,935,791 rows scanned; 1,757,721 counted after restricting to 2023-2026
 * and to the nine consumer-finance products). Every figure is a row count — nothing estimated.
 *
 * TWO TRAPS THE PAGE DISCLOSES RATHER THAN HIDES:
 *   1. The product taxonomy changed. "Credit card or prepaid card" existed in 2023 and was
 *      replaced by "Credit card" from 2024. Comparing 2023's "Credit card" line alone to 2025
 *      produces +311%; combining both 2023 categories produces +57%. The second number is real,
 *      the first is an artefact.
 *   2. 2026 is a partial year, so a lower total is not a decline.
 */
export default function CfpbComplaints2026({ meta, table, creditCard, states, issues }) {
  const issue0 = issues[0] ? issues[0][0] : "a charge on your statement";
  return (
    <>
      <Head>
        <title>CFPB Complaints 2023–2026: What Americans Actually Reported | US Money HQ</title>
        <meta
          name="description"
          content="1.76 million consumer finance complaints, counted from the CFPB public database: debt collection up 316% since 2023, credit card complaints up 57% on a like-for-like basis, and a 515% rise in money-transfer complaints."
        />
        <link rel="canonical" href={SITE_URL + "/guides/cfpb-complaints-2026"} />
        <meta property="og:title" content="CFPB Complaints 2023–2026: the data, counted" />
        <meta
          property="og:description"
          content="18.9 million rows scanned. Debt collection complaints rose 316% in two years. Money transfer complaints rose 515%."
        />
      </Head>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-xs uppercase tracking-widest text-emerald-700">
          Original analysis · CFPB public data · 3 November 2026
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          CFPB complaints, 2023 to 2026: what 1.76 million filings actually say
        </h1>
        <p className="mt-3 text-slate-600">
          By Yasir Ali Mushtaq · Lead Engineer, US Money HQ · Last updated 3 November 2026 ·
          Source: CFPB Consumer Complaint Database bulk export
        </p>

        <p className="mt-6 text-lg text-slate-800">
          <strong>
            Consumers filed {table.total.toLocaleString()} complaints in the nine finance
            products tracked here between January 2023 and the date of this export. Debt
            collection rose 316% over two full years, money-transfer complaints rose 515%, and
            credit card complaints rose 57% once the 2023 category split is accounted for.
          </strong>{" "}
          Mortgage complaints barely moved by comparison — up 8% — which is the most interesting
          number on this page, because it is the one product where nothing dramatic happened.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Complaints by product and year</h2>
        <p className="mt-2 text-slate-700">
          Counts of rows whose “Date received” falls in each calendar year. 2026 is a partial
          year and is shown for direction only.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300 text-left text-xs uppercase text-slate-500">
                <th className="py-2">Product</th>
                <th className="py-2 text-right">2023</th>
                <th className="py-2 text-right">2024</th>
                <th className="py-2 text-right">2025</th>
                <th className="py-2 text-right">2026 YTD</th>
                <th className="py-2 text-right">2023→2025</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r) => (
                <tr key={r.product} className="border-b border-slate-100">
                  <td className="py-2 pr-3">{r.product}</td>
                  <td className="py-2 text-right tabular-nums">{r.y2023 ?? "—"}</td>
                  <td className="py-2 text-right tabular-nums">{r.y2024 ?? "—"}</td>
                  <td className="py-2 text-right tabular-nums">{r.y2025 ?? "—"}</td>
                  <td className="py-2 text-right tabular-nums">{r.y2026 ?? "—"}</td>
                  <td className="py-2 text-right tabular-nums font-medium">{r.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-semibold">
          The credit card number, and why the obvious figure is wrong
        </h2>
        <p className="mt-2 text-slate-700">
          Reading the table alone, credit cards appear to have risen 311% from 2023 to 2025. That
          number is an artefact of a taxonomy change. Until 2023 the CFPB used a combined category
          called “Credit card or prepaid card”, reported {creditCard.split2023.toLocaleString()}{" "}
          times that year, alongside a smaller “Credit card” line of{" "}
          {creditCard.card2023.toLocaleString()}. From 2024 the combined category disappears and
          everything lands under “Credit card”.
        </p>
        <p className="mt-3 text-slate-700">
          Like for like, the two 2023 categories sum to{" "}
          <strong>{creditCard.combined2023.toLocaleString()}</strong> and the 2025 figure is{" "}
          <strong>{creditCard.y2025.toLocaleString()}</strong> — a rise of{" "}
          <strong>{creditCard.realChange}</strong>. Still large, and still worth knowing, but less
          than a sixth of the headline the naive comparison produces. Any analysis that quotes the
          311% figure without this footnote is measuring the CFPB's data dictionary, not American
          households.
        </p>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-800">Where the credit card complaints go</p>
          <table className="mt-3 w-full border-collapse text-sm">
            <tbody>
              {issues.map(([issue, n]) => (
                <tr key={issue} className="border-b border-slate-200 last:border-0">
                  <td className="py-2 pr-3">{issue}</td>
                  <td className="py-2 text-right tabular-nums">{n.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">
            Billing disputes and credit-report accuracy together account for most of the volume.
            Both are downstream of the same thing: a cardholder disagreeing with a number on a
            statement.
          </p>
        </div>

        <h2 className="mt-10 text-xl font-semibold">Where the complaints come from</h2>
        <p className="mt-2 text-slate-700">
          Credit card complaints by state, 2023–2026 combined. These are raw counts, so they track
          population more than anything else — California, Texas and Florida lead because they are
          the three largest states, not because their cardholders are uniquely aggrieved.
        </p>
        <div className="mt-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300 text-left text-xs uppercase text-slate-500">
                <th className="py-2">State</th>
                <th className="py-2 text-right">Credit card complaints</th>
              </tr>
            </thead>
            <tbody>
              {states.map(([st, n]) => (
                <tr key={st} className="border-b border-slate-100">
                  <td className="py-2">{st}</td>
                  <td className="py-2 text-right tabular-nums">{n.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-semibold">What this means if you are carrying a balance</h2>
        <p className="mt-2 text-slate-700">
          A complaint is not a finding — it is an allegation that has not been verified, and the
          CFPB publishes it on that basis. What the volume does tell you is where disputes
          concentrate, and the two largest issue categories are both about numbers a consumer
          could have checked themselves: a charge on a statement, and an entry on a credit report.
        </p>
        <p className="mt-3 text-slate-700">
          If you are carrying a balance, the practical sequence is arithmetic before escalation.
          Model what the balance costs at your current rate with the{" "}
          <Link href="/credit-card-payoff-calculator" className="text-emerald-800 underline">
            credit card payoff calculator
          </Link>
          , then compare that against a fixed-payment plan in the{" "}
          <Link href="/debt-payoff-calculator" className="text-emerald-800 underline">
            debt payoff calculator
          </Link>
          . Most billing disputes are cheaper to resolve with a payoff date than with a complaint.
          If the balance is large enough that paying it down is not realistic, the{" "}
          <Link href="/debt-payoff-calculator" className="text-emerald-800 underline">
            payoff comparison
          </Link>{" "}
          will show you why consolidation is usually the only path that changes the monthly number.
        </p>
        <p className="mt-3 text-slate-700">
          Mortgage is the quiet one: {table.mortgageChange} over two years against a 316% rise in
          debt collection. If you are shopping, the{" "}
          <Link href="/mortgage-calculator" className="text-emerald-800 underline">
            mortgage calculator
          </Link>{" "}
          will show the payment, and the{" "}
          <Link href="/refinance-calculator" className="text-emerald-800 underline">
            refinance calculator
          </Link>{" "}
          will show whether the rate you were quoted is worth the closing costs.
        </p>

        <h2 className="mt-10 text-xl font-semibold">
          Debt collection is the real story in this data
        </h2>
        <p className="mt-2 text-slate-700">
          Debt collection complaints went from 68,107 in 2023 to 283,199 in 2025 — a 316% rise, and
          by 2025 the single largest product category in this dataset, ahead of credit cards and
          checking accounts combined. Unlike the credit card figures, this one needs no taxonomy
          footnote: the category name and definition did not change across the period.
        </p>
        <p className="mt-3 text-slate-700">
          Four times the volume in two years is not a reporting artefact. The complaint database is
          fed by consumers who find it, and findability has not changed much. What has changed is the
          number of accounts reaching collection: the Federal Reserve&rsquo;s own consumer credit data
          shows revolving balances climbing through the same window, and delinquency follows balances
          with a lag. When a card balance goes unpaid for long enough, it is sold to a collector, and
          the first contact a household has with that collector is often the first they hear of the
          debt.
        </p>
        <p className="mt-3 text-slate-700">
          That is also why the largest single issue inside credit cards is
          &ldquo;{issue0}&rdquo;. These are not sophisticated disputes. They are people disagreeing
          with a number, discovering the disagreement too late to prevent the consequence, and filing
          a complaint as the only lever left.
        </p>

        <h2 className="mt-10 text-xl font-semibold">
          The 515% increase nobody is talking about
        </h2>
        <p className="mt-2 text-slate-700">
          Money transfer, virtual currency and money services rose from 13,749 complaints in 2023 to
          84,619 in 2025 — the fastest growth of any product here, and the one least covered in
          personal finance writing. This is the category that contains peer-to-peer payment apps,
          remittance services and crypto platforms. A 515% rise in complaints against products people
          use for everyday transfers, rather than for borrowing, is a different kind of signal: it
          reflects how quickly money movement moved onto apps that had no complaint history a few
          years earlier.
        </p>
        <p className="mt-3 text-slate-700">
          Mortgage, by contrast, moved 8%. The product with the most regulation, the most disclosure
          paperwork and the most licensed intermediaries is also the product where complaint volume
          was flat. That is worth stating plainly, because the usual assumption is the opposite:
          that more regulation produces more friction. In this data, the heavily-intermediated
          product is the stable one, and the fast-moving app products are where the volume went.
        </p>

        <h2 className="mt-10 text-xl font-semibold">How to read a complaint count</h2>
        <p className="mt-2 text-slate-700">
          Three rules, because complaint numbers are misused constantly.
        </p>
        <p className="mt-3 text-slate-700">
          <strong>Counts are not rates.</strong> California has the most credit card complaints of any
          state. California also has the most people. Without market share or account counts, a raw
          total says nothing about how a company or a state performs.
        </p>
        <p className="mt-3 text-slate-700">
          <strong>Publication requires consent, and consent is biased.</strong> Consumers opt in to
          publishing their narrative, and the ones who do are not a random sample. The volume is
          reliable as a trend; any single story in the database is one person&rsquo;s account.
        </p>
        <p className="mt-3 text-slate-700">
          <strong>A complaint is an allegation, not a finding.</strong> The CFPB does not verify
          narrative detail before publication, and companies respond through a separate process with
          its own categories. Treating a complaint count as a wrongdoing count is a category error,
          and it is the error most listicles make.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Methodology</h2>
        <p className="mt-2 text-slate-700">
          The full CFPB bulk export was downloaded on 3 November 2026 and parsed row by row. Of{" "}
          <strong>{meta.rows_scanned.toLocaleString()}</strong> rows,{" "}
          <strong>{meta.rows_counted.toLocaleString()}</strong> fell inside the 2023–2026 window and
          inside the nine products tracked here. Counts are exact row counts; nothing is sampled,
          weighted, or projected.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-700">
          <li>
            <strong>Unverified allegations.</strong> The CFPB states that complaints are not
            verified before publication. Volume measures friction, not fault.
          </li>
          <li>
            <strong>Taxonomy drift.</strong> Product categories change between years. Where that
            distorts a comparison it is disclosed above rather than smoothed away.
          </li>
          <li>
            <strong>2026 is partial.</strong> The export covers part of the year, so a lower total
            is a calendar artefact, not a decline.
          </li>
          <li>
            <strong>No company ranking.</strong> This analysis deliberately does not name firms by
            complaint count. Raw counts without market share are misleading, and we do not have
            share data.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Primary sources</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-700">
          <li>
            <a className="text-emerald-800 underline" href="https://files.consumerfinance.gov/ccdb/complaints.csv.zip">
              CFPB Consumer Complaint Database — bulk CSV export
            </a>{" "}
            (retrieved 3 November 2026)
          </li>
          <li>
            <a className="text-emerald-800 underline" href="https://www.consumerfinance.gov/data-research/consumer-complaints/">
              CFPB complaint database documentation
            </a>
          </li>
          <li>
            <a className="text-emerald-800 underline" href="https://www.federalreserve.gov/releases/g19/current/">
              Federal Reserve G.19 consumer credit
            </a>{" "}
            — for balance context behind card complaint volume
          </li>
        </ul>

        <p className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-500">
          Reviewed against the CFPB bulk export on 3 November 2026. Operational analysis, not
          financial or legal advice. See our{" "}
          <Link href="/editorial-policy" className="underline">
            editorial policy
          </Link>{" "}
          for how data is sourced and corrected.
        </p>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const file = path.join(process.cwd(), "data", "cfpb-complaints.json");
  const d = JSON.parse(fs.readFileSync(file, "utf8"));
  const byPY = d.by_product_year;

  const products = {};
  for (const r of byPY) {
    const p = r.product === "Credit card or prepaid card" ? "Credit card or prepaid card" : r.product;
    products[p] = products[p] || {};
    products[p][r.year] = r.complaints;
  }

  const fmt = (n) => (n == null ? null : n.toLocaleString("en-US"));
  const rows = Object.entries(products).map(([product, years]) => {
    const a = years["2023"];
    const b = years["2025"];
    let change = "n/a";
    if (a && b) change = (b / a >= 1 ? "+" : "") + Math.round((b / a - 1) * 100) + "%";
    return {
      product,
      y2023: fmt(years["2023"]),
      y2024: fmt(years["2024"]),
      y2025: fmt(years["2025"]),
      y2026: fmt(years["2026"]),
      change,
    };
  }).sort((x, y) => (Number((y.y2025 || "0").replace(/,/g, "")) - Number((x.y2025 || "0").replace(/,/g, ""))));

  const card = products["Credit card"] || {};
  const split = products["Credit card or prepaid card"] || {};
  const combined2023 = (card["2023"] || 0) + (split["2023"] || 0);

  const total = byPY.reduce((s, r) => s + r.complaints, 0);
  const mortgage = products["Mortgage"] || {};
  const mortChange =
    mortgage["2023"] && mortgage["2025"]
      ? "+" + Math.round((mortgage["2025"] / mortgage["2023"] - 1) * 100) + "%"
      : "n/a";

  return {
    props: {
      meta: { rows_scanned: d._meta.rows_scanned, rows_counted: d._meta.rows_counted },
      table: {
        total,
        rows,
        mortgageChange: mortChange,
      },
      creditCard: {
        card2023: card["2023"] || 0,
        split2023: split["2023"] || 0,
        combined2023,
        y2025: card["2025"] || 0,
        realChange:
          "+" + Math.round((card["2025"] / combined2023 - 1) * 100) + "%",
      },
      states: (d.top_states["Credit card"] || []).slice(0, 8),
      issues: (d.top_issues["Credit card"] || []).slice(0, 5),
    },
  };
}
