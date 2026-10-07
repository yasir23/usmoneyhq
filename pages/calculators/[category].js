import Head from "next/head";
import Link from "next/link";
import { TOOLS, SITE_URL, SITE_NAME } from "../../lib/tools";
import { CATEGORIES } from "../../lib/categories";

/**
 * /calculators/[category] — category landing page: intro, tool grid, editorial.
 *
 * DEEPENED 2026-10-06. The page previously rendered a heading, a one-line
 * description, a tool grid and a list of the other hubs — 278 words, with nothing
 * that explained the subject. The editorial sections come from `category.intro`
 * in lib/categories.ts, which is also what the homepage reads, so the hub copy
 * and the category definition cannot drift apart.
 *
 * The "start here" link resolves against TOOLS and throws at build time if the
 * slug does not exist, rather than shipping a link to a 404.
 */
export async function getStaticPaths() {
  return { paths: CATEGORIES.map((c) => ({ params: { category: c.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const cat = CATEGORIES.find((c) => c.slug === params.category);
  if (!cat) return { notFound: true };

  // A recommended starting point that is not in the registry is a broken promise,
  // so fail the build instead of rendering a dead link.
  const startTool = TOOLS.find((t) => t.slug === cat.startWith);
  if (!startTool) {
    throw new Error(
      `categories.ts: "${cat.slug}".startWith = "${cat.startWith}", which is not a tool slug in lib/tools.ts`
    );
  }

  return {
    props: {
      category: {
        slug: cat.slug,
        name: cat.name,
        h1: cat.h1,
        desc: cat.desc,
        match: cat.match,
        intro: cat.intro,
        startWith: cat.startWith,
        startWithWhy: cat.startWithWhy,
        startTitle: startTool.shortTitle || startTool.title,
      },
    },
  };
}

export default function CategoryPage({ category }) {
  const tools = TOOLS.filter((t) => category.match.some((k) => t.slug.includes(k)));

  return (
    <>
      <Head>
        <title>{category.name} Calculators (2026) — Free | {SITE_NAME}</title>
        <meta name="description" content={category.desc} />
        <link rel="canonical" href={`${SITE_URL}/calculators/${category.slug}`} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: category.h1,
              description: category.desc,
              url: `${SITE_URL}/calculators/${category.slug}`,
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: tools.length,
                itemListElement: tools.map((t, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: t.shortTitle || t.title,
                  url: `${SITE_URL}/${t.slug}`,
                })),
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators` },
                { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/calculators/${category.slug}` },
              ],
            }),
          }}
        />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>{category.name}</span></nav>
        <h1>{category.h1}</h1>
        <p className="sub">{category.desc}</p>

        <div className="note-box">
          <strong>New here?</strong> Start with the{" "}
          <Link href={`/${category.startWith}`}>{category.startTitle}</Link> — {category.startWithWhy}
        </div>

        <div className="tool-grid">
          {tools.map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="tool-card">
              <h2>{t.shortTitle}</h2>
              <p>{t.description.split(".")[0]}.</p>
              <span className="cta">Open calculator →</span>
            </Link>
          ))}
        </div>

        <div className="seo">
          {category.intro.map((section) => (
            <div key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ))}

          <h2>How these calculators are built</h2>
          <p>
            Each calculator runs the same published formula the interactive page uses, in your
            browser, and needs no account. Rates, prices and local costs are inputs you supply
            rather than figures we assert, so a result reflects your situation instead of a
            national average. See <Link href="/methodology">Methodology &amp; Data Sources</Link>{" "}
            for the source of each formula and table, and{" "}
            <Link href="/contact">contact us</Link> if a number looks wrong — corrections are
            checked against the formula and dated on the page.
          </p>

          <h2>All categories</h2>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link href={`/calculators/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
