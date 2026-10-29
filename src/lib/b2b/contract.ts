import type { Locale } from '@/types';

/** Word sözleşmeleri: public/b2b/contracts/fistik-b2b-{locale}.docx (client-safe) */
export function getB2BContractFileName(locale: Locale): string {
  return `fistik-b2b-${locale}.docx`;
}

export function getB2BContractPublicUrl(locale: Locale): string {
  return `/b2b/contracts/${getB2BContractFileName(locale)}`;
}
