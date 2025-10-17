let withPWA = (config) => config;
try {
  const nextPWA = require('next-pwa');
  withPWA = nextPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  });
} catch (e) {
  console.warn('next-pwa not installed; PWA disabled');
}

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    allowedDevOrigins: ["*.cloudworkstations.dev"],
  },
});
