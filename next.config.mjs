/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    const sec = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    const long = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }];
    return [
      { source: '/(.*)', headers: sec },
      { source: '/images/:path*', headers: long },
      { source: '/fonts/:path*', headers: long },
    ];
  },
  async redirects() {
    return [
      { source: '/admin', destination: '/login', permanent: false },
      { source: '/admin/:path*', destination: '/dashboard', permanent: false },
    ];
  },
};

export default nextConfig;
