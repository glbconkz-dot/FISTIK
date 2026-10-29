import { isB2BAdminGateOpen } from '@/app/actions/b2b-admin';
import { B2BAdminGate } from '@/components/admin/B2BAdminGate';
import { B2BAdminNav } from '@/components/admin/B2BAdminNav';
import { B2BMonthlyReportTable } from '@/components/admin/B2BMonthlyReportTable';
import { B2BSetupNotice } from '@/components/admin/B2BSetupNotice';
import { buildB2BMonthlyReport } from '@/lib/b2b/monthly-report';
import { yearMonthInStoreTimezone } from '@/lib/b2b/monthly-stats';
import { getAdminMessages, resolveAdminLocale } from '@/lib/admin-messages';
import { cookies } from 'next/headers';

interface PageProps {
  searchParams: Promise<{ month?: string; customer?: string; active?: string }>;
}

function isValidYearMonth(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}$/.test(value));
}

export default async function AdminB2BReportsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const locale = resolveAdminLocale(cookieStore.get('admin_locale')?.value);
  const t = getAdminMessages(locale);
  const params = await searchParams;
  const month = isValidYearMonth(params.month) ? params.month : yearMonthInStoreTimezone();
  const customerId = params.customer?.trim() || '';
  const activeOnly = params.active === '1';

  const gateOpen = await isB2BAdminGateOpen();
  const report = gateOpen ? await buildB2BMonthlyReport(month) : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold print:hidden">{t.b2bReportTitle}</h1>
      <p className="mt-1 text-sm text-muted print:hidden">{t.b2bReportSubtitle}</p>

      <div className="mt-4 print:hidden">
        <B2BSetupNotice />
      </div>

      {gateOpen ? (
        <div className="mt-4 print:hidden">
          <B2BAdminNav />
        </div>
      ) : null}

      <div className="mt-6">
        {!gateOpen ? (
          <B2BAdminGate />
        ) : report ? (
          <B2BMonthlyReportTable
            report={report}
            initialCustomerId={customerId}
            initialActiveOnly={activeOnly}
          />
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t.b2bReportLoadFailed}
          </p>
        )}
      </div>
    </div>
  );
}
