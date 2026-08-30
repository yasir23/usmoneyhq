import ToolPageShell from "../../components/ToolPageShell";
import { getTool } from "../../lib/tools";
import { getState, STATE_AWARE_TOOLS } from "../../lib/states";
import { SALARY_AMOUNTS, SALARY_TOOL_SLUGS, amountFromSlug } from "../../lib/amounts";

/**
 * Salary-amount × state combo route: /[tool]/[amount]/[state]
 * (e.g. /salary-after-tax-calculator/75000/california) — targets the
 * "75k salary after taxes california" search cluster. Real numbers per combo.
 */
export async function getServerSideProps({ params }) {
  const slug = String(params.tool || "");
  const amountSlug = String(params.amount || "");
  const stateSlug = String(params.state || "");
  const amount = amountFromSlug(amountSlug);
  const tool = getTool(slug);

  if (!tool || !SALARY_TOOL_SLUGS.includes(slug) || amount === undefined || !SALARY_AMOUNTS.includes(amount)) {
    return { notFound: true };
  }
  if (!STATE_AWARE_TOOLS.includes(slug) || !getState(stateSlug)) {
    return { notFound: true };
  }
  return { props: { slug, stateSlug, amountSlug } };
}

export default function AmountStateToolPage({ slug, stateSlug, amountSlug }) {
  return <ToolPageShell slug={slug} stateSlug={stateSlug} amountSlug={amountSlug} />;
}
