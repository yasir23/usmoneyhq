import Link from "next/link";
import SiteFooter from "../components/SiteFooter";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand">
            <span className="brand-mark">US</span> Calc Tools
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
