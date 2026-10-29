import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fistik.kz';

export const SITE_NAME = 'FISTIK';

/** Cache-bust so Google / browsers drop stale Vercel default icons */
const ICON_VERSION = '20261029';

/** WhatsApp / Telegram link onizlemesi + tarayici sekmesi */
export const BRAND_ICON = `/logo-square.png?v=${ICON_VERSION}`;

export const brandOpenGraphImage = {
  url: BRAND_ICON,
  width: 1024,
  height: 1024,
  alt: 'FISTIK',
};

export const sharedSiteMetadata: Pick<
  Metadata,
  'metadataBase' | 'icons' | 'openGraph' | 'twitter' | 'applicationName'
> = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: `/favicon-48.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '48x48' },
      { url: `/icon-192.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '192x192' },
      { url: BRAND_ICON, type: 'image/png', sizes: '1024x1024' },
    ],
    apple: [{ url: `/icon-192.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '192x192' }],
    shortcut: `/favicon-48.png?v=${ICON_VERSION}`,
  },
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    images: [brandOpenGraphImage],
  },
  twitter: {
    card: 'summary',
    images: [BRAND_ICON],
  },
};

/** Google Knowledge / SERP logo için yapılandırılmış veri */
export function brandJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-square.png?v=${ICON_VERSION}`,
    image: `${SITE_URL}/logo-square.png?v=${ICON_VERSION}`,
  };
}
