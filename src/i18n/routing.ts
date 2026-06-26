import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['kk', 'tr', 'ru', 'en'],
  defaultLocale: 'kk',
  localePrefix: 'always',
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

export type AppLocale = (typeof routing.locales)[number];
