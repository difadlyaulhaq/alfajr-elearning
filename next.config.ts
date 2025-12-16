import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com', // Izinkan domain thumbnail YouTube
        pathname: '/**',
      },
      // ... domain lain yang sudah ada (misal firebasestorage, dll)
    ],
  },
  /* config options here */
};

export default nextConfig;
