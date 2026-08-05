'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, FileText } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { acceptB2BTerms } from '@/app/actions/b2b-auth';
import { getB2BContractPublicUrl } from '@/lib/b2b/contract';
import type { Locale } from '@/types';

interface B2BTermsClientProps {
  locale: Locale;
  companyName: string;
  mode: 'accept' | 'view';
  hasWordContract: boolean;
  termsAcceptedAt?: string | null;
}

export function B2BTermsClient({
  locale,
  companyName,
  mode,
  hasWordContract,
  termsAcceptedAt,
}: B2BTermsClientProps) {
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

  const wordUrl = getB2BContractPublicUrl(locale);
  const acceptedLabel =
    mode === 'view' && termsAcceptedAt
      ? t('terms.acceptedAt', {
          date: new Date(termsAcceptedAt).toLocaleDateString(
            locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'kk' ? 'kk-KZ' : 'en-GB',
            { year: 'numeric', month: 'long', day: 'numeric' }
          ),
        })
      : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="luxury-card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <FileText className="mt-1 h-6 w-6 shrink-0 text-brand" aria-hidden />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold">
              {mode === 'view' ? t('terms.viewTitle') : t('terms.title')}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {mode === 'view'
                ? t('terms.viewSubtitle', { company: companyName })
                : t('terms.subtitle', { company: companyName })}
            </p>
            {acceptedLabel ? <p className="mt-1 text-xs text-muted">{acceptedLabel}</p> : null}
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-cream/40 px-3 py-2.5">
          <p className="text-xs font-medium text-brand-dark">{t('terms.wordTitle')}</p>
          {hasWordContract ? (
            <a
              href={wordUrl}
              download
              className="mt-2 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-cream hover:bg-brand-dark"
            >
              <Download className="h-4 w-4" aria-hidden />
              {t('terms.downloadWord')}
            </a>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-muted">{t('terms.wordPending')}</p>
          )}
        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">
          {t('terms.summaryLabel')}
        </p>
        <div className="mt-2 max-h-[50vh] overflow-y-auto rounded-lg border border-border bg-surface/50 p-4 text-sm leading-relaxed text-foreground/90">
          {t('terms.body')
            .split('\n')
            .map((line, i) => (
              <p key={i} className={line ? 'mb-2' : 'mb-1'}>
                {line}
              </p>
            ))}
        </div>

        {mode === 'accept' ? (
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
        ) : (
          <Link
            href="/b2b/menu"
            className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-border/40"
          >
            {t('terms.backToMenu')}
          </Link>
        )}
      </div>
    </div>
  );
}
