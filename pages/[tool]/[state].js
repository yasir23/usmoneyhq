import { useRouter } from "next/router";
import ToolPageShell from "../../components/ToolPageShell";

/**
 * State variant route: /[tool]/[state]
 * Renders a state-specific calculator page (programmatic SEO).
 * Only valid for STATE_AWARE_TOOLS; everything else 404s.
 */
export default function StateToolPage() {
  const router = useRouter();
  const { tool, state } = router.query;
  if (!tool || !state) return null;
  return <ToolPageShell slug={String(tool)} stateSlug={String(state)} />;
}
