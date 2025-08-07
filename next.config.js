/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'sikasso-sugu.vercel.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Désactive le cache du build pour éviter les problèmes de cache
  experimental: {
    serverActions: true,
  },
  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Configuration pour le déploiement sur Vercel
  output: 'standalone',
  // Ignorer les erreurs de TypeScript pendant le build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorer les erreurs d'ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
