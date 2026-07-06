import { redirect } from '@/i18n/routing';
import { requireB2BCustomerLogin } from '@/lib/b2b/customer';
import { B2BTermsClient } from '@/components/b2b/B2BTermsClient';
import type { Locale } from '@/types';

export default async function B2BTermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const customer = await requireB2BCustomerLogin(locale);

  if (customer.terms_accepted_at) {
    redirect({ href: '/b2b/menu', locale });
  }

  return <B2BTermsClient locale={locale as Locale} companyName={customer.company_name} />;
}
