'use client';

import { usePathname } from '@/i18n/routing';

interface FooterVisibilityProps {
  children: React.ReactNode;
}

/** Kapak sayfasinda alttaki tekrar eden footer gizlenir (logo kapakta) */
export function FooterVisibility({ children }: FooterVisibilityProps) {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return children;
}
