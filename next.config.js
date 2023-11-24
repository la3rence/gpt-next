/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/chatgpt/:path*",
        destination: "/chatgpt",
      },
    ];
  },
};

module.exports = nextConfig;
