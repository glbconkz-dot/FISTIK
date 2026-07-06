'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { createB2BCustomer } from '@/app/actions/b2b-admin';
import type { B2BBranchInput } from '@/types/b2b';

const emptyBranch = (): B2BBranchInput => ({
  branchName: '',
  address: '',
  isDefault: false,
});

export function B2BCustomerForm() {
  const { t } = useAdminLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [branches, setBranches] = useState<B2BBranchInput[]>([emptyBranch()]);

  const updateBranch = (index: number, patch: Partial<B2BBranchInput>) => {
    setBranches((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...patch } : b))
    );
  };

  const addBranch = () => {
    setBranches((prev) => [...prev, emptyBranch()]);
  };

  const removeBranch = (index: number) => {
    setBranches((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const form = new FormData(e.currentTarget);

    const result = await createB2BCustomer({
      companyName: form.get('companyName') as string,
      directorName: form.get('directorName') as string,
      inn: form.get('inn') as string,
      legalAddress: form.get('legalAddress') as string,
      phone: form.get('phone') as string,
      phoneAlt: (form.get('phoneAlt') as string) || '',
      password: (form.get('password') as string) || '',
      branches,
    });

    if (!result.success) {
      const map: Record<string, string> = {
        invalidPhone: t('b2bErrorInvalidPhone'),
        invalidPhoneAlt: t('b2bErrorInvalidPhoneAlt'),
        companyRequired: t('b2bErrorCompanyRequired'),
        phoneExists: t('b2bErrorPhoneExists'),
        saveFailed: t('b2bErrorSaveFailed'),
        setup: t('b2bErrorSetup'),
        unauthorized: t('b2bErrorUnauthorized'),
        schemaMissing: t('b2bErrorSchemaMissing'),
        permissionDenied: t('b2bErrorPermissionDenied'),
        invalidServiceKey: t('b2bErrorInvalidServiceKey'),
      };
      const main = map[result.error ?? ''] ?? t('b2bSaveFailed');
      const detail = result.errorDetail?.trim();
      setError(detail ? `${main}\n${detail}` : main);
      setLoading(false);
      return;
    }

    const pwd = result.data?.generatedPassword;
    setSuccess(
      pwd ? `${t('b2bCustomerCreated')} ${t('b2bNewPassword')} ${pwd}` : t('b2bCustomerCreated')
    );
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t('b2bNewCustomer')}</h1>
        <Link href="/admin/b2b" className="text-sm text-muted hover:text-foreground">
          ← {t('b2bBack')}
        </Link>
      </div>

      <div className="luxury-card space-y-4 p-6">
        <h2 className="font-medium">{t('b2bCompanyInfo')}</h2>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('b2bCompanyName')}</label>
          <input name="companyName" className="input-field" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('b2bDirector')}</label>
          <input name="directorName" className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">INN</label>
          <input name="inn" className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('b2bLegalAddress')}</label>
          <textarea name="legalAddress" className="input-field min-h-[80px]" rows={3} />
        </div>
      </div>

      <div className="luxury-card space-y-4 p-6">
        <h2 className="font-medium">{t('b2bPhones')}</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('b2bPhoneLogin')}</label>
          <input name="phone" type="tel" className="input-field" placeholder="+7 7XX XXX XX XX" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('b2bPhoneAlt')}</label>
          <input name="phoneAlt" type="tel" className="input-field" placeholder="+7 7XX XXX XX XX" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('b2bPassword')}</label>
          <input name="password" type="text" className="input-field" placeholder={t('b2bPasswordAuto')} />
        </div>
      </div>

      <div className="luxury-card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{t('b2bBranches')}</h2>
          <button
            type="button"
            onClick={addBranch}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            {t('b2bAddBranch')}
          </button>
        </div>
        <p className="text-xs text-muted">{t('b2bBranchesHint')}</p>

        {branches.map((branch, index) => (
          <div key={index} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('b2bBranch')} {index + 1}</span>
              {branches.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeBranch(index)}
                  className="text-muted hover:text-red-600"
                  aria-label={t('b2bRemoveBranch')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <input
              className="input-field"
              placeholder={t('b2bBranchName')}
              value={branch.branchName}
              onChange={(e) => updateBranch(index, { branchName: e.target.value })}
            />
            <textarea
              className="input-field min-h-[72px]"
              placeholder={t('b2bBranchAddress')}
              value={branch.address}
              onChange={(e) => updateBranch(index, { address: e.target.value })}
              rows={2}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="defaultBranch"
                checked={branch.isDefault ?? false}
                onChange={() =>
                  setBranches((prev) =>
                    prev.map((b, i) => ({ ...b, isDefault: i === index }))
                  )
                }
              />
              {t('b2bDefaultBranch')}
            </label>
          </div>
        ))}
      </div>

      {error ? (
        <p className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          {success}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
        {loading ? t('b2bSaving') : t('b2bSaveCustomer')}
      </button>
    </form>
  );
}
