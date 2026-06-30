import { getCatalogData } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const data = await getCatalogData();

  return Response.json(data, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}
