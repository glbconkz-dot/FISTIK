'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { verifyB2BAdminGate } from '@/app/actions/b2b-admin';

export function B2BAdminGate() {
  const { t } = useAdminLocale();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verifyB2BAdminGate(password);
    if (!result.success) {
      setError(t('b2bWrongPassword'));
      setLoading(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="luxury-card p-6">
        <h1 className="text-xl font-semibold">{t('b2bGateTitle')}</h1>
        <p className="mt-2 text-sm text-muted">{t('b2bGateHint')}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('b2bGatePassword')}</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '…' : t('b2bGateSubmit')}
          </button>
        </form>
      </div>
    </div>
  );
}
