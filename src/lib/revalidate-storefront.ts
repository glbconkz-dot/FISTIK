import { revalidatePath } from 'next/cache';
import { routing } from '@/i18n/routing';

/** Admin degisikliklerinden sonra canli siteyi yenile */
export function revalidateStorefront() {
  revalidatePath('/', 'layout');
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
  }
}