'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, KeyRound, Power } from 'lucide-react';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { formatB2BPhone } from '@/lib/b2b/phone';
import { resetB2BCustomerPassword, toggleB2BCustomerActive } from '@/app/actions/b2b-admin';
import type { B2BCustomerWithBranches } from '@/types/b2b';

interface B2BCustomerListProps {
  customers: B2BCustomerWithBranches[];
}

export function B2BCustomerList({ customers }: B2BCustomerListProps) {
  const { t } = useAdminLocale();
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleResetPassword = async (id: string, company: string) => {
    const result = await resetB2BCustomerPassword(id);
    if (result.success && result.data?.password) {
      setMessage(`${company}: ${t('b2bNewPassword')} ${result.data.password}`);
    } else {
      setMessage(t('b2bSaveFailed'));
    }
    router.refresh();
  };

  const handleToggle = async (id: string, next: boolean) => {
    await toggleB2BCustomerActive(id, next);
    router.refresh();
  };

  if (customers.length === 0) {
    return (
      <p className="text-sm text-muted">{t('b2bNoCustomers')}</p>
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {message}
        </p>
      ) : null}

      <div className="space-y-3">
        {customers.map((c) => (
          <div key={c.id} className="luxury-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold">{c.company_name}</h3>
                <p className="text-sm text-muted">
                  {t('b2bDirector')}: {c.director_name || '—'}
                </p>
                <p className="text-sm text-muted">
                  INN: {c.inn || '—'}
                </p>
                <p className="text-sm">
                  {formatB2BPhone(c.phone)}
                  {c.phone_alt ? ` · ${formatB2BPhone(c.phone_alt)}` : ''}
                </p>
                <p className="mt-1 text-xs text-muted">{c.legal_address}</p>
                {c.branches.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-muted">
                    {c.branches.map((b) => (
                      <li key={b.id}>
                        {b.is_default ? '★ ' : ''}
                        {b.branch_name}: {b.address}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-2 text-xs">
                  {c.terms_accepted_at ? t('b2bTermsAccepted') : t('b2bTermsPending')}
                  {' · '}
                  {c.is_active ? t('active') : t('inactive')}
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleResetPassword(c.id, c.company_name)}
                  className="flex min-h-[40px] items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm hover:bg-surface"
                >
                  <KeyRound className="h-4 w-4" />
                  {t('b2bResetPassword')}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(c.id, !c.is_active)}
                  className="flex min-h-[40px] items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm hover:bg-surface"
                >
                  <Power className="h-4 w-4" />
                  {c.is_active ? t('b2bDeactivate') : t('b2bActivate')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/admin/b2b/new"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background"
      >
        <Plus className="h-4 w-4" />
        {t('b2bAddCustomer')}
      </Link>
    </div>
  );
}
