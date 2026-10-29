'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { formatB2BPhone } from '@/lib/b2b/phone';
import {
  B2B_DISCOUNT_TIER_3_THRESHOLD,
  B2B_DISCOUNT_TIER_6_THRESHOLD,
} from '@/lib/b2b/constants';
import { yearMonthInStoreTimezone } from '@/lib/b2b/monthly-stats';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import type { B2BMonthlyReport } from '@/lib/b2b/monthly-report';

interface B2BMonthlyReportTableProps {
  report: B2BMonthlyReport;
  initialCustomerId?: string;
  initialActiveOnly?: boolean;
}

function formatMonthLabel(yearMonth: string, locale: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y!, m! - 1, 1);
  return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'tr-TR', {
    month: 'long',
    year: 'numeric',
  });
}

function buildMonthOptions(current: string): string[] {
  const options: string[] = [];
  const [y, m] = current.split('-').map(Number);
  let year = y!;
  let month = m!;
  for (let i = 0; i < 18; i++) {
    options.push(`${year}-${String(month).padStart(2, '0')}`);
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
  }
  return options;
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

export function B2BMonthlyReportTable({
  report,
  initialCustomerId = '',
  initialActiveOnly = false,
}: B2BMonthlyReportTableProps) {
  const { t, locale } = useAdminLocale();
  const router = useRouter();
  const pathname = usePathname();
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'tr-TR';
  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [activeOnly, setActiveOnly] = useState(initialActiveOnly);

  const monthOptions = useMemo(
    () => buildMonthOptions(yearMonthInStoreTimezone()),
    []
  );

  const filteredRows = useMemo(() => {
    return report.rows.filter((row) => {
      if (customerId && row.customerId !== customerId) return false;
      if (activeOnly && !row.isActive) return false;
      return true;
    });
  }, [report.rows, customerId, activeOnly]);

  const filteredTotals = useMemo(() => {
    return {
      currentMonthPaid: filteredRows.reduce((s, r) => s + r.currentMonthPaid, 0),
      previousMonthPaid: filteredRows.reduce((s, r) => s + r.previousMonthPaid, 0),
      unpaidTotal: filteredRows.reduce((s, r) => s + r.unpaidOrderTotal, 0),
    };
  }, [filteredRows]);

  const applyMonth = (month: string) => {
    const params = new URLSearchParams();
    params.set('month', month);
    if (customerId) params.set('customer', customerId);
    if (activeOnly) params.set('active', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="b2b-report-filters flex flex-col gap-3 rounded-xl border border-border bg-cream/50 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-muted">
            {t('b2bReportFilterMonth')}
          </label>
          <select
            className="input-field w-full"
            value={report.currentMonth}
            onChange={(e) => applyMonth(e.target.value)}
          >
            {monthOptions.map((ym) => (
              <option key={ym} value={ym}>
                {formatMonthLabel(ym, locale)}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px] flex-[2]">
          <label className="mb-1 block text-xs font-medium text-muted">
            {t('b2bReportFilterCustomer')}
          </label>
          <select
            className="input-field w-full"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">{t('b2bReportFilterAllCustomers')}</option>
            {report.rows.map((row) => (
              <option key={row.customerId} value={row.customerId}>
                {row.companyName}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          {t('b2bReportFilterActiveOnly')}
        </label>

        <button type="button" className="btn-primary shrink-0" onClick={handlePrint}>
          {t('b2bReportPrint')}
        </button>
      </div>

      <div className="b2b-report-print-root space-y-6">
        <div className="b2b-report-print-header hidden print:block">
          <h1 className="text-xl font-bold">{t('b2bReportPrintTitle')}</h1>
          <p className="text-sm">
            {formatMonthLabel(report.currentMonth, locale)} ·{' '}
            {new Date().toLocaleString(dateLocale)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="luxury-card p-4">
            <p className="text-xs text-muted">{t('b2bReportCurrentPaid')}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums">
              {formatPrice(filteredTotals.currentMonthPaid)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {formatMonthLabel(report.currentMonth, locale)}
            </p>
          </div>
          <div className="luxury-card p-4">
            <p className="text-xs text-muted">{t('b2bReportPrevPaid')}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums">
              {formatPrice(filteredTotals.previousMonthPaid)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {formatMonthLabel(report.previousMonth, locale)}
            </p>
          </div>
          <div className="luxury-card p-4">
            <p className="text-xs text-muted">{t('b2bReportUnpaid')}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-amber-800">
              {formatPrice(filteredTotals.unpaidTotal)}
            </p>
            <p className="mt-1 text-xs text-muted">{t('b2bReportUnpaidHint')}</p>
          </div>
        </div>

        <div className="b2b-report-rules rounded-xl border border-border bg-pistachio-soft/40 px-4 py-3 text-sm text-muted print:border print:bg-transparent">
          {t('b2bReportRules', {
            t3: formatPrice(B2B_DISCOUNT_TIER_3_THRESHOLD),
            t6: formatPrice(B2B_DISCOUNT_TIER_6_THRESHOLD),
          })}
        </div>

        {filteredRows.length === 0 ? (
          <p className="text-sm text-muted">
            {report.rows.length === 0 ? t('b2bNoCustomers') : t('b2bReportNoMatch')}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border print:overflow-visible">
            <table className="w-full min-w-[720px] text-left text-sm print:min-w-0">
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
                {filteredRows.map((row) => (
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

        <p className="text-xs text-muted print:mt-4">
          {t('b2bReportUpdated', {
            time: new Date().toLocaleString(dateLocale),
          })}
        </p>
      </div>
    </div>
  );
}
