/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/admin', destination: '/login', permanent: false },
      { source: '/admin/:path*', destination: '/dashboard', permanent: false },
    ];
  },
};

export default nextConfig;
