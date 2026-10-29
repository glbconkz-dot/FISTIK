import { NextResponse } from 'next/server';
import { createClient, getAdminUser } from '@/lib/supabase/server';
import { enrichAdminOrders } from '@/lib/admin/orders-query';
import type { Order } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const [enriched] = await enrichAdminOrders([data as Order]);
  return NextResponse.json({ order: enriched });
}
