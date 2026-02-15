/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/grpc-web/:path*', destination: 'http://localhost:8080/:path*' },
    ];
  },
};

module.exports = nextConfig;
