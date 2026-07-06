import { getTranslations, setRequestLocale } from 'next-intl/server';
import { requireB2BCustomerSession } from '@/lib/b2b/customer';
import { listB2BCustomerOrders } from '@/lib/b2b/orders';
import { B2BOrdersList } from '@/components/b2b/B2BOrdersList';

export default async function B2BOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customer = await requireB2BCustomerSession(locale);
  const t = await getTranslations('b2b.orders');

  const orders = await listB2BCustomerOrders(customer.id);

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-semibold sm:text-3xl">{t('title')}</h1>
      <p className="mb-6 text-sm text-muted">{t('subtitle', { company: customer.company_name })}</p>
      <B2BOrdersList orders={orders} />
    </div>
  );
}
