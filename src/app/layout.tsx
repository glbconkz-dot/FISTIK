import { Cormorant_Garamond, Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { sharedSiteMetadata, SITE_NAME } from '@/lib/site-metadata';

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700'],
  variable: '--font-display-family',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-body-family',
  display: 'swap',
});

export const metadata: Metadata = {
  ...sharedSiteMetadata,
  title: SITE_NAME,
  description: 'Luxury artisan bakery',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
