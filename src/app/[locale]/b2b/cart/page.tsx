import { getTranslations, setRequestLocale } from 'next-intl/server';
import { requireB2BCustomerSession } from '@/lib/b2b/customer';
import { B2BCartContent } from '@/components/b2b/B2BCartContent';

export default async function B2BCartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireB2BCustomerSession(locale);
  const t = await getTranslations('b2b.cart');

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold">{t('title')}</h1>
      <B2BCartContent />
    </div>
  );
}
