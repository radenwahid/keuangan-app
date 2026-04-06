import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['bcryptjs'],

  // Kompres response
  compress: true,

  // Optimasi gambar
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Kurangi ukuran bundle dengan tree shaking lebih agresif
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
    ],
  },
};

export default nextConfig;
