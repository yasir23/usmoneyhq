import ToolPageShell from "../components/ToolPageShell";
import { getTool } from "../lib/tools";

/**
 * Dynamic tool route — SSR via getServerSideProps so params populate
 * in initial HTML (SEO) and unknown tools return a real 404.
 */
export async function getServerSideProps({ params }) {
  const slug = String(params.tool || "");
  const tool = getTool(slug);
  if (!tool) {
    return { notFound: true };
  }
  return { props: { slug } };
}

export default function DynamicTool({ slug }) {
  return <ToolPageShell slug={slug} />;
}
