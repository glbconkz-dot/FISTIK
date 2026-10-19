'use client';

import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';

export function AdminSqlNotice() {
  const { t } = useAdminLocale();

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">{t('ordersSqlNoticeTitle')}</p>
      <p className="mt-1">{t('ordersSqlNoticeBody')}</p>
    </div>
  );
}
