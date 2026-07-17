import { revalidatePath, revalidateTag } from 'next/cache';
import { routing } from '@/i18n/routing';

/** Admin degisikliklerinden sonra canli siteyi yenile */
export function revalidateStorefront() {
  revalidateTag('catalog', 'max');
  revalidateTag('b2b-catalog', 'max');
  revalidatePath('/', 'layout');
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/menu`);
    revalidatePath(`/${locale}/product`, 'layout');
    revalidatePath(`/${locale}/coffee`);
    revalidatePath(`/${locale}/classic-coffee`);
    revalidatePath(`/${locale}/iced-coffee`);
    revalidatePath(`/${locale}/chocolate`);
    revalidatePath(`/${locale}/drinks`);
  }
}
