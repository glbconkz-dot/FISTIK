'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  ADMIN_LOCALE_COOKIE,
  getAdminMessages,
  type AdminLocale,
  type AdminMessageKey,
} from '@/lib/admin-messages';

type AdminLocaleContextValue = {
  locale: AdminLocale;
  t: (key: AdminMessageKey, vars?: Record<string, string | number>) => string;
  setLocale: (locale: AdminLocale) => void;
};

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null);

export function AdminLocaleProvider({
  locale,
  children,
}: {
  locale: AdminLocale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const dict = useMemo(() => getAdminMessages(locale), [locale]);

  const t = useCallback(
    (key: AdminMessageKey, vars?: Record<string, string | number>) => {
      let text: string = dict[key];
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          const s = String(value);
          text = text.replaceAll(`%{${name}}`, s).replaceAll(`{${name}}`, s);
        }
      }
      return text;
    },
    [dict]
  );

  const setLocale = useCallback(
    (next: AdminLocale) => {
      document.cookie = `${ADMIN_LOCALE_COOKIE}=${next};path=/admin;max-age=31536000;SameSite=Lax`;
      startTransition(() => router.refresh());
    },
    [router]
  );

  return (
    <AdminLocaleContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale() {
  const ctx = useContext(AdminLocaleContext);
  if (!ctx) {
    throw new Error('useAdminLocale must be used within AdminLocaleProvider');
  }
  return ctx;
}
