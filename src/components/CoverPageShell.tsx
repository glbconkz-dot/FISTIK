'use client';

import { useEffect, type ReactNode } from 'react';

interface CoverPageShellProps {
  children: ReactNode;
}

/** Kapak sayfasinda footer ve arka plan yesil tema */
export function CoverPageShell({ children }: CoverPageShellProps) {
  useEffect(() => {
    document.body.dataset.page = 'cover';
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  return <div className="cover-page-root">{children}</div>;
}
