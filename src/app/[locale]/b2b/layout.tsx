import { getB2BCustomerSession } from '@/lib/b2b/customer';
import { B2BHeader } from '@/components/b2b/B2BHeader';
import { B2BCartBar } from '@/components/b2b/B2BCartBar';
import type { Locale } from '@/types';

export default async function B2BLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const customer = await getB2BCustomerSession();

  return (
    <>
      <B2BHeader customer={customer} locale={locale as Locale} />
      <div className="mx-auto max-w-6xl px-4 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:py-8 sm:pb-28">
        {children}
      </div>
      <B2BCartBar />
    </>
  );
}
