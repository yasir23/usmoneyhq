/** @type {import('next').NextConfig} */
// Server mode: API routes + ISR need a runtime (VPS / Vercel).
// output: standalone -> self-contained Node server for PM2 deploys.
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  output: "standalone",
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
    ];
  },
};

module.exports = nextConfig;
