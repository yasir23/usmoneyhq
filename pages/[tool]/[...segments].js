import ToolPageShell from "../../components/ToolPageShell";
import { getTool } from "../../lib/tools";
import { amountFromSlug } from "../../lib/amounts";

/**
 * Variant route: /[tool]/[...segments] — handles every variant shape:
 *   /mortgage-calculator/california            → state
 *   /salary-after-tax-calculator/california-vs-texas → comparison pair
 *   /salary-after-tax-calculator/75000         → salary-amount scenario
 *   /salary-after-tax-calculator/75000/california → amount × state combo
 * Full validation happens in ToolPageShell (bad combos → real 404).
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
    if (s.includes("-vs-") || amountFromSlug(s) === undefined) {
      return { props: { slug, stateSlug: s } };
    }
    return { props: { slug, amountSlug: s } };
  }
  if (segs.length === 2 && amountFromSlug(segs[0]) !== undefined) {
    return { props: { slug, amountSlug: segs[0], stateSlug: segs[1] } };
  }
  return { notFound: true };
}

export default function VariantToolPage({ slug, stateSlug, amountSlug }) {
  return <ToolPageShell slug={slug} stateSlug={stateSlug} amountSlug={amountSlug} />;
}
