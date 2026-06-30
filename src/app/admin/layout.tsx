import '../globals.css';
import { AdminLocaleProvider } from '@/components/admin/AdminLocaleProvider';
import { getAdminLocale } from '@/lib/admin-locale';

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getAdminLocale();

  return <AdminLocaleProvider locale={locale}>{children}</AdminLocaleProvider>;
}
