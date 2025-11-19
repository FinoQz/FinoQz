import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Optional: basePath if needed
  // basePath: '/landing',
}

export default nextConfig
