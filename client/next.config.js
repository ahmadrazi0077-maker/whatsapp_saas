/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  experimental: {
    // Skip static generation for all pages
  },
}

module.exports = nextConfig
