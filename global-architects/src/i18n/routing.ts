import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['kk', 'ru', 'tr', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'always',
  localeDetection: false,
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

export type AppLocale = (typeof routing.locales)[number];
