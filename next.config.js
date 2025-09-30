/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    customKey: 'my-value',
  },
  images: {
    // Optimize image loading
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60, // Cache images for 60 seconds
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable image optimization
    unoptimized: false,
    // Loader configuration for better performance
    loader: 'default',
    // Remote patterns for external images (if needed in future)
    remotePatterns: [],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/database'
    ],
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Temporarily disable linting during build to measure bundle sizes
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize Firebase bundles
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use modular Firebase SDK
        'firebase/compat/app': false,
        'firebase/compat/auth': false,
        'firebase/compat/firestore': false,
      }
    }
    // Fix sharp optional dependencies warning
    if (isServer) {
      config.externals = [...(config.externals || []), 'sharp']
    }
    return config
  },
}

module.exports = nextConfig