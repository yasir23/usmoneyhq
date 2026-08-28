import Link from "next/link";
import { TOOLS } from "../lib/tools";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>Popular Calculators</h3>
            {TOOLS.slice(0, 6).map((t) => (
              <Link key={t.slug} href={`/${t.slug}`}>{t.shortTitle}</Link>
            ))}
          </div>
          <div>
            <h3>More Tools</h3>
            {TOOLS.slice(6, 13).map((t) => (
              <Link key={t.slug} href={`/${t.slug}`}>{t.shortTitle}</Link>
            ))}
          </div>
          <div>
            <h3>Company</h3>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </div>
        </div>
        <div className="footer-legal">
          <p>© {new Date().getFullYear()} US Calc Tools. Calculators are estimates for informational purposes only — not financial, legal, or medical advice.</p>
          <p>Supported by advertising. No account required. No personal data stored.</p>
        </div>
      </div>
    </footer>
  );
}
