/**
 * SERP BUDGET HELPERS — added 2026-09-22.
 *
 * Google truncates a title at roughly 60 characters and a description at
 * roughly 160. Measured on usmoneyhq.com before this change: 843 of 1,938
 * titles (43.5%) and 968 of 1,938 descriptions (49.9%) were OVER budget, and
 * they clustered by template shape — 501 state titles, 182 comparison-pair
 * titles, 949 state descriptions. Every one of those pages was being cut off.
 *
 * Being cut off is not a ranking factor, but it IS a click-through factor, and
 * the ORDER made it worse than the raw count suggests: the state pages led with
 * the long generic `tool.description`, so the state-specific fact that trailed
 * (income-tax note, average property tax) was exactly what got truncated away —
 * the only words that differentiated the page from the other 356 state pages.
 *
 * Two rules, applied at the TEMPLATE so every variant inherits them:
 *   1. Load-bearing words first. The differentiator leads; brand and generic
 *      description trail.
 *   2. Hard budget. Drop the brand suffix before trimming content, and cut on a
 *      word boundary so a snippet never ends mid-word or on a function word.
 *
 * The caps are the WINDOW, not a ranking rule — do not lengthen copy to fill it.
 * Lives in lib/ (not in the component) so it can be unit-tested without React.
 */

export const BRAND_SUFFIX = " | US Money HQ";
export const TITLE_BUDGET = 60;
export const DESC_BUDGET = 160;

/** Function words that must never END a snippet — "…FICA, and state." reads broken. */
export const DANGLING = new Set([
  "and", "or", "the", "a", "an", "with", "for", "to", "of", "in",
  "on", "by", "from", "your", "their", "our", "state", "at", "as", "that", "this",
]);

/**
 * Fit a title into the SERP window, dropping the brand suffix before content.
 * Order matters: brand is the least load-bearing token, so it is sacrificed first.
 */
export function serpTitle(core: string): string {
  const c = (core || "").trim();
  if (c.length + BRAND_SUFFIX.length <= TITLE_BUDGET) return c + BRAND_SUFFIX;
  if (c.length <= TITLE_BUDGET) return c; // drop the brand, keep the content
  const cut = c.slice(0, TITLE_BUDGET - 1);
  const sp = cut.lastIndexOf(" ");
  return (sp > 30 ? cut.slice(0, sp) : cut).trimEnd() + "…";
}

/** Fit a description into the SERP window on a sentence or word boundary. */
export function serpDesc(text: string): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= DESC_BUDGET) return t;
  const cut = t.slice(0, DESC_BUDGET);
  // Prefer a whole sentence when one lands in the last ~45% of the window —
  // on the state pages the first sentence IS the differentiator, so this keeps
  // a complete thought instead of a clause fragment.
  const sent = cut.lastIndexOf(". ");
  if (sent >= DESC_BUDGET * 0.55) return cut.slice(0, sent + 1);
  const words = cut.split(" ");
  words.pop(); // trailing token is a partially rendered word
  while (words.length && DANGLING.has(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ""))) {
    words.pop();
  }
  return words.join(" ").replace(/[.,;:\s]+$/, "") + ".";
}
