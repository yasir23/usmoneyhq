import Head from "next/head";
import Link from "next/link";
import AdSlot from "./AdSlot";
import AffiliateBlock from "./AffiliateBlock";
import NewsletterSignup from "./NewsletterSignup";
import ToolClient from "./ToolClient";
import { getTool, SITE_URL, SITE_NAME, TOOLS } from "../lib/tools";
import { getState, getComparisonPair, STATES, STATE_AWARE_TOOLS, type StateData } from "../lib/states";
import { AMOUNT_TOOLS, allowedAmounts, allowedAges, AGE_TOOLS, ageFromSlug, fmtAmount, amountFromSlug } from "../lib/amounts";
import { getMetro, type Metro } from "../lib/metros";
import { federalTax, fica, stateTax, monthlyPayment } from "../lib/calc";

/**
 * ToolPageShell — shared page shell for every calculator (pages router).
 * Centralizes SEO (title/meta/canonical/OG/JSON-LD), breadcrumbs, ad slots,
 * the tool UI, FAQ, and related links. New tools = new registry entry only.
 * Optional stateSlug renders a state-variant page; "stateA-vs-stateB" renders
 * a side-by-side comparison; amountSlug renders a salary-amount scenario page
 * (programmatic SEO — real computed numbers per variant).
 */
/**
 * Per-tool title/description for amount and state×amount scenario pages.
 *
 * The kind-based fallback ("$100,000 Salary After Tax: Take-Home Pay…") is
 * shared by every salary-kind tool, so salary-after-tax, paycheck, salary-
 * percentile and salary-to-hourly all emitted the SAME title for the same
 * amount — 1,590 pages in duplicate-title groups — and the wording was wrong
 * for the percentile and hourly tools anyway. Each salary-kind tool now names
 * its own intent; anything without an entry falls back to the kind phrasing.
 */
const AMOUNT_TITLES: Record<string, (amt: string, stateName?: string) => string> = {
  "salary-after-tax-calculator": (amt, st) =>
    st ? `${amt} Salary in ${st}: Take-Home Pay (2026) | US Money HQ`
       : `${amt} Salary After Tax: Take-Home Pay in 2026 | US Money HQ`,
  "paycheck-calculator": (amt, st) =>
    st ? `${amt} Paycheck in ${st}: Take-Home Pay After Tax (2026) | US Money HQ`
       : `${amt} Paycheck: Take-Home Pay After Taxes (2026) | US Money HQ`,
  "salary-percentile-calculator": (amt) =>
    `${amt} Salary Percentile: Where You Rank in 2026 | US Money HQ`,
  "salary-to-hourly-calculator": (amt) =>
    `${amt} Salary as an Hourly Rate (2026) | US Money HQ`,
};

const AMOUNT_DESCS: Record<string, (amt: string, stateName?: string, stateNote?: string) => string> = {
  "salary-after-tax-calculator": (amt, st, note) =>
    st ? `${amt} salary in ${st} after federal and state taxes in 2026. ${note}.`
       : `Your take-home pay on a ${amt} salary in 2026: federal tax, FICA, and what lands in your bank account each month.`,
  "paycheck-calculator": (amt, st, note) =>
    st ? `Per-paycheck take-home on a ${amt} salary in ${st} for 2026, after federal withholding, FICA, and state tax. ${note}.`
       : `What a ${amt} salary actually pays per paycheck in 2026, after federal withholding, FICA, and state tax.`,
  "salary-percentile-calculator": (amt) =>
    `See which income percentile a ${amt} salary falls in for 2026 and what share of US earners it out-earns.`,
  "salary-to-hourly-calculator": (amt) =>
    `Convert a ${amt} annual salary to an hourly rate in 2026 — based on the hours and weeks you actually work.`,
};

