import { isB2BAdminGateOpen, listB2BCustomers } from '@/app/actions/b2b-admin';
import { B2BAdminGate } from '@/components/admin/B2BAdminGate';
import { B2BAdminNav } from '@/components/admin/B2BAdminNav';
import { B2BCustomerList } from '@/components/admin/B2BCustomerList';
import { B2BSetupNotice } from '@/components/admin/B2BSetupNotice';
import { getAdminMessages, resolveAdminLocale } from '@/lib/admin-messages';
import { cookies } from 'next/headers';

export default async function AdminB2BPage() {
  const cookieStore = await cookies();
  const locale = resolveAdminLocale(cookieStore.get('admin_locale')?.value);
  const t = getAdminMessages(locale);
  const gateOpen = await isB2BAdminGateOpen();
  const customers = gateOpen ? await listB2BCustomers() : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t.b2bTitle}</h1>
      <p className="mt-1 text-sm text-muted">{t.b2bSubtitle}</p>

      <div className="mt-4">
        <B2BSetupNotice />
      </div>

      {gateOpen ? <div className="mt-4"><B2BAdminNav /></div> : null}

      <div className="mt-6">
        {!gateOpen ? (
          <B2BAdminGate />
        ) : (
          <B2BCustomerList customers={customers} />
        )}
      </div>
    </div>
  );
}
