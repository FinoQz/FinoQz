import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // Optional: basePath if needed
  // basePath: '/landing',
}
module.exports = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig
