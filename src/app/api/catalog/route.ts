import { getCatalogData } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    }
  );
}
