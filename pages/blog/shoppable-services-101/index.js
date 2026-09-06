import Head from "next/head";
import Link from "next/link";
import AdSlot from "../../../components/AdSlot";
import { SITE_URL } from "../../../lib/tools";

/** Blog: Shoppable Services 101: What Patients Are Legally Entitled to See (healthcare price transparency education) */
export default function BlogPost() {
  return (
    <>
      <Head>
        <title>Shoppable Services 101: What Patients Are Legally Entitled to See | US Money HQ</title>
        <meta name="description" content="The CMS shoppable services rule explained: the 70 required services, what patients can see, how to publish them correctly, and common gaps that trigger fines." />
        <link rel="canonical" href={`${SITE_URL}/blog/shoppable-services-101`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: "Shoppable Services 101: What Patients Are Legally Entitled to See", description: "The CMS shoppable services rule explained: the 70 required services, what patients can see, how to publish them correctly, and common gaps that trigger fines.", url: `https://usmoneyhq.com/blog/shoppable-services-101`, datePublished: "2026-09-06", author: { "@type": "Organization", name: "US Money HQ" }, publisher: { "@type": "Organization", name: "US Money HQ" } }) }} />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true">›</span><Link href="/blog">Blog</Link><span aria-hidden="true">›</span><span>Shoppable Services 101</span></nav>
        <h1>Shoppable Services 101: What Patients Are Legally Entitled to See</h1>
        <p className="sub">Healthcare finance and hospital price transparency — explained for owners, CFOs, and finance teams.</p>

        <AdSlot id="blog-shoppable-services-101-top" />

        <div className="seo">
          <h2>What shoppable services are</h2>
          <p>CMS selected 70 items and services that patients commonly shop for before care — imaging, lab tests, office visits, and common procedures. Hospitals must publish standard charges for each in a consumer-friendly format.</p>
          <h2>What patients can see</h2>
          <p>Patients are entitled to the gross charge, the discounted cash price, and payer-specific negotiated rates for each shoppable service — presented so they can compare before choosing a provider.</p>
          <h2>The format requirement</h2>
          <p>The consumer-friendly list must be searchable and understandable — not a giant undifferentiated table. Each service needs a plain-language description and its billing code.</p>
          <h2>The machine-file connection</h2>
          <p>The same 70 services must also appear in the machine-readable file with correct codes. Hospitals that pass the consumer list but fail the MRF are still non-compliant.</p>
          <h2>Common shoppable-service gaps</h2>
          <p>Missing services from the 70, non-standard descriptions, absent cash prices, and codes that do not match CMS's list. Each gap is a potential $5,500/day violation.</p>
          <h2>Verify your list</h2>
          <p>A free 8-point check validates all 70 services — presence, codes, descriptions, and prices — in both the consumer list and the MRF.</p>


          <div style={{ background: "#f6f6f4", border: "1px solid #ddd", borderRadius: 12, padding: 24, margin: "32px 0" }}>
            <h2>What to do next</h2>
            <p>If you run or advise a US hospital, the practical first step is the same free check CMS uses: an 8-point validation of your machine-readable file — score, failed elements, and 90-day exposure estimate in minutes.</p>
            <p><a href="https://sealofaudit.com/contact/">Get the free 8-point MRF check → SealOfAudit.com</a> · Call +1 315 953 2456 · <a href="https://calendar.app.google/oL6r8JZmxCiAuRJY7">Book a time</a></p>
          </div>

          <h2>Related reading</h2>
          <ul>
            <li><Link href="/blog/cms-mrf-requirements-2026">Cms Mrf Requirements 2026</Link></li>
            <li><Link href="/blog/what-is-machine-readable-file">What Is Machine Readable File</Link></li>
            <li><Link href="/blog/hospital-price-transparency-requirements">Hospital Price Transparency Requirements</Link></li>
            <li><a href="https://sealofaudit.com/services/mrf-remediation/">MRF remediation (SealOfAudit)</a></li>
            <li><a href="https://sealofaudit.com/services/cms-warning-letter-response/">CMS warning letter response (SealOfAudit)</a></li>
            <li><Link href="/blog">All US Money HQ guides</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
