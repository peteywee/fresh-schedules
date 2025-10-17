/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow Firebase Studio Cloud Workstations to access /_next/* in dev.
  // This prevents cross-origin warnings when previewing in that environment.
  allowedDevOrigins: [
    'https://*.cloudworkstations.dev',
  ],
};
module.exports = nextConfig;
