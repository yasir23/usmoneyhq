import ToolPageShell from "../../components/ToolPageShell";
import { getTool } from "../../lib/tools";
import { getState, getComparisonPair, STATE_AWARE_TOOLS } from "../../lib/states";
import { SALARY_AMOUNTS, SALARY_TOOL_SLUGS, amountFromSlug } from "../../lib/amounts";

/**
 * Variant route: /[tool]/[...segments] — handles every variant shape:
 *   /mortgage-calculator/california            → state
 *   /salary-after-tax-calculator/california-vs-texas → comparison pair
 *   /salary-after-tax-calculator/75000         → salary-amount scenario
 *   /salary-after-tax-calculator/75000/california → amount × state combo
 * Server-side validation: invalid combos return a REAL 404 (not 200).
 */
export async function getServerSideProps({ params }) {
  const slug = String(params.tool || "");
  const segs = (params.segments || []).map(String);
  const tool = getTool(slug);
  if (!tool) {
    return { notFound: true };
  }
  if (segs.length === 1) {
    const s = segs[0];
    if (s.includes("-vs-")) {
      if (!getComparisonPair(s)) return { notFound: true };
      return { props: { slug, stateSlug: s } };
    }
    if (amountFromSlug(s) !== undefined) {
      const amt = amountFromSlug(s);
      if (!SALARY_TOOL_SLUGS.includes(slug) || !SALARY_AMOUNTS.includes(amt)) return { notFound: true };
      return { props: { slug, amountSlug: s } };
    }
    if (!STATE_AWARE_TOOLS.includes(slug) || !getState(s)) return { notFound: true };
    return { props: { slug, stateSlug: s } };
  }
  if (segs.length === 2) {
    const amt = amountFromSlug(segs[0]);
    if (amt === undefined || !SALARY_TOOL_SLUGS.includes(slug) || !SALARY_AMOUNTS.includes(amt)) return { notFound: true };
    if (!STATE_AWARE_TOOLS.includes(slug) || !getState(segs[1])) return { notFound: true };
    return { props: { slug, amountSlug: segs[0], stateSlug: segs[1] } };
  }
  return { notFound: true };
}

export default function VariantToolPage({ slug, stateSlug, amountSlug }) {
  return <ToolPageShell slug={slug} stateSlug={stateSlug} amountSlug={amountSlug} />;
}
