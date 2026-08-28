import Head from "next/head";
import Link from "next/link";
import AdSlot from "./AdSlot";
import ToolClient from "./ToolClient";
import { getTool, SITE_URL, SITE_NAME, TOOLS } from "../lib/tools";

/**
 * ToolPageShell — shared page shell for every calculator (pages router).
 * Centralizes SEO (title/meta/canonical/OG/JSON-LD), breadcrumbs, ad slots,
 * the tool UI, FAQ, and related links. New tools = new registry entry only.
 */
export default function ToolPageShell({ slug }: { slug: string }) {
  const tool = getTool(slug);
  if (!tool) {
    return (
      <>
        <Head><title>Not Found | {SITE_NAME}</title></Head>
        <main className="container">
          <h1>Tool not found</h1>
          <p><Link href="/">Browse all calculators</Link></p>
        </main>
      </>
    );
  }

  const url = `${SITE_URL}/${tool.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: tool.title,
        url,
        description: tool.description,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: tool.shortTitle, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{tool.title}</title>
        <meta name="description" content={tool.description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={tool.title} />
        <meta property="og:description" content={tool.description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={SITE_NAME} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <main className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>{tool.shortTitle}</span>
        </nav>

        <h1>{tool.h1}</h1>
        <p className="sub">{tool.sub}</p>

        <AdSlot id={`${tool.slug}-top`} />

        <ToolClient tool={tool} />

        <AdSlot id={`${tool.slug}-mid`} />
      </main>
    </>
  );
}