export default function ToolPageShell({ slug, stateSlug, amountSlug, metroSlug, ageSlug, country }: { slug: string; stateSlug?: string; amountSlug?: string; metroSlug?: string; ageSlug?: string; country?: string }) {
  const isUS = (country || "").toUpperCase() === "US";
  const tool = getTool(slug);
  const pair: [StateData, StateData] | null = stateSlug && stateSlug.includes("-vs-") ? getComparisonPair(stateSlug) : null;
  const state: StateData | undefined = stateSlug && !pair ? getState(stateSlug) : undefined;
  const metro: Metro | undefined = metroSlug ? getMetro(metroSlug) : undefined;
  const amount: number | undefined = amountSlug ? amountFromSlug(amountSlug) : undefined;
  const amtTool = AMOUNT_TOOLS[slug];
  const validAmount = amount !== undefined && !isNaN(amount) && amtTool && (allowedAmounts(slug) || []).includes(amount);
  const age: number | undefined = ageSlug ? ageFromSlug(ageSlug) : undefined;
  const ageTool = AGE_TOOLS[slug];
  const validAge = age !== undefined && !isNaN(age) && ageTool && (allowedAges(slug) || []).includes(age);

  // state variants only allowed for state-aware tools
  if (stateSlug && !STATE_AWARE_TOOLS.includes(slug)) {
    return <NotFoundShell />;
  }
  // amount variants only allowed for tools with an amount config + known amount
  if (amountSlug && !validAmount) {
    return <NotFoundShell />;
  }
  // age variants only allowed for age-config tools with a known age
  if (ageSlug && !validAge) {
    return <NotFoundShell />;
  }
  // metro variants only allowed for state-aware tools
  if (metroSlug && (!metro || !STATE_AWARE_TOOLS.includes(slug))) {
    return <NotFoundShell />;
  }

  if (!tool || (stateSlug && !pair && !state)) {
    return <NotFoundShell />;
  }

  const url = pair
    ? `${SITE_URL}/${tool.slug}/${pair[0].slug}-vs-${pair[1].slug}`
    : metro
    ? `${SITE_URL}/${tool.slug}/${metro.slug}`
    : age
    ? `${SITE_URL}/${tool.slug}/${ageSlug}`
    : state
    ? amount
      ? `${SITE_URL}/${tool.slug}/${amountSlug}/${state.slug}`
      : `${SITE_URL}/${tool.slug}/${state.slug}`
    : amount
    ? `${SITE_URL}/${tool.slug}/${amountSlug}`
    : `${SITE_URL}/${tool.slug}`;
  const amountKind = amtTool?.kind || "salary";
  // per-tool overrides for scenario pages (falls back to the kind phrasing below)
  const amtTitleOverride = amount ? AMOUNT_TITLES[tool.slug]?.(fmtAmount(amount), state?.name) : undefined;
  const amtDescOverride = amount
    ? AMOUNT_DESCS[tool.slug]?.(fmtAmount(amount), state?.name, state?.incomeTaxNote)
    : undefined;
  const pageTitle = pair
    ? `${pair[0].name} vs ${pair[1].name} ${tool.shortTitle.replace(" Calculator", "")} Calculator 2026 | US Money HQ`
    : metro
    ? `${metro.name}, ${state?.name || ""} ${tool.shortTitle.replace(" Calculator", "")} Calculator 2026 | US Money HQ`
    : age
    ? `${tool.shortTitle} at Age ${age}: Projected Retirement (2026) | US Money HQ`
    : state && amount
    ? amtTitleOverride || (amountKind === "price"
      ? `${fmtAmount(amount)} Home in ${state.name}: Payment & Total Interest (2026) | US Money HQ`
      : amountKind === "income"
      ? `How Much House on ${fmtAmount(amount)} in ${state.name}? (2026) | US Money HQ`
      : `${fmtAmount(amount)} Salary in ${state.name}: Take-Home Pay (2026) | US Money HQ`)
    : state
    ? `${state.name} ${tool.shortTitle.replace(" Calculator", "")} Calculator 2026 | US Money HQ`
    : amount
    ? amtTitleOverride || (amountKind === "price"
      ? `Mortgage Payment on a ${fmtAmount(amount)} Home (2026) | US Money HQ`
      : amountKind === "income"
      ? `How Much House Can You Afford on ${fmtAmount(amount)}? (2026) | US Money HQ`
      : `${fmtAmount(amount)} Salary After Tax: Take-Home Pay in 2026 | US Money HQ`)
    : tool.title;
  const pageDesc = pair
    ? `Compare ${pair[0].name} vs ${pair[1].name} ${tool.shortTitle.toLowerCase()} 2026: income tax, property tax, sales tax, and take-home math side by side.`
    : metro
    ? `${tool.description} Real numbers for ${metro.name}, ${state?.name || ""}.`
    : age
    ? `${tool.shortTitle} started at age ${age}: projected balance at ${ageTool?.retirementAge || 65} with contributions and employer match.`
    : state && amount
    ? amtDescOverride || (amountKind === "price"
      ? `Monthly payment and total interest on a ${fmtAmount(amount)} home in ${state.name} at today's rates. Property tax averages ${state.propTaxPct}% of value.`
      : amountKind === "income"
      ? `How much house a ${fmtAmount(amount)} income buys in ${state.name}: payment cap, down payment, and price range. ${state.incomeTaxNote}.`
      : `${fmtAmount(amount)} salary in ${state.name} after federal and state taxes in 2026. ${state.incomeTaxNote}.`)
    : state
    ? `${tool.description} ${state.incomeTaxNote}. Average property tax ${state.propTaxPct}%.`
    : amount
    ? amtDescOverride || (amountKind === "price"
      ? `Your monthly payment and total interest on a ${fmtAmount(amount)} home at today's rates.`
      : amountKind === "income"
      ? `How much house a ${fmtAmount(amount)} salary buys in 2026: payment cap, down payment, and price range.`
      : `Your take-home pay on a ${fmtAmount(amount)} salary in 2026: federal tax, FICA, and what lands in your bank account each month.`)
    : tool.description;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: pageTitle,
        url,
        description: pageDesc,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: tool.shortTitle, item: `${SITE_URL}/${tool.slug}` },
          ...(pair ? [{ "@type": "ListItem", position: 3, name: `${pair[0].name} vs ${pair[1].name}`, item: url }] : []),
          ...(state && !pair && !amount ? [{ "@type": "ListItem", position: 3, name: state.name, item: url }] : []),
          ...(amount && !state ? [{ "@type": "ListItem", position: 3, name: fmtAmount(amount), item: url }] : []),
          ...(state && amount ? [{ "@type": "ListItem", position: 3, name: fmtAmount(amount), item: `${SITE_URL}/${tool.slug}/${amountSlug}` }, { "@type": "ListItem", position: 4, name: state.name, item: url }] : []),
        ],
      },
    ],
  };

  const initialValues: Record<string, string | number> | undefined =
    state && amount ? { [amtTool?.field || "salary"]: amount, state: state.abbr }
    : amount ? { [amtTool?.field || "salary"]: amount }
    : age ? { [ageTool?.field || "years"]: Math.max(1, (ageTool?.retirementAge || 65) - age) }
    : state ? { state: state.abbr }
    : metro ? { state: getState(metro.stateSlug)?.abbr || "" }
    : pair ? { state: pair[0].abbr }
    : undefined;

  const amountLinks = amtTool ? (allowedAmounts(slug) || []) : [];
  const ageLinks = ageTool ? (allowedAges(slug) || []) : [];
  // State-aware siblings NOT already linked by the related-tools grid — keeps
  // every internal link on the page unique (this grid and RelatedTools both
  // point at /{tool}/{state} URLs for state-aware tools).
  const relatedMembers = relatedMembersFor(slug);
  const stateExtras = STATE_AWARE_TOOLS.filter((t) => t !== slug && !relatedMembers.includes(t));

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <main className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/${tool.slug}`}>{tool.shortTitle}</Link>
          {pair && (<><span aria-hidden="true">›</span><span>{pair[0].name} vs {pair[1].name}</span></>)}
          {metro && (<><span aria-hidden="true">›</span><span>{metro.name}</span></>)}
          {age && (<><span aria-hidden="true">›</span><span>Age {age}</span></>)}
          {amount && !state && (<><span aria-hidden="true">›</span><span>{fmtAmount(amount)}</span></>)}
          {state && !pair && !amount && !metro && (<><span aria-hidden="true">›</span><span>{state.name}</span></>)}
          {amount && state && (<><span aria-hidden="true">›</span><Link href={`/${tool.slug}/${amountSlug}`}>{fmtAmount(amount)}</Link><span aria-hidden="true">›</span><span>{state.name}</span></>)}
        </nav>

        <h1>{pair ? `${pair[0].name} vs ${pair[1].name}: ${tool.h1}` : metro ? `${metro.name}, ${state?.name || ""}: ${tool.h1}` : age ? `${tool.shortTitle} at ${age}: projected balance at ${ageTool?.retirementAge || 65}` : state && amount ? (amountKind === "price" ? `${fmtAmount(amount)} Home in ${state.name}: ${tool.h1}` : amountKind === "income" ? `How Much House on ${fmtAmount(amount)} in ${state.name}?` : `${fmtAmount(amount)} Salary in ${state.name}: ${tool.h1}`) : amount ? (amountKind === "income" ? `How Much House on ${fmtAmount(amount)}?` : amountKind === "price" ? `${fmtAmount(amount)} Home: ${tool.h1}` : `${fmtAmount(amount)} Salary: ${tool.h1}`) : state ? `${state.name} ${tool.h1}` : tool.h1}</h1>
        <p className="sub">{tool.sub}</p>

        <VariantTLDR slug={slug} state={state} amount={amount} amountKind={amountKind} age={age} ageTool={ageTool} />

        <AdSlot id={`${tool.slug}-${pair ? "compare" : state?.slug || "top"}`} />

        {pair && (
          <div className="compare-grid">
            {[pair[0], pair[1]].map((s) => (
              <div key={s.slug} className="state-facts card">
                <h2>{s.name} Facts</h2>
                <div className="row"><span>Income tax</span><b>{s.incomeTaxNote}</b></div>
                <div className="row"><span>Avg. property tax rate</span><b>{s.propTaxPct}% of home value</b></div>
                <div className="row"><span>Avg. combined sales tax</span><b>{s.salesTax}%</b></div>
                <p className="note">Averages — verify current rates with your county assessor.</p>
              </div>
            ))}
            <div className="compare-table card">
              <h2>{pair[0].name} vs {pair[1].name} — Quick Comparison</h2>
              <div className="row"><span>Income tax type</span><b>{pair[0].incomeTax} vs {pair[1].incomeTax}</b></div>
              <div className="row"><span>Property tax rate</span><b>{pair[0].propTaxPct}% vs {pair[1].propTaxPct}%</b></div>
              <div className="row"><span>Sales tax rate</span><b>{pair[0].salesTax}% vs {pair[1].salesTax}%</b></div>
            </div>
          </div>
        )}

        {state && !pair && (
          <div className="state-facts card">
            <h2>{state.name} Facts</h2>
            <div className="row"><span>Income tax</span><b>{state.incomeTaxNote}</b></div>
            <div className="row"><span>Avg. property tax rate</span><b>{state.propTaxPct}% of home value</b></div>
            <div className="row"><span>Avg. combined sales tax</span><b>{state.salesTax}%</b></div>
            <p className="note">Averages — verify current rates with your county assessor.</p>
          </div>
        )}

        {!pair && <ToolClient tool={tool} initialValues={initialValues} showFaq={false} showRelated={false} />}

        {amountLinks.length > 0 && !pair && (
          <div className="state-links card">
            <h2>Popular {amtTool?.kind === "price" ? "home prices" : amtTool?.kind === "income" ? "incomes" : "salaries"}</h2>
            <div className="link-cloud">
              {/* skip the amount already in the breadcrumb — no URL twice per page */}
              {amountLinks.filter((a) => a !== amount).map((a) => (
                <Link key={a} href={`/${tool.slug}/${a}`} className="state-link">{fmtAmount(a)}</Link>
              ))}
            </div>
          </div>
        )}

        {ageLinks.length > 0 && !pair && (
          <div className="state-links card">
            <h2>Starting ages</h2>
            <div className="link-cloud">
              {ageLinks.map((a) => (
                <Link key={a} href={`/${tool.slug}/${a}`} className="state-link">Age {a}</Link>
              ))}
            </div>
          </div>
        )}

        {pair && (
          <div className="compare-grid">
            {[pair[0], pair[1]].map((s) => (
              <div key={s.slug}>
                <h2 className="compare-subhead">{s.name}</h2>
                <ToolClient tool={tool} initialValues={{ state: s.abbr }} showFaq={false} showRelated={false} />
              </div>
            ))}
          </div>
        )}

        <AdSlot id={`${tool.slug}-${pair ? "compare-mid" : state?.slug || "mid"}`} />

        {!state && STATE_AWARE_TOOLS.includes(slug) && (
          <div className="seo">
            <h2>Calculator by State</h2>
            <div className="state-links">
              {STATES.map((s) => (
                <Link key={s.slug} href={`/${slug}/${s.slug}`}>{s.name}</Link>
              ))}
            </div>
          </div>
        )}

        {state && (
          <div className="seo">
            <h2>{state.name}-specific notes for this calculator</h2>
            <p>{state.name} has {state.incomeTaxNote.toLowerCase()} and an average effective property tax rate of {state.propTaxPct}% of home value (combined sales tax ~{state.salesTax}%). Use the numbers above as a starting point — local county rates and exemptions can change the real figures.</p>
            {stateExtras.length > 0 && (
              <>
                <h3>More {state.name} calculators</h3>
                <div className="tool-grid">
                  {stateExtras.map((t) => {
                    const tt = getTool(t);
                    if (!tt) return null;
                    return (
                      <Link key={t} href={`/${t}/${state.slug}`} className="tool-card">
                        <h3>{state.name} {tt.shortTitle}</h3>
                        <span className="cta">Open calculator →</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Visible FAQ — AEO: real Q&A blocks matching the FAQPage schema */}
        {tool.faq && tool.faq.length > 0 && (
          <div className="seo" style={{ marginTop: 24 }}>
            <h2>Frequently Asked Questions</h2>
            {tool.faq.map((f, idx) => (
              <div key={idx} style={{ marginBottom: 14 }}>
                <h3 style={{ marginBottom: 4 }}>{f.q}</h3>
                <p style={{ marginTop: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        )}

        <AdSlot id={`${tool.slug}-${pair ? "compare-bottom" : state?.slug || "bottom"}`} />

        <RelatedTools current={slug} stateSlug={state?.slug} />

        {isUS && <AffiliateBlock slug={slug} isUS />}

        {isUS && <NewsletterSignup isUS context="money tips and rate alerts" />}
      </main>
    </>
  );
}

function VariantTLDR({ slug, state, amount, amountKind, age, ageTool }: { slug: string; state?: StateData; amount?: number; amountKind?: string; age?: number; ageTool?: { field: string; retirementAge: number } }) {
  if (state && amount && slug === "salary-after-tax-calculator" && age === undefined) {
    const gross = amount;
    const fed = federalTax(gross).tax;
    const ficaAmt = fica(gross).total;
    const st = stateTax(gross, state.abbr).tax;
    const net = gross - fed - ficaAmt - st;
    return (
      <p className="tldr" style={{ fontWeight: 600 }}>
        Quick answer: a {fmtAmount(gross)} salary in {state.name} leaves roughly {fmtAmount(net)} take-home per year — about {fmtAmount(net / 12)}/month — after federal ({fmtAmount(fed)}), FICA ({fmtAmount(ficaAmt)}), and {state.name} state tax ({fmtAmount(st)}).
      </p>
    );
  }
  if (amount && amountKind === "price" && slug === "mortgage-calculator") {
    const pmt = monthlyPayment(amount * 0.8, 6.5, 360); // 20% down, ~6.5% 30yr assumption
    const totalInt = pmt * 360 - amount * 0.8;
    if (state) {
      const taxMonthly = (amount * (state.propTaxPct / 100)) / 12;
      return (
        <p className="tldr" style={{ fontWeight: 600 }}>
          Quick answer: on a {fmtAmount(amount)} home in {state.name} with 20% down at ~6.5% for 30 years, principal + interest is roughly {fmtAmount(pmt)}/month. Property tax at {state.name}&apos;s average {state.propTaxPct}% of value adds about {fmtAmount(taxMonthly)}/month, before insurance — and total interest over the loan runs about {fmtAmount(totalInt)}.
        </p>
      );
    }
    return (
      <p className="tldr" style={{ fontWeight: 600 }}>
        Quick answer: on a {fmtAmount(amount)} home with 20% down at ~6.5% for 30 years, the principal + interest payment is roughly {fmtAmount(pmt)}/month (before taxes and insurance), with about {fmtAmount(totalInt)} in total interest.
      </p>
    );
  }
  if (amount && amountKind === "income" && slug === "home-affordability-calculator") {
    const income = amount;
    const dtiLimit = (income / 12) * 0.36;
    if (state) {
      const housing = (income / 12) * 0.28;
      return (
        <p className="tldr" style={{ fontWeight: 600 }}>
          Quick answer: a {fmtAmount(income)} income in {state.name} supports roughly {fmtAmount(housing)}/month of housing cost at the 28% guideline, and lenders cap total debt at about {fmtAmount(dtiLimit)}/month (36% DTI). {state.name}&apos;s average property tax of {state.propTaxPct}% of value comes out of that same budget, so the same income buys less house here than in a low-property-tax state.
        </p>
      );
    }
    return (
      <p className="tldr" style={{ fontWeight: 600 }}>
        Quick answer: on a {fmtAmount(income)} gross income, lenders typically cap your total monthly debt at ~{fmtAmount(dtiLimit)} (36% DTI), which sets the mortgage payment and price range you can target.
      </p>
    );
  }
  if (age && ageTool) {
    const yearsTo = Math.max(1, ageTool.retirementAge - age);
    return (
      <p className="tldr" style={{ fontWeight: 600 }}>
        Quick answer: starting at age {age} gives you {yearsTo} years until {ageTool.retirementAge} — every year earlier adds roughly a full year of compounding on your contributions. Use the inputs below to model your own rate and monthly amount.
      </p>
    );
  }
  return null;
}

const RELATED_CLUSTERS: Record<string, { label: string; tools: string[] }> = {
  home: { label: "Home buying", tools: ["mortgage-calculator", "home-affordability-calculator", "pmi-calculator", "property-tax-calculator", "dti-calculator", "refinance-calculator", "heloc-calculator", "closing-costs-calculator", "home-equity-calculator"] },
  income: { label: "Income & taxes", tools: ["salary-after-tax-calculator", "paycheck-calculator", "hourly-to-salary-calculator", "salary-to-hourly-calculator", "tax-calculator", "tax-bracket-calculator", "overtime-calculator"] },
  debt: { label: "Debt & loans", tools: ["debt-payoff-calculator", "credit-card-payoff-calculator", "dti-calculator", "loan-calculator", "auto-loan-calculator", "student-loan-calculator", "debt-snowball-calculator"] },
  wealth: { label: "Investing & retirement", tools: ["retirement-calculator", "401k-calculator", "compound-interest-calculator", "investment-calculator", "savings-goal-calculator", "inflation-calculator", "rmd-calculator", "net-worth-calculator"] },
  improve: { label: "Home improvement", tools: ["concrete-calculator", "paint-calculator", "drywall-calculator", "tile-calculator", "mulch-calculator", "carpet-calculator", "home-remodel-cost-calculator", "square-footage-calculator"] },
};

function clusterKeyFor(slug: string): string | null {
  for (const [key, cl] of Object.entries(RELATED_CLUSTERS)) {
    if (cl.tools.includes(slug)) return key;
  }
  return null;
}

/**
 * THE single source of related-tool links for a page.
 *
 * Cluster siblings first (curated topical context), then the tool's own
 * registry `related[]`, deduped and never including the current slug. Every
 * internal-link block on a tool page derives from this list so the same tool is
 * never linked twice on one URL — before this existed, ToolClient's "Related
 * Calculators" grid and the shell's cluster grid both rendered and repeated the
 * same four tools on every page.
 */
export function relatedMembersFor(slug: string): string[] {
  const key = clusterKeyFor(slug);
  const out: string[] = [];
  const add = (t: string) => {
    if (t !== slug && !out.includes(t) && getTool(t)) out.push(t);
  };
  if (key) RELATED_CLUSTERS[key].tools.forEach(add);
  (getTool(slug)?.related || []).forEach(add);
  return out;
}

function RelatedTools({ current, stateSlug }: { current: string; stateSlug?: string }) {
  const members = relatedMembersFor(current);
  if (members.length === 0) return null;
  const key = clusterKeyFor(current);
  return (
    <div className="seo">
      <h2>{key ? `Related ${RELATED_CLUSTERS[key].label} tools` : "Related Calculators"}</h2>
      <div className="tool-grid">
        {members.map((t) => {
          const tt = getTool(t);
          if (!tt) return null;
          const toState = stateSlug && STATE_AWARE_TOOLS.includes(t);
          return (
            <Link key={t} href={toState ? `/${t}/${stateSlug}` : `/${t}`} className="tool-card">
              <h3>{toState ? `${getState(stateSlug)?.name || ""} ` : ""}{tt.shortTitle}</h3>
              <span className="cta">Open calculator →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NotFoundShell() {
  return (
    <>
      <Head><title>Not Found | {SITE_NAME}</title></Head>
      <main className="container">
        <h1>Tool not found</h1>
        <p><Link href="/">Browse all calculators</Link></p>
      </main>
    </>
  );
}
