import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Optional: basePath if needed
  // basePath: '/landing',
}

export default nextConfig
