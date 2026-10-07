/** @type {import('next').NextConfig} */
// Server mode: API routes + ISR need a runtime (VPS / Vercel).
// output: standalone -> self-contained Node server for PM2 deploys.
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  output: "standalone",

  /**
   * The hospital price-transparency blog does not belong on this domain.
   *
   * usmoneyhq.com is a personal-finance calculator site. It was also hosting 20
   * CMS hospital-compliance articles plus a /blog hub — verified live
   * 2026-09-26. The individual posts already canonicalised to sealofaudit.com,
   * but the HUB self-canonicalised to usmoneyhq.com/blog while listing all 20,
   * so the domain still presented hospital-compliance content as its own.
   *
   * That is the topical mismatch the sitemap's own comment describes as
   * "drag[ging] a personal-finance domain's quality signal toward organic
   * search for hospital price-transparency terms it has no business ranking
   * for" — and AdSense had just rejected the site for low value content.
   *
   * 301s (Next emits 308 for permanent:true; equivalent for search engines)
   * move the content to the domain that sells the service, which is where any
   * accumulated signal should consolidate anyway. sealofaudit.com/blog returns
   * 200 and hosts the same slugs.
   *
   * redirects() is evaluated BEFORE filesystem routes, so this wins over
   * pages/blog/* without deleting them.
   */
  async redirects() {
    return [
      { source: "/blog", destination: "https://sealofaudit.com/blog", permanent: true },
      {
        source: "/blog/:slug",
        destination: "https://sealofaudit.com/blog/:slug",
        permanent: true,
      },
      // Trailing-slash form, which the header rules above also declare.
      {
        source: "/blog/:slug/",
        destination: "https://sealofaudit.com/blog/:slug",
        permanent: true,
      },

      /**
       * Host consolidation: www -> apex.
       *
       * Both hosts served HTTP 200 through the same Next runtime (verified
       * 2026-10-06). The canonical tag on www already pointed at the apex URL,
       * so Google could consolidate the signals — but a 200 on both hosts still
       * splits crawl budget and reporting, and Search Console's page export
       * showed 164 rows / 5,719 impressions on www against 388 rows / 19,429 on
       * the apex (22.7% of impressions). The same page appeared twice in the
       * report, with different positions, which is exactly the noise a 301
       * removes.
       *
       * A canonical tag is a hint; a 301 is a directive. This is why the audit
       * ranked it the priority technical action, and it is the one finding here
       * that was a live defect rather than a historical artifact.
       *
       * Deliberately LAST in this array: the /blog rules above match on path
       * only, so a www /blog URL reaches sealofaudit.com in one hop, while every
       * other www path falls through to this rule and lands on the apex. Putting
       * this first would turn every www /blog hit into a two-hop chain
       * (www -> apex -> sealofaudit).
       */
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.usmoneyhq.com" }],
        destination: "https://usmoneyhq.com/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      // Static assets — immutable, cache 1 year (browser + edge)
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Ad videos / media — cache 1 day
      {
        source: "/ads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" },
        ],
      },
      // Public images — cache 7 days
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, s-maxage=604800" },
        ],
      },
      // llms.txt + robots — edge cache 1 day
      {
        source: "/llms.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" },
        ],
      },
      // Blog + guides (fully static SSG content) — edge cache 1h.
      // These are the SEO pages; safe to serve from Cloudflare edge.
      {
        source: "/blog/:path*/",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/blog",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/guides/:path*/",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/guides",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      // Security headers on everything (no cache-control — keeps API uncached)
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Agent discovery Link headers (RFC 8288 / RFC 9727) on the homepage
      {
        source: "/",
        headers: [
          { key: "Link", value: '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/openapi+json", </developers>; rel="service-doc"; type="text/html", </.well-known/agent-card.json>; rel="http://www.w3.org/ns/agents#card", </llms.txt>; rel="describedby"; type="text/plain"' },
        ],
      },
      /**
       * CORS for the public compute surfaces.
       *
       * /developers promised "CORS-open for any origin" while the server sent no
       * Access-Control-* headers at all — verified live 2026-10-06 by sending an
       * Origin header and an OPTIONS preflight: the response came back 200/204
       * with nothing but `allow: GET, HEAD, OPTIONS, POST`. A server-side or
       * agent client never notices the omission, which is exactly why the false
       * claim survived so long; a browser on another origin is blocked outright,
       * and a browser on another origin is the case the page advertises.
       *
       * Scoped to /api/calc and /api/widget only. Both are pure public
       * arithmetic — no authentication, no session, no user data — so a
       * wildcard origin exposes nothing. Deliberately NOT applied to
       * /api/subscribe, /api/go, or /api/px, which hold state or carry abuse
       * potential.
       */
      {
        source: "/api/calc/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
      {
        source: "/api/widget/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
