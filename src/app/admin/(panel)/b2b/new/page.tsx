import { redirect } from 'next/navigation';
import { isB2BAdminGateOpen } from '@/app/actions/b2b-admin';
import { B2BAdminNav } from '@/components/admin/B2BAdminNav';
import { B2BCustomerForm } from '@/components/admin/B2BCustomerForm';
import { B2BSetupNotice } from '@/components/admin/B2BSetupNotice';

export default async function AdminB2BNewCustomerPage() {
  const gateOpen = await isB2BAdminGateOpen();
  if (!gateOpen) {
    redirect('/admin/b2b');
  }

  return (
    <div>
      <B2BSetupNotice />
      <B2BAdminNav />
      <div className="mt-4">
        <B2BCustomerForm />
      </div>
    </div>
  );
}
