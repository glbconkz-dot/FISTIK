'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Soft page enter — keeps navigation feeling fast without heavy transitions. */
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
