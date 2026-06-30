'use client';

import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { cn } from '@/lib/utils';

export function AdminLanguageSwitcher() {
  const { locale, setLocale, t } = useAdminLocale();

  return (
    <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
      {(['tr', 'ru'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            locale === code
              ? 'bg-foreground text-background'
              : 'text-muted hover:text-foreground'
          )}
        >
          {code === 'tr' ? t('langTr') : t('langRu')}
        </button>
      ))}
    </div>
  );
}
