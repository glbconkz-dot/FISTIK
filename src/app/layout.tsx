import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FISTIK',
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
    <html suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
