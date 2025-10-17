// /home/user/studio/apps/web/next.config.mjs
// Next.js + next-pwa minimal integration for App Router (Next 14)
// PWA is enabled only in production builds.

import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  experimental: {
    appDir: true,
  },
  // You can add any Next config you already use here (images, transpilePackages, etc.)
};

const isProd = process.env.NODE_ENV === 'production';

export default withPWA({
  dest: 'public',
  disable: !isProd,    // off in dev/preview, on in prod build
  register: true,      // auto-register service worker
  skipWaiting: true,   // activate new SW immediately on refresh
})(nextConfig);
