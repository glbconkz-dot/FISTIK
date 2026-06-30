import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fistik.kz';

export const SITE_NAME = 'FISTIK';

/** WhatsApp / Telegram link onizlemesi + tarayici sekmesi */
export const BRAND_ICON = '/logo-square.png';

export const brandOpenGraphImage = {
  url: BRAND_ICON,
  width: 1024,
  height: 1024,
  alt: 'FISTIK',
};

export const sharedSiteMetadata: Pick<Metadata, 'metadataBase' | 'icons' | 'openGraph' | 'twitter'> = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: BRAND_ICON, type: 'image/png', sizes: '1024x1024' }],
    apple: [{ url: BRAND_ICON, type: 'image/png', sizes: '1024x1024' }],
    shortcut: BRAND_ICON,
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
