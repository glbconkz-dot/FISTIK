import fs from 'fs';
import path from 'path';
import type { Locale } from '@/types';

/** Word sözleşmeleri: public/b2b/contracts/fistik-b2b-{locale}.docx */
export function getB2BContractFileName(locale: Locale): string {
  return `fistik-b2b-${locale}.docx`;
}

export function getB2BContractPublicUrl(locale: Locale): string {
  return `/b2b/contracts/${getB2BContractFileName(locale)}`;
}

export function getB2BContractFsPath(locale: Locale): string {
  return path.join(process.cwd(), 'public', 'b2b', 'contracts', getB2BContractFileName(locale));
}

export function b2bContractFileExists(locale: Locale): boolean {
  try {
    return fs.existsSync(getB2BContractFsPath(locale));
  } catch {
    return false;
  }
}
