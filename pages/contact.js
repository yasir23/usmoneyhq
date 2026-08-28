import Head from "next/head";

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us | US Money HQ</title>
        <meta name="description" content="Contact US Money HQ — questions, corrections, or partnership inquiries." />
        <link rel="canonical" href="https://usmoneyhq.com/contact" />
      </Head>
      <main className="container">
        <nav className="breadcrumbs"><span>Home</span> <span aria-hidden="true">›</span> <span>Contact</span></nav>
        <h1>Contact Us</h1>
        <p className="sub">We typically reply within 2 business days.</p>

        <div className="card">
          <h2>Email</h2>
          <p><a href="mailto:hello@usmoneyhq.com">hello@usmoneyhq.com</a></p>

          <h2>Found a calculation error?</h2>
          <p>Include the calculator name, the numbers you entered, and what you expected. We verify every report against the source formula.</p>

          <h2>Partnerships & advertising</h2>
          <p>Advertising is managed through Google AdSense. For other inquiries, email us at the address above.</p>
        </div>
      </main>
    </>
  );
}
