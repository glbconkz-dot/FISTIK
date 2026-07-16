'use client';

import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

/** CSS animasyon — menüde framer-motion yükü yok */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const style = { animationDelay: `${delay}s` } as CSSProperties;

  return (
    <div className={cn('animate-reveal-up', className)} style={style}>
      {children}
    </div>
  );
}

export function RevealScale({ children, className, delay = 0 }: RevealProps) {
  const style = { animationDelay: `${delay}s` } as CSSProperties;

  return (
    <div className={cn('animate-reveal-scale', className)} style={style}>
      {children}
    </div>
  );
}
