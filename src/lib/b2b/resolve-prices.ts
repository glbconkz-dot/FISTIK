import { tryCreateServiceClient } from '@/lib/supabase/service';
import { getCatalogData } from '@/lib/catalog';
import type { CartItem } from '@/types';

export async function resolveB2BCartItems(
  items: CartItem[]
): Promise<{ items: CartItem[]; error?: string }> {
  if (items.length === 0) {
    return { items: [], error: 'cartEmpty' };
  }

  const supabase = tryCreateServiceClient();
  const catalog = await getCatalogData();
  const retailById = new Map(catalog.products.map((p) => [p.id, Number(p.price)]));

  let b2bById = new Map<string, number>();
  if (supabase) {
    const ids = items.map((i) => i.productId).filter(Boolean);
    const { data } = await supabase
      .from('b2b_product_prices')
      .select('product_id, price')
      .in('product_id', ids);

    b2bById = new Map((data ?? []).map((row) => [row.product_id as string, Number(row.price)]));
  }

  const resolved: CartItem[] = [];

  for (const item of items) {
    const retail = retailById.get(item.productId);
    if (retail == null) {
      return { items: [], error: 'productUnavailable' };
    }

    const serverPrice = b2bById.get(item.productId) ?? retail;
    resolved.push({
      ...item,
      price: serverPrice,
    });
  }

  return { items: resolved };
}
