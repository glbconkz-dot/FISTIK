import { requireB2BCustomerLogin } from '@/lib/b2b/customer';
import { b2bContractFileExists } from '@/lib/b2b/contract';
import { B2BTermsClient } from '@/components/b2b/B2BTermsClient';
import type { Locale } from '@/types';

export default async function B2BTermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const customer = await requireB2BCustomerLogin(locale);
  const hasWordContract = b2bContractFileExists(typedLocale);
  const mode = customer.terms_accepted_at ? 'view' : 'accept';

  return (
    <B2BTermsClient
      locale={typedLocale}
      companyName={customer.company_name}
      mode={mode}
      hasWordContract={hasWordContract}
      termsAcceptedAt={customer.terms_accepted_at}
    />
  );
}
