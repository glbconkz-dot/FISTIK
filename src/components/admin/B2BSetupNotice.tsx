import { checkB2BSchemaReady } from '@/lib/b2b/health';
import { getAdminMessages, resolveAdminLocale } from '@/lib/admin-messages';
import { cookies } from 'next/headers';

export async function B2BSetupNotice() {
  const health = await checkB2BSchemaReady();
  if (health.ok) return null;

  const cookieStore = await cookies();
  const locale = resolveAdminLocale(cookieStore.get('admin_locale')?.value);
  const t = getAdminMessages(locale);

  const message =
    health.reason === 'noServiceRole'
      ? t.b2bHealthNoServiceRole
      : health.reason === 'schemaMissing'
        ? t.b2bHealthSchemaMissing
        : t.b2bHealthUnknown;

  return (
    <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
      <p className="font-semibold">{t.b2bHealthTitle}</p>
      <p className="mt-1">{message}</p>
      {health.detail && process.env.NODE_ENV === 'development' ? (
        <p className="mt-2 font-mono text-xs opacity-80">{health.detail}</p>
      ) : null}
      <p className="mt-2 text-xs">{t.b2bHealthSqlHint}</p>
    </div>
  );
}
