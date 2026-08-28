/** @type {import('next').NextConfig} */
// Server mode: API routes + ISR need a runtime (VPS / Vercel).
// output: standalone -> self-contained Node server for PM2 deploys.
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  output: "standalone",
};

module.exports = nextConfig;
