'use client';

import { useEffect, useState } from 'react';

/** SSR ile localStorage (Zustand persist) uyuşmazlığını önler */
export function useIsClient(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
