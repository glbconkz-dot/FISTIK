'use client';

import { formatPrice } from '@/lib/utils';
import { formatB2BPhone } from '@/lib/b2b/phone';
import {
  B2B_DISCOUNT_TIER_3_THRESHOLD,
  B2B_DISCOUNT_TIER_6_THRESHOLD,
} from '@/lib/b2b/constants';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import type { B2BMonthlyReport } from '@/lib/b2b/monthly-report';

interface B2BMonthlyReportTableProps {
  report: B2BMonthlyReport;
}

function formatMonthLabel(yearMonth: string, locale: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y!, m! - 1, 1);
  return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'tr-TR', {
    month: 'long',
    year: 'numeric',
  });
}

function DiscountBadge({ percent }: { percent: 0 | 3 | 6 }) {
  const { t } = useAdminLocale();
  if (percent === 0) {
    return <span className="text-muted">—</span>;
  }
  return (
    <span className="rounded-full bg-brand/30 px-2 py-0.5 text-xs font-semibold text-accent">
      {t('b2bReportDiscountBadge', { percent })}
    </span>
  );
}

export function B2BMonthlyReportTable({ report }: B2BMonthlyReportTableProps) {
  const { t, locale } = useAdminLocale();
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'tr-TR';

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="luxury-card p-4">
          <p className="text-xs text-muted">{t('b2bReportCurrentPaid')}</p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums">
            {formatPrice(report.totals.currentMonthPaid)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {formatMonthLabel(report.currentMonth, locale)}
          </p>
        </div>
        <div className="luxury-card p-4">
          <p className="text-xs text-muted">{t('b2bReportPrevPaid')}</p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums">
            {formatPrice(report.totals.previousMonthPaid)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {formatMonthLabel(report.previousMonth, locale)}
          </p>
        </div>
        <div className="luxury-card p-4">
          <p className="text-xs text-muted">{t('b2bReportUnpaid')}</p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-amber-800">
            {formatPrice(report.totals.unpaidTotal)}
          </p>
          <p className="mt-1 text-xs text-muted">{t('b2bReportUnpaidHint')}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-pistachio-soft/40 px-4 py-3 text-sm text-muted">
        {t('b2bReportRules', {
          t3: formatPrice(B2B_DISCOUNT_TIER_3_THRESHOLD),
          t6: formatPrice(B2B_DISCOUNT_TIER_6_THRESHOLD),
        })}
      </div>

      {report.rows.length === 0 ? (
        <p className="text-sm text-muted">{t('b2bNoCustomers')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-cream/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2.5 font-medium">{t('b2bCompanyName')}</th>
                <th className="px-3 py-2.5 font-medium">{t('b2bReportPrevPaid')}</th>
                <th className="px-3 py-2.5 font-medium">{t('b2bReportActiveDiscount')}</th>
                <th className="px-3 py-2.5 font-medium">{t('b2bReportCurrentPaid')}</th>
                <th className="px-3 py-2.5 font-medium">{t('b2bReportNextDiscount')}</th>
                <th className="px-3 py-2.5 font-medium">{t('b2bReportUnpaid')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {report.rows.map((row) => (
                <tr key={row.customerId} className={!row.isActive ? 'opacity-60' : undefined}>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{row.companyName}</p>
                    <p className="text-xs text-muted">{formatB2BPhone(row.phone)}</p>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {formatPrice(row.previousMonthPaid)}
                  </td>
                  <td className="px-3 py-2.5">
                    <DiscountBadge percent={row.activeDiscount} />
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {formatPrice(row.currentMonthPaid)}
                  </td>
                  <td className="px-3 py-2.5">
                    <DiscountBadge percent={row.nextMonthDiscount} />
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {row.unpaidOrderCount > 0 ? (
                      <span className="text-amber-800">
                        {formatPrice(row.unpaidOrderTotal)}
                        <span className="ml-1 text-xs text-muted">
                          ({row.unpaidOrderCount})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted">
        {t('b2bReportUpdated', {
          time: new Date().toLocaleString(dateLocale),
        })}
      </p>
    </div>
  );
}
