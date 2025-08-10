/** @type {import('next').NextConfig} */
const nextConfig = {
  // images config consolidated below
  // Désactive le cache du build pour éviter les problèmes de cache
  // experimental options cleaned (serverActions removed for Next 15)
  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Allow any https host if needed
      // { protocol: 'https', hostname: '**' },
      // Explicitly allow Supabase public storage URLs
      {
        protocol: 'https',
        hostname: 'gptxlsbpgjmkjlwbsfpq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Keep other common hosts
      { protocol: 'https', hostname: 'ik.imagekit.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'sikasso-sugu.vercel.app', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'localhost', port: '', pathname: '/**' },
    ],
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
