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

export function LanguageSwitcher({ tone = 'default' }: { tone?: 'default' | 'brand' }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full p-1',
        tone === 'brand'
          ? 'border border-cream/35 bg-cream/10'
          : 'border border-border bg-surface'
      )}
    >
      {locales.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => router.replace(pathname, { locale: l.code })}
          className={cn(
            'min-h-[32px] min-w-[36px] rounded-full px-2 text-xs font-semibold transition-colors',
            tone === 'brand'
              ? locale === l.code
                ? 'bg-cream text-brand-dark'
                : 'text-cream/80 hover:bg-cream/15 hover:text-cream'
              : locale === l.code
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
