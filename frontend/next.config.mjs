/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/student/login',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
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
      {
        source: '/books',
        destination: '/school/books',
        permanent: true,
      },
      {
        source: '/school-results',
        destination: '/school/results',
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
