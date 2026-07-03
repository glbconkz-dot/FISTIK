'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const locales = [
  { code: 'kk' as const, label: 'KZ' },
  { code: 'ru' as const, label: 'RU' },
  { code: 'tr' as const, label: 'TR' },
  { code: 'en' as const, label: 'EN' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
      {locales.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => router.replace(pathname, { locale: l.code })}
          className={cn(
            'min-h-[32px] min-w-[36px] rounded-full px-2 text-xs font-semibold transition-colors',
            locale === l.code
              ? 'bg-foreground text-background'
              : 'text-muted hover:text-foreground'
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
