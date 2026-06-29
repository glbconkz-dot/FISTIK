import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import os from 'os';
import path from 'path';

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
  images: {
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
