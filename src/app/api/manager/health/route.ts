import { jsonWithCors, managerOptionsResponse } from '@/lib/manager-api-cors';
import { tryCreateServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function OPTIONS() {
  return managerOptionsResponse();
}

/** GET /api/manager/health — TestFlight / deploy kontrol (secret gerekmez) */
export async function GET() {
  const hasSecret = Boolean(process.env.MANAGER_APP_SECRET?.trim());
  const supabase = tryCreateServiceClient();
  let activeDevices: number | null = null;
  let tableOk = false;

  if (supabase) {
    const { count, error } = await supabase
      .from('admin_device_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    tableOk = !error;
    if (!error) activeDevices = count ?? 0;
  }

  return jsonWithCors({
    ok: true,
    service: 'fistik-manager',
    hasSecret,
    hasServiceRole: Boolean(supabase),
    tableOk,
    activeDevices,
    ts: new Date().toISOString(),
  });
}
