/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
};
module.exports = nextConfig;
