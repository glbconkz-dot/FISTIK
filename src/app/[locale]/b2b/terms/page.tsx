import { redirect } from '@/i18n/routing';
import { getB2BCustomerSession } from '@/lib/b2b/customer';
import { B2BTermsClient } from '@/components/b2b/B2BTermsClient';
import type { Locale } from '@/types';

export default async function B2BTermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const customer = await getB2BCustomerSession();

  if (!customer) {
    redirect({ href: '/b2b/login', locale });
  }

  if (customer.terms_accepted_at) {
    redirect({ href: '/b2b/menu', locale });
  }

  return <B2BTermsClient locale={locale as Locale} companyName={customer.company_name} />;
}
