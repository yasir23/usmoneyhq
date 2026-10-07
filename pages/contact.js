import Head from "next/head";
import Link from "next/link";

/**
 * /contact
 *
 * Was three lines: an email address, a note about error reports, and a line
 * about advertising. The useful additions are the ones a reader arrives wanting:
 * what to include so the first reply is the useful one, what actually happens to
 * an error report on this site, and who to write to for a data request. That is
 * process, not padding — the correction path is something the site claims
 * elsewhere, and this is where a reader would look for it.
 */
export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us | US Money HQ</title>
        <meta name="description" content="Contact US Money HQ — report a calculation error, ask a question, or make a privacy request. We reply within 2 business days." />
        <link rel="canonical" href="https://usmoneyhq.com/contact" />
        <meta name="robots" content="index, follow" />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><Link href="/">Home</Link> <span aria-hidden="true">›</span> <span>Contact</span></nav>
        <h1>Contact Us</h1>
        <p className="sub">We typically reply within 2 business days.</p>

        <div className="card">
          <h2>Email</h2>
          <p><a href="mailto:hello@usmoneyhq.com">hello@usmoneyhq.com</a> — one address reaches a person, not a ticket queue.</p>

          <h2>Found a calculation error?</h2>
          <p>This is the message we most want. Include four things and we can usually confirm the fix without a second round trip:</p>
          <ul>
            <li>the full page address (for example <code>/salary-calculator/california</code>);</li>
            <li>the exact inputs you entered;</li>
            <li>the result the page showed;</li>
            <li>the result you expected, and where that figure comes from.</li>
          </ul>
          <p>Every report is checked against the formula the calculator runs and against the source table it uses. If the page is wrong we correct it and the correction is dated on the page. If the page is right and the difference is an assumption — a rate you supplied, a rounding convention, a state rule — we tell you which one and why.</p>

          <h2>Ask about a specific number</h2>
          <p>If a result surprised you, tell us the page and the input. Most disagreements trace back to one of three things: the boundary between tax brackets, whether a rate is applied monthly or annually, or a figure that is an assumption rather than a published rate. Our <Link href="/methodology">Methodology &amp; Data Sources</Link> page documents how each calculation is produced.</p>

          <h2>Privacy and data requests</h2>
          <p>To request access to, correction of, or deletion of personal information we hold about you, email <a href="mailto:hello@usmoneyhq.com?subject=Privacy%20request">hello@usmoneyhq.com</a> with the subject &ldquo;Privacy request&rdquo;. Our <Link href="/privacy-policy">Privacy Policy</Link> explains what we hold and how long we keep it.</p>

          <h2>Partnerships, licensing and advertising</h2>
          <p>Advertising on this site is managed through Google AdSense. For widget licensing, data licensing, sponsorship, or press enquiries, use the address above and put the nature of the enquiry in the subject line.</p>

          <h2>Before you write</h2>
          <p>Three checks resolve most messages without needing a reply at all:</p>
          <ul>
            <li>open <Link href="/methodology">Methodology &amp; Data Sources</Link> and confirm which formula the calculator runs;</li>
            <li>check whether the figure you expected came from a rate you are supposed to supply — an assumed rate, not a published one;</li>
            <li>if a state is involved, check whether the difference is a rule rather than an error.</li>
          </ul>

          <h2>How a correction is recorded</h2>
          <p>When a reported error turns out to be real, we fix the calculator and move the &ldquo;Last reviewed&rdquo; date shown on the page. That date reflects the day the content actually changed, not the day the site was last deployed — so if a page says it was reviewed recently, you can take that at face value.</p>

          <h2>Accessibility barriers</h2>
          <p>If something stops you using a calculator — an input that will not accept a value with a screen reader, a control that needs a mouse, contrast that makes a field unreadable — tell us the page and the browser or assistive technology you were using. We treat that as a bug, not a preference.</p>

          <h2>What we cannot help with</h2>
          <p>We cannot give personal financial, tax, or legal advice, review your individual circumstances, or recommend a specific product, lender, or adviser. The calculators are educational tools; see the <Link href="/terms">Terms of Use</Link>.</p>
        </div>
      </main>
    </>
  );
}
