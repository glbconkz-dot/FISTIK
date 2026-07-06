import { redirect } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getB2BCustomerSession } from '@/lib/b2b/customer';
import { B2BCheckoutForm } from '@/components/b2b/B2BCheckoutForm';
import type { Locale } from '@/types';

export default async function B2BCheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customer = await getB2BCustomerSession();
  const t = await getTranslations('b2b.checkout');

  if (!customer) {
    redirect({ href: '/b2b/login', locale });
  }

  if (!customer.terms_accepted_at) {
    redirect({ href: '/b2b/terms', locale });
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold sm:text-3xl">{t('title')}</h1>
      <B2BCheckoutForm customer={customer} locale={locale as Locale} />
    </div>
  );
}
