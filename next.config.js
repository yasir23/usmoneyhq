/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // static export -> free hosting (GitHub Pages / Netlify / Vercel static)
  output: "export",
  images: { unoptimized: true },
};

module.exports = nextConfig;
