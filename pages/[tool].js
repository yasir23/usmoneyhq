import { useRouter } from "next/router";
import ToolPageShell from "../components/ToolPageShell";

/**
 * Dynamic route for future tools — pages router static routes take precedence,
 * so the 8 explicit pages win; this catches any new registry slug automatically.
 * Scalable programmatic SEO: add a lib/tools.ts entry, page exists.
 */
export default function DynamicTool() {
  const router = useRouter();
  const { tool } = router.query;
  if (!tool) return null;
  return <ToolPageShell slug={String(tool)} />;
}
