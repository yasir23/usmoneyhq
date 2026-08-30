import ToolPageShell from "../../components/ToolPageShell";
import { getTool } from "../../lib/tools";
import { SALARY_AMOUNTS, SALARY_TOOL_SLUGS, amountFromSlug } from "../../lib/amounts";

/**
 * Salary-amount scenario route: /[tool]/[amount] (e.g. /salary-after-tax-calculator/75000)
 * Each amount page precomputes REAL take-home numbers — programmatic SEO with
 * genuinely different data per page.
 */
export async function getServerSideProps({ params }) {
  const slug = String(params.tool || "");
  const amountSlug = String(params.amount || "");
  const amount = amountFromSlug(amountSlug);
  const tool = getTool(slug);

  if (!tool || !SALARY_TOOL_SLUGS.includes(slug) || amount === undefined || !SALARY_AMOUNTS.includes(amount)) {
    return { notFound: true };
  }
  return { props: { slug, amountSlug } };
}

export default function AmountToolPage({ slug, amountSlug }) {
  return <ToolPageShell slug={slug} amountSlug={amountSlug} />;
}
