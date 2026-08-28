/** @type {import('next').NextConfig} */
// Server mode: API routes + ISR need a runtime (Vercel free / Node host).
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
