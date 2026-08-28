import ToolPageShell from "../../components/ToolPageShell";
import { getTool } from "../../lib/tools";
import { getState, STATE_AWARE_TOOLS } from "../../lib/states";

/**
 * State variant route: /[tool]/[state]
 * SSR via getServerSideProps so params are always populated (title/h1/canonical
 * in initial HTML) and invalid combos return a real 404.
 */
export async function getServerSideProps({ params }) {
  const slug = String(params.tool || "");
  const stateSlug = String(params.state || "");
  const tool = getTool(slug);
  const state = getState(stateSlug);

  if (!tool || !state || !STATE_AWARE_TOOLS.includes(slug)) {
    return { notFound: true };
  }
  return { props: { slug, stateSlug } };
}

export default function StateToolPage({ slug, stateSlug }) {
  return <ToolPageShell slug={slug} stateSlug={stateSlug} />;
}
