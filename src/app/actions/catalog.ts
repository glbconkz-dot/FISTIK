'use server';

import { getCatalogData } from '@/lib/catalog';
import type { Category, Product, StorefrontSection } from '@/types';

export async function fetchLiveCatalog(): Promise<{
  products: Product[];
  categories: Category[];
  storefrontSections: StorefrontSection[];
  storefrontError: string | null;
  source: string;
}> {
  const data = await getCatalogData();
  return {
    products: data.products,
    categories: data.categories,
    storefrontSections: data.storefrontSections,
    storefrontError: data.storefrontError,
    source: data.source,
  };
}
