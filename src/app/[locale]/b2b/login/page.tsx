import { redirect } from '@/i18n/routing';
import { getB2BCustomerSession } from '@/lib/b2b/customer';
import { B2BLoginClient } from '@/components/b2b/B2BLoginClient';
import type { Locale } from '@/types';

export default async function B2BLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const customer = await getB2BCustomerSession();

  if (customer) {
    if (!customer.terms_accepted_at) {
      redirect({ href: '/b2b/terms', locale });
    }
    redirect({ href: '/b2b/menu', locale });
  }

  return <B2BLoginClient locale={locale as Locale} />;
}
