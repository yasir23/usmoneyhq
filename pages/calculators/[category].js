import Head from "next/head";
import Link from "next/link";
import { TOOLS, SITE_URL, SITE_NAME } from "../../lib/tools";
import { CATEGORIES } from "../../lib/categories";

/** /calculators/[category] — category landing page with tool grid + intro. */
export async function getStaticPaths() {
  return { paths: CATEGORIES.map((c) => ({ params: { category: c.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const cat = CATEGORIES.find((c) => c.slug === params.category);
  return { props: { category: cat } };
}

export default function CategoryPage({ category }) {
  const tools = TOOLS.filter((t) => category.match.some((k) => t.slug.includes(k)));
  return (
    <>
      <Head>
        <title>{category.name} Calculators (2026) — Free | US Money HQ</title>
        <meta name="description" content={category.desc} />
        <link rel="canonical" href={`${SITE_URL}/calculators/${category.slug}`} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><span>{category.name}</span></nav>
        <h1>{category.h1}</h1>
        <p className="sub">{category.desc}</p>
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
