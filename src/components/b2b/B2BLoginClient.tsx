'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Home } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { signInB2B } from '@/app/actions/b2b-auth';
import { PhoneNationalInput } from '@/components/PhoneNationalInput';
import type { Locale } from '@/types';

interface B2BLoginClientProps {
  locale: Locale;
}

export function B2BLoginClient({ locale }: B2BLoginClientProps) {
  const t = useTranslations('b2b');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneNational, setPhoneNational] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const password = form.get('password') as string;
    const phone = phoneNational.length === 10 ? `7${phoneNational}` : phoneNational;

    try {
      const result = await signInB2B(phone, password, locale);
      if (!result?.success) {
        setError(t(`errors.${result?.error ?? 'invalidCredentials'}`));
        setLoading(false);
      }
    } catch {
      // redirect throws — success path
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="luxury-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold">{t('login.title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('login.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('login.phone')}</label>
            <PhoneNationalInput
              name="phoneNational"
              value={phoneNational}
              onChange={setPhoneNational}
              onBlur={() => undefined}
              placeholder="701 453 75 75"
            />
            <p className="mt-1 text-xs text-muted">{t('login.phoneHint')}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('login.password')}</label>
            <input
              name="password"
              type="password"
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || phoneNational.length !== 10}
          >
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        <Link
          href="/menu"
          className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-muted transition-colors hover:bg-border/40 hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          {t('login.backHome')}
        </Link>

        <p className="mt-4 rounded-lg border border-border bg-cream/50 px-3 py-2.5 text-xs leading-relaxed text-muted">
          {t('login.helpNote')}
        </p>
      </div>
    </div>
  );
}
