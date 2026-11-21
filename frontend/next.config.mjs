/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/pricing',
        destination: '/',
        permanent: true,
      },
      {
        source: '/checkout',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Only rewrite to external backend if NEXT_PUBLIC_API_URL is explicitly set
    if (backendUrl && backendUrl.startsWith("http")) {
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
