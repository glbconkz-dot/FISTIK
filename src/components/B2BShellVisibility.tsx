'use client';

import { usePathname } from '@/i18n/routing';

interface B2BShellVisibilityProps {
  children: React.ReactNode;
}

/** B2B kanalinda B2C ust menu ve sepet cubugu gizlenir */
export function B2BShellVisibility({ children }: B2BShellVisibilityProps) {
  const pathname = usePathname();
  if (pathname.startsWith('/b2b')) return null;
  return children;
}
