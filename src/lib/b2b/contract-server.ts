import fs from 'fs';
import path from 'path';
import { getB2BContractFileName } from '@/lib/b2b/contract';
import type { Locale } from '@/types';

/** Sadece sunucuda: Word sözleşme dosyası diskte var mı? */
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
