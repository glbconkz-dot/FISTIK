'use server';

import { getCatalogData } from '@/lib/catalog';
import type { Category, Product } from '@/types';

export async function fetchLiveCatalog(): Promise<{
  products: Product[];
  categories: Category[];
  source: string;
}> {
  const data = await getCatalogData();
  return {
    products: data.products,
    categories: data.categories,
    source: data.source,
  };
}
