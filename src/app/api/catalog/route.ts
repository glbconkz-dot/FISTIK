import { getCatalogData } from '@/lib/catalog';
import { CATALOG_CACHE_CONTROL } from '@/lib/cache-config';

export const revalidate = 60;

export async function GET() {
  const data = await getCatalogData();

  return Response.json(
    {
      ...data,
      _meta: {
        configuredSections: data.storefrontSections.filter(
          (s) => (s.product_slugs?.length ?? 0) > 0 || (s.product_ids?.length ?? 0) > 0
        ).length,
        storefrontError: data.storefrontError,
        fetchedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        'Cache-Control': CATALOG_CACHE_CONTROL,
      },
    }
  );
}
