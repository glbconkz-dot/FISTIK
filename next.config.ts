import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import os from 'os';
import path from 'path';
import { CATALOG_CACHE_CONTROL } from './src/lib/cache-config';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

function detectLocalLanHosts(): string[] {
  const hosts = new Set([
    'localhost',
    '127.0.0.1',
    // Telefondan Wi‑Fi test — tüm ev/ofis 192.168.x.x aralığı
    '192.168.*',
    '10.*',
  ]);
  for (const iface of Object.values(os.networkInterfaces())) {
    if (!iface) continue;
    for (const addr of iface) {
      const family = String(addr.family);
      if (family === 'IPv4' && !addr.internal) {
        hosts.add(addr.address);
      }
    }
  }
  return [...hosts];
}

/** Telefondan LAN IP ile dev test — Next.js 16 cross-origin / Server Actions engelini kaldırır */
const lanDevOrigins = (process.env.DEV_LAN_ORIGINS ?? detectLocalLanHosts().join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
  const lanIp = [...detectLocalLanHosts()].find((h) => /^\d+\.\d+\.\d+\.\d+$/.test(h));
  if (lanIp) {
    console.info(`[fistik] LAN test: http://${lanIp}:3000/kk`);
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: lanDevOrigins,
  turbopack: {
    root: path.join(__dirname),
  },
  headers: async () => [
    {
      source: '/:locale(kk|tr|ru|en)',
      headers: [{ key: 'Cache-Control', value: CATALOG_CACHE_CONTROL }],
    },
    {
      source: '/api/catalog',
      headers: [{ key: 'Cache-Control', value: CATALOG_CACHE_CONTROL }],
    },
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
