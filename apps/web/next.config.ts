import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // O browser fala só com o Next (/api/*), que repassa para a API: sem CORS.
  rewrites() {
    return Promise.resolve([{ source: '/api/:path*', destination: `${apiUrl}/:path*` }]);
  },
};

export default nextConfig;
