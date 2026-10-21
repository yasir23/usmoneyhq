// lib/pageSchema.ts — JSON-LD for the static (non-tool, non-guide) pages.
//
// ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
// Measured on the live site 2026-10-21: /about, /methodology and /contact
// returned ZERO `application/ld+json` blocks, and /guides — the hub that links
// all 18 guides — returned zero as well. Tool pages were fine (WebApplication +
// FAQPage + BreadcrumbList) and guides were fine (Article + Organization), so the
// gap was exactly the pages an answer engine uses to decide WHO publishes the
// site and WHAT the guide collection is. An engine that cannot name the
// publisher will not cite the page.
//
// ── RULES ───────────────────────────────────────────────────────────────────
// 1. Every block is derived from the page's OWN title and description, so the
//    markup cannot describe something the page does not say.
// 2. `@id` values are stable URLs (`#organization`, `#website`) so a page can
//    reference the site nodes instead of duplicating them.
// 3. Nothing is invented: no aggregateRating, no review counts, no sameAs
//    profiles we do not own, no founding date, no founder.
import { SITE_URL, SITE_NAME } from "./tools";

/** Reference to the publisher node — one definition, linked from every page. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const ORGANIZATION_NODE = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/og.png`,
  },
  description:
    "US Money HQ publishes free US pay, tax, mortgage and retirement calculators with the formula, data source and exclusions shown on every page.",
};

export type StaticPageType =
  | "WebPage"
  | "AboutPage"
  | "ContactPage"
  | "CollectionPage"
  | "FAQPage";

type StaticPageInput = {
  /** Page title WITHOUT the "| US Money HQ" suffix — used as the node name. */
  name: string;
  description: string;
  /** Path only, e.g. "/about". */
  path: string;
  /** schema.org type for this page. */
  type?: StaticPageType;
  /** ISO date (YYYY-MM-DD) the page content last changed. Omit if unknown. */
  dateModified?: string;
};

/**
 * Build a graph for a static page: the page itself, the site it belongs to, the
 * publisher, and a breadcrumb trail below the root.
 */
export function staticPageSchema({
  name,
  description,
  path,
  type = "WebPage",
  dateModified,
}: StaticPageInput) {
  const url = `${SITE_URL}${path}`;

  const page: Record<string, unknown> = {
    "@type": type,
    "@id": `${url}#page`,
    url,
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en-US",
  };
  if (dateModified) page.dateModified = dateModified;

  const graph: Record<string, unknown>[] = [
    page,
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": ORGANIZATION_ID },
    },
    ORGANIZATION_NODE,
  ];

  if (path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name,
          item: url,
        },
      ],
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * Build a list-page graph (the /guides hub): the collection, an ItemList of its
 * members in display order, and the shared breadcrumb.
 *
 * `items` must be the same array the page renders, so the markup cannot list a
 * guide the page does not show.
 */
export function collectionSchema({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: { href: string; title: string }[];
}) {
  const base = staticPageSchema({
    name,
    description,
    path,
    type: "CollectionPage",
  }) as { "@context": string; "@graph": Record<string, unknown>[] };

  base["@graph"].push({
    "@type": "ItemList",
    "@id": `${SITE_URL}${path}#items`,
    name,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.title,
      url: `${SITE_URL}${g.href}`,
    })),
  });

  return base;
}
