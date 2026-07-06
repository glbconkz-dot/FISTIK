'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { acceptB2BTerms } from '@/app/actions/b2b-auth';
import type { Locale } from '@/types';

interface B2BTermsClientProps {
  locale: Locale;
  companyName: string;
}

export function B2BTermsClient({ locale, companyName }: B2BTermsClientProps) {
  const t = useTranslations('b2b');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accepted) return;

    setLoading(true);
    setError('');

    try {
      const result = await acceptB2BTerms(locale);
      if (!result?.success) {
        setError(t(`errors.${result?.error ?? 'saveFailed'}`));
        setLoading(false);
      }
    } catch {
      // redirect on success
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="luxury-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold">{t('terms.title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('terms.subtitle', { company: companyName })}</p>

        <div className="mt-6 max-h-[50vh] overflow-y-auto rounded-lg border border-border bg-surface/50 p-4 text-sm leading-relaxed text-foreground/90">
          {t('terms.body')
            .split('\n')
            .map((line, i) => (
              <p key={i} className={line ? 'mb-2' : 'mb-1'}>
                {line}
              </p>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
            />
            <span className="text-sm">{t('terms.acceptLabel')}</span>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button type="submit" className="btn-primary w-full" disabled={!accepted || loading}>
            {loading ? t('terms.accepting') : t('terms.accept')}
          </button>
        </form>
      </div>
    </div>
  );
}
