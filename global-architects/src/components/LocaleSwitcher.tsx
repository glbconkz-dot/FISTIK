'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname, routing } from '@/i18n/routing';

export function LocaleSwitcher() {
  const pathname = usePathname();
  const active = useLocale();

  return (
    <nav aria-label="Language" className="flex items-center gap-3">
      {routing.locales.map((locale) => {
        const isActive = locale === active;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            className={`label ${isActive ? 'text-charcoal' : 'text-muted hover:text-charcoal'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {locale}
          </Link>
        );
      })}
    </nav>
  );
}
