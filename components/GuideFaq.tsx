import Head from "next/head";
import { GUIDE_FAQ } from "../lib/guideFaq";

/**
 * Guide FAQ block + FAQPage schema.
 *
 * Rendered once per guide, below the embedded calculator. The calculator
 * component renders its own Q&A and that stays on the tool page, so this
 * block is passed showFaq={false} upstream — one visible FAQ per URL, matched
 * by exactly one FAQPage block.
 */
export default function GuideFaq({ slug }: { slug: string }) {
  const faq = GUIDE_FAQ[slug];
  if (!faq || faq.length === 0) return null;

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </Head>
      <div className="seo" style={{ marginTop: 24 }}>
        <h2>Frequently Asked Questions</h2>
        {faq.map((f, idx) => (
          <div key={idx} style={{ marginBottom: 14 }}>
            <h3 style={{ marginBottom: 4 }}>{f.q}</h3>
            <p style={{ marginTop: 0 }}>{f.a}</p>
          </div>
        ))}
      </div>
    </>
  );
}
