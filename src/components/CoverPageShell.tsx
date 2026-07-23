'use client';

import { useEffect, type ReactNode } from 'react';

interface CoverPageShellProps {
  children: ReactNode;
}

/** Kapak sayfasinda main genisligi / padding ayari */
export function CoverPageShell({ children }: CoverPageShellProps) {
  useEffect(() => {
    document.body.dataset.page = 'cover';
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  return <div className="cover-page-root">{children}</div>;
}
