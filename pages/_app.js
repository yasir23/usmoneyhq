import Link from "next/link";
import SiteFooter from "../components/SiteFooter";
import PageviewBeacon from "../components/PageviewBeacon";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Fires a pageview to /api/px on load and on client-side route changes.
          Measurement only: renders nothing, sets no cookies, never throws. */}
      <PageviewBeacon />
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand">
            <span className="brand-mark">US</span> Money HQ
          </Link>
          <nav className="nav-links" aria-label="Main">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </header>
      <Component {...pageProps} />
      <SiteFooter />
    </>
  );
}
