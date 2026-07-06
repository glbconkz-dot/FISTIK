import { getTranslations, setRequestLocale } from 'next-intl/server';
import { requireB2BCustomerSession } from '@/lib/b2b/customer';
import { B2BCheckoutForm } from '@/components/b2b/B2BCheckoutForm';
import type { Locale } from '@/types';

export default async function B2BCheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customer = await requireB2BCustomerSession(locale);
  const t = await getTranslations('b2b.checkout');

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold sm:text-3xl">{t('title')}</h1>
      <B2BCheckoutForm customer={customer} locale={locale as Locale} />
    </div>
  );
}
