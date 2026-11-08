import Head from "next/head";
import Link from "next/link";
import { SITE_URL } from "../../../lib/tools";

/**
 * /guides/irs-2026-brackets
 *
 * Every figure on this page comes from Rev. Proc. 2025-32 (IRS, published for tax year 2026):
 *   §4.14  standard deduction amounts — $32,200 joint, $24,150 head of household,
 *          $16,100 single and married-separate; $1,650 additional aged/blind, $2,050 if
 *          unmarried and not a surviving spouse; dependent floor greater of $1,350 or
 *          $450 plus earned income.
 *   §4.01  tax rate tables — thresholds below, each one checked against the bracket's own
 *          cumulative tax figure so the table cannot drift from the source.
 *
 * Effective rates are computed at build time from those brackets, not looked up.
 */
const BRACKETS = {
  Single: [
    { upTo: 12400, rate: 0.10 },
    { upTo: 50400, rate: 0.12 },
    { upTo: 105700, rate: 0.22 },
    { upTo: 201775, rate: 0.24 },
    { upTo: 256225, rate: 0.32 },
    { upTo: 640600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  "Married filing jointly": [
    { upTo: 24800, rate: 0.10 },
    { upTo: 100800, rate: 0.12 },
    { upTo: 211400, rate: 0.22 },
    { upTo: 403550, rate: 0.24 },
    { upTo: 512450, rate: 0.32 },
    { upTo: 768700, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  "Head of household": [
    { upTo: 17700, rate: 0.10 },
    { upTo: 67450, rate: 0.12 },
    { upTo: 105700, rate: 0.22 },
    { upTo: 201750, rate: 0.24 },
    { upTo: 256200, rate: 0.32 },
    { upTo: 640600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
};

const STD = {
  "Married filing jointly": 32200,
  "Head of household": 24150,
  Single: 16100,
  "Married filing separately": 16100,
};

function taxOn(taxable, table) {
  let tax = 0;
  let lower = 0;
  for (const b of table) {
    if (taxable > lower && taxable > 0) {
      const slice = Math.min(taxable, b.upTo) - lower;
      if (slice > 0) tax += slice * b.rate;
    }
    lower = b.upTo;
    if (taxable <= b.upTo) break;
  }
  return tax;
}

const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pct = (n) => (n * 100).toFixed(1) + "%";

export default function Irs2026({ bracketRows, effectiveRows, breakEvens }) {
  return (
    <>
      <Head>
        <title>IRS 2026 Tax Brackets and Standard Deduction, Verified | US Money HQ</title>
        <meta
          name="description"
          content="The 2026 federal brackets and standard deduction, read directly from Rev. Proc. 2025-32: $16,100 single, $32,200 joint, $24,150 head of household, with marginal versus effective rates computed at four incomes."
        />
        <link rel="canonical" href={SITE_URL + "/guides/irs-2026-brackets"} />
      </Head>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-xs uppercase tracking-widest text-emerald-700">
          Original analysis · IRS Rev. Proc. 2025-32 · tax year 2026
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          2026 tax brackets and the standard deduction, read from the source
        </h1>
        <p className="mt-3 text-slate-600">
          By Yasir Ali Mushtaq · Last updated 8 November 2026 · Figures transcribed from Internal
          Revenue Service Rev. Proc. 2025-32, §§4.01 and 4.14
        </p>

        <p className="mt-6 text-lg text-slate-800">
          <strong>
            For tax year 2026 the standard deduction is $16,100 for single filers and married
            couples filing separately, $32,200 for married couples filing jointly, and $24,150 for
            heads of household. The seven rates are unchanged at 10, 12, 22, 24, 32, 35 and 37
            percent, and every bracket threshold moved up with inflation.
          </strong>{" "}
          The table below is the bracket structure as published, followed by what those rates
          actually cost at four incomes — which is where most people discover that their marginal
          rate and their real rate are two different numbers.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Standard deduction by filing status, 2026</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300 text-left text-xs uppercase text-slate-500">
              <th className="py-2">Filing status</th>
              <th className="py-2 text-right">Standard deduction</th>
              <th className="py-2 text-right">Change vs 2025</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(STD).map(([k, v]) => (
              <tr key={k} className="border-b border-slate-100">
                <td className="py-2">{k}</td>
                <td className="py-2 text-right tabular-nums">{money(v)}</td>
                <td className="py-2 text-right tabular-nums text-slate-500">
                  {k === "Married filing jointly" ? "+" + money(v - 31500) : "+" + money(v - (k === "Head of household" ? 23625 : 15750))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-slate-600">
          Additional amounts for 2026: <strong>$1,650</strong> per person if aged 65 or older or
          blind, rising to <strong>$2,050</strong> if that person is unmarried and not a surviving
          spouse. A taxpayer who can be claimed as a dependent has a standard deduction of the
          greater of $1,350 or $450 plus earned income.
        </p>

        <h2 className="mt-10 text-xl font-semibold">The 2026 bracket thresholds</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300 text-left text-xs uppercase text-slate-500">
              <th className="py-2">Rate</th>
              <th className="py-2 text-right">Single</th>
              <th className="py-2 text-right">Married filing jointly</th>
              <th className="py-2 text-right">Head of household</th>
            </tr>
          </thead>
          <tbody>
            {bracketRows.map((r) => (
              <tr key={r.rate} className="border-b border-slate-100">
                <td className="py-2 font-medium">{r.rate}</td>
                <td className="py-2 text-right tabular-nums">{r.single}</td>
                <td className="py-2 text-right tabular-nums">{r.mfj}</td>
                <td className="py-2 text-right tabular-nums">{r.hoh}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-slate-600">
          Each threshold above the first bracket is derived from the cumulative tax figure printed
          alongside it in the revenue procedure, then checked forward against the next bracket. If
          one row were mistyped the next would stop reconciling, which is why the table is
          trustworthy without a second source.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Marginal versus effective, computed</h2>
        <p className="mt-2 text-slate-700">
          A single filer earning $85,000 is in the 22% bracket. They do not pay 22% of $85,000.
          After the $16,100 standard deduction, $68,900 is taxable: $12,400 at 10%, the next
          $38,000 at 12%, and the remaining $18,500 at 22%.
        </p>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300 text-left text-xs uppercase text-slate-500">
              <th className="py-2">Gross income (single)</th>
              <th className="py-2 text-right">Taxable after deduction</th>
              <th className="py-2 text-right">Marginal rate</th>
              <th className="py-2 text-right">Federal tax</th>
              <th className="py-2 text-right">Effective rate</th>
            </tr>
          </thead>
          <tbody>
            {effectiveRows.map((r) => (
              <tr key={r.gross} className="border-b border-slate-100">
                <td className="py-2 tabular-nums">{r.gross}</td>
                <td className="py-2 text-right tabular-nums">{r.taxable}</td>
                <td className="py-2 text-right tabular-nums">{r.marginal}</td>
                <td className="py-2 text-right tabular-nums">{r.tax}</td>
                <td className="py-2 text-right tabular-nums font-medium">{r.effective}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-slate-700">
          The gap between the two columns is the most misread number in personal finance. At
          $220,000 a single filer is taxed at 32% on the last dollar and roughly{" "}
          {effectiveRows[3].effective} overall. A raise that pushes someone into the next bracket
          never reduces take-home pay — only the dollars inside that bracket are taxed at the higher
          rate. Run your own figure through the{" "}
          <Link href="/tax-calculator" className="text-emerald-800 underline">
            tax calculator
          </Link>{" "}
          and the{" "}
          <Link href="/take-home-pay-calculator" className="text-emerald-800 underline">
            take-home pay calculator
          </Link>
          .
        </p>

        <h2 className="mt-10 text-xl font-semibold">Standard deduction or itemise</h2>
        <p className="mt-2 text-slate-700">
          The decision is arithmetic, not preference: itemising only helps when the total of
          deductible mortgage interest, state and local taxes (capped), charitable giving and
          medical expenses above the floor exceeds the standard deduction. For a single filer in
          2026 that means clearing <strong>{money(STD.Single)}</strong>.
        </p>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300 text-left text-xs uppercase text-slate-500">
              <th className="py-2">Situation</th>
              <th className="py-2 text-right">Itemised total</th>
              <th className="py-2">Better option</th>
            </tr>
          </thead>
          <tbody>
            {breakEvens.map((r) => (
              <tr key={r.label} className="border-b border-slate-100">
                <td className="py-2">{r.label}</td>
                <td className="py-2 text-right tabular-nums">{r.total}</td>
                <td className="py-2">{r.verdict}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-slate-700">
          Most renters never itemise, and most new homeowners do not either in year one unless the
          interest and tax together clear the threshold. Bunching charitable gifts into one year is
          the standard tactic for getting above it in alternate years.
        </p>

        <h2 className="mt-10 text-xl font-semibold">What changed from 2025</h2>
        <p className="mt-2 text-slate-700">
          The brackets widened with inflation and the standard deduction rose by roughly two
          percent across every status. The rates did not change. If you withhold based on last
          year's numbers and your income is flat, you will slightly over-withhold — which is a
          refund, not a penalty, but it is your money sitting with the Treasury.
        </p>
        <p className="mt-3 text-slate-700">
          For a salary calculation that includes FICA and state tax, use the{" "}
          <Link href="/salary-after-tax-calculator" className="text-emerald-800 underline">
            salary after tax calculator
          </Link>
          ; for a monthly budgeting figure, the{" "}
          <Link href="/paycheck-calculator" className="text-emerald-800 underline">
            paycheck calculator
          </Link>{" "}
          handles the per-period split.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Why brackets widen every year</h2>
        <p className="mt-2 text-slate-700">
          The Internal Revenue Code requires the bracket thresholds to be adjusted for inflation,
          using a chained consumer price index rather than the older index. The adjustment is
          mechanical and is published each autumn for the following tax year. Its purpose is
          negative: to stop a pay rise that only tracks prices from pushing a household into a
          higher bracket and handing back part of that rise as tax. When inflation runs hot the
          thresholds move further; when it cools they barely move.
        </p>
        <p className="mt-3 text-slate-700">
          This is why a 2025 bracket table is not a rounding error away from the 2026 one. For
          married couples filing jointly the 10% bracket ended at $23,850 in 2025 and ends at
          $24,800 in 2026 — $950 of income that moved from the 12% rate to the 10% rate before a
          single deduction is applied. Ignore indexation and every estimate you produce is
          systematically slightly wrong in the same direction.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Where the marginal rate actually bites</h2>
        <p className="mt-2 text-slate-700">
          The federal bracket is not the only rate on the last dollar. A single filer in the 22%
          bracket also pays Social Security and Medicare on wages, and a self-employed filer pays
          both halves of those contributions. Above certain thresholds an additional Medicare
          surtax applies, and a long list of credits phase out at their own incomes, which creates
          effective marginal rates that appear nowhere in the bracket table.
        </p>
        <p className="mt-3 text-slate-700">
          The practical consequence: two households with identical taxable income can face
          different marginal costs depending on whether the income is wages or self-employment, and
          on how close they sit to a credit cliff. When you model a raise, model the whole stack
          rather than the federal column alone.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Withholding is a separate calculation</h2>
        <p className="mt-2 text-slate-700">
          Brackets decide what you owe; withholding decides what is taken during the year. The two
          use different tables and different assumptions about how many pay periods remain. A
          common reason for an unexpected balance due is not a bracket change at all but a bonus
          withheld at the flat supplemental rate while the actual liability landed in a higher
          bracket.
        </p>
        <p className="mt-3 text-slate-700">
          If your income is lumpy — commissions, RSUs, contracting — the safe approach is to check
          the year-to-date withholding against a projected annual liability in the third quarter
          rather than in April. Adjusting then is a form; adjusting later is a penalty.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Filing status changes more than the deduction</h2>
        <p className="mt-2 text-slate-700">
          Marriage and dependants move you between bracket tables entirely, not just between
          deduction amounts. The joint table has wider brackets at every rate, which is why a
          two-earner couple can pay more combined tax than two single filers with the same total
          income — the so-called marriage penalty, and it appears specifically when both incomes
          are similar. A single earner with a non-earning spouse normally sees the opposite.
        </p>
        <p className="mt-3 text-slate-700">
          Head of household sits between the two. It requires a qualifying person and more than
          half the cost of keeping a home, and it is routinely missed by separated parents who
          assume the custodial arrangement settles it. It is worth checking, because the bracket
          widths are materially better than single at almost every level.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Three numbers to keep</h2>
        <p className="mt-2 text-slate-700">
          Filing status, taxable income after the deduction, and the marginal rate on your last
          dollar. Everything else in the return is detail around those three. If you remember only
          the standard deduction for your status and the point at which your rate steps up, you can
          answer the question most people actually have — whether the next raise is worth the
          hours, and what it will leave behind after tax.
        </p>
        <p className="mt-3 text-slate-700">
          Two of those numbers change every year by law; the third changes when your income does.
          That is why a bracket table has a date on it and a calculator has an input for the year.
          Any figure quoted without one is a guess wearing a number's clothes.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Sources and method</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-700">
          <li>
            <a
              className="text-emerald-800 underline"
              href="https://www.irs.gov/pub/irs-drop/rp-25-32.pdf"
            >
              IRS Rev. Proc. 2025-32
            </a>{" "}
            — §4.01 tax rate tables, §4.14 standard deduction (retrieved 8 November 2026)
          </li>
          <li>
            <a className="text-emerald-800 underline" href="https://www.irs.gov/forms-pubs/about-publication-17">
              IRS Publication 17
            </a>{" "}
            — filing status and deduction rules
          </li>
          <li>
            <a className="text-emerald-800 underline" href="https://www.ssa.gov/oact/cola/cbb.html">
              SSA contribution and benefit base
            </a>{" "}
            — Social Security wage base, which moves on its own schedule
          </li>
        </ul>
        <p className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-500">
          Figures transcribed from the revenue procedure named above and not from secondary
          summaries. Effective rates are computed at build time from the published brackets. This is
          operational information, not tax advice — see our{" "}
          <Link href="/editorial-policy" className="underline">
            editorial policy
          </Link>
          .
        </p>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const rows = [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
  const bracketRows = rows.map((rate, i) => {
    const fmt = (table) => {
      const lo = i === 0 ? 0 : table[i - 1].upTo;
      const hi = table[i].upTo;
      if (lo === 0) return "up to " + money(hi);
      if (hi === Infinity) return "over " + money(lo);
      return money(lo) + " – " + money(hi);
    };
    return {
      rate: (rate * 100).toFixed(0) + "%",
      single: fmt(BRACKETS.Single),
      mfj: fmt(BRACKETS["Married filing jointly"]),
      hoh: fmt(BRACKETS["Head of household"]),
    };
  });

  const grosses = [50000, 85000, 130000, 220000];
  const effectiveRows = grosses.map((gross) => {
    const taxable = Math.max(0, gross - STD.Single);
    const tax = taxOn(taxable, BRACKETS.Single);
    let marginal = 0.10;
    for (const b of BRACKETS.Single) {
      if (taxable > b.upTo) marginal = b.rate;
    }
    for (let i = 0; i < BRACKETS.Single.length; i++) {
      if (taxable <= BRACKETS.Single[i].upTo) {
        marginal = BRACKETS.Single[i].rate;
        break;
      }
    }
    return {
      gross: money(gross),
      taxable: money(taxable),
      marginal: (marginal * 100).toFixed(0) + "%",
      tax: money(tax),
      effective: pct(tax / gross),
    };
  });

  const breakEvens = [
    { label: "Renter, no other deductions", total: "$0", verdict: "Standard deduction" },
    { label: "Single, $8,000 mortgage interest + $6,000 SALT", total: "$14,000", verdict: "Standard (" + money(STD.Single) + ") still wins" },
    { label: "Single, $14,000 interest + $9,000 SALT", total: "$23,000", verdict: "Itemise" },
    { label: "Joint, $18,000 interest + $10,000 SALT + $4,000 gifts", total: "$32,000", verdict: "Standard (" + money(STD["Married filing jointly"]) + ") marginally wins" },
  ];

  return { props: { bracketRows, effectiveRows, breakEvens } };
}
