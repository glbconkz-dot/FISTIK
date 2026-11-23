import { Source_Sans_3, Source_Serif_4 } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display-family',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-body-family',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'KA Global Architects',
    template: '%s — KA Global Architects',
  },
  description: 'Architecture, structure and interiors. I-category license, Almaty.',
  icons: { icon: '/mark.svg' },
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
    <html suppressHydrationWarning className={`${sourceSerif.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
