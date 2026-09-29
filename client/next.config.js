/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for the Docker multi-stage build: generates a self-contained
  // server.js under .next/standalone that the production image runs directly.
  output: 'standalone',
};

module.exports = nextConfig;
