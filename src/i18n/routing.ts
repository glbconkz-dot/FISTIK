import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['kk', 'ru', 'tr', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'always',
  /** fistik.kz her zaman /ru ile acilsin; tarayici/cihaz dili kullanilmasin */
  localeDetection: false,
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

export type AppLocale = (typeof routing.locales)[number];
