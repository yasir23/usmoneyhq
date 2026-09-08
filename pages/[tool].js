import ToolPageShell from "../components/ToolPageShell";
import { getTool } from "../lib/tools";

/**
 * Dynamic tool route — SSR via getServerSideProps so params populate
 * in initial HTML (SEO) and unknown tools return a real 404.
 */
export async function getServerSideProps({ params, req }) {
  const slug = String(params.tool || "");
  const tool = getTool(slug);
  if (!tool) {
    return { notFound: true };
  }
  // US-only gate for affiliate content: Cloudflare sets cf-ipcountry; fallback ''
  const country = (req.headers["cf-ipcountry"] || "").toString().toUpperCase();
  return { props: { slug, country } };
}

export default function DynamicTool({ slug, country }) {
  return <ToolPageShell slug={slug} country={country} />;
}
