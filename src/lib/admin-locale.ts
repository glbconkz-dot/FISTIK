import { cookies } from 'next/headers';
import {
  ADMIN_LOCALE_COOKIE,
  resolveAdminLocale,
  type AdminLocale,
} from '@/lib/admin-messages';

export async function getAdminLocale(): Promise<AdminLocale> {
  const cookieStore = await cookies();
  return resolveAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
}
