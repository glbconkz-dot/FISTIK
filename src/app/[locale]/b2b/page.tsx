import { redirect } from '@/i18n/routing';
import { getB2BCustomerSession } from '@/lib/b2b/customer';

export default async function B2BIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const customer = await getB2BCustomerSession();

  if (!customer) {
    redirect({ href: '/b2b/login', locale });
  }

  if (!customer.terms_accepted_at) {
    redirect({ href: '/b2b/terms', locale });
  }

  redirect({ href: '/b2b/menu', locale });
}
