import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { CATALOG_REVALIDATE_SECONDS } from '@/lib/cache-config';
import { getCatalogData } from '@/lib/catalog';
import { excludeDrinksFromB2BCatalog } from '@/lib/coffee';
import { tryCreateServiceClient } from '@/lib/supabase/service';
import type { Product } from '@/types';

async function loadB2BPriceMap(): Promise<Map<string, number>> {
  const supabase = tryCreateServiceClient();
  if (!supabase) return new Map();

  const { data, error } = await supabase.from('b2b_product_prices').select('product_id, price');

  if (error) {
    console.error('[b2b-catalog] prices:', error.message);
    return new Map();
  }

  return new Map(
    (data ?? []).map((row) => [row.product_id as string, Number(row.price)])
  );
}

function applyB2BPrices(products: Product[], priceMap: Map<string, number>): Product[] {
  return products.map((product) => {
    const b2bPrice = priceMap.get(product.id);
    if (b2bPrice == null) return product;
    return { ...product, price: b2bPrice };
  });
}

async function loadB2BCatalogData() {
  const catalog = await getCatalogData();
  const priceMap = await loadB2BPriceMap();
  const withoutDrinks = excludeDrinksFromB2BCatalog(catalog);

  return {
    ...withoutDrinks,
    products: applyB2BPrices(withoutDrinks.products, priceMap),
  };
}

const getCachedB2BCatalogData = unstable_cache(loadB2BCatalogData, ['fistik-b2b-catalog'], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ['b2b-catalog', 'catalog'],
});

export async function getB2BCatalogData() {
  return getCachedB2BCatalogData();
}

export function revalidateB2BCatalog() {
  revalidateTag('b2b-catalog', 'max');
}
