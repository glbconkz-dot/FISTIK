import { tryCreateServiceClient } from '@/lib/supabase/service';
import { isValidManagerAppSecret } from '@/lib/manager-push';
import { jsonWithCors, managerOptionsResponse } from '@/lib/manager-api-cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function OPTIONS() {
  return managerOptionsResponse();
}

/** GET /api/manager/orders — son siparişler (yönetici app) */
export async function GET(request: Request) {
  if (!isValidManagerAppSecret(request.headers.get('authorization'))) {
    return jsonWithCors({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = tryCreateServiceClient();
  if (!supabase) {
    return jsonWithCors({ error: 'setup' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(5, Number(searchParams.get('limit') ?? 30) || 30));

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, customer_name, phone, total, status, created_at, confirmed_at, order_channel, payment_status, delivery_date, delivery_time, address, notes'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('manager orders:', error.message);
    return jsonWithCors({ error: 'loadFailed', detail: error.message }, { status: 500 });
  }

  return jsonWithCors({
    orders: data ?? [],
    adminUrl: 'https://fistik.kz/admin/orders',
  });
}
