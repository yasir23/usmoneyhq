/** @type {import('next').NextConfig} */
// Server mode: API routes + ISR need a runtime (VPS / Vercel).
// output: standalone -> self-contained Node server for PM2 deploys.
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  output: "standalone",
  async headers() {
    return [
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
