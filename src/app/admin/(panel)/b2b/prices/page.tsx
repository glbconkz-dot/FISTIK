import { redirect } from 'next/navigation';
import { getCatalogData } from '@/lib/catalog';
import { applyProductAssets } from '@/data/product-assets';
import { isB2BAdminGateOpen } from '@/app/actions/b2b-admin';
import { listProductsForB2BPricing } from '@/app/actions/b2b-prices';
import { B2BAdminGate } from '@/components/admin/B2BAdminGate';
import { B2BAdminNav } from '@/components/admin/B2BAdminNav';
import { B2BPriceList } from '@/components/admin/B2BPriceList';
import { getAdminMessages, resolveAdminLocale } from '@/lib/admin-messages';
import { cookies } from 'next/headers';

export default async function AdminB2BPricesPage() {
  const gateOpen = await isB2BAdminGateOpen();
  if (!gateOpen) {
    redirect('/admin/b2b');
  }

  const cookieStore = await cookies();
  const locale = resolveAdminLocale(cookieStore.get('admin_locale')?.value);
  const t = getAdminMessages(locale);

  const [{ products, b2bPrices }, catalog] = await Promise.all([
    listProductsForB2BPricing(),
    getCatalogData(),
  ]);

  const retailById = new Map(catalog.products.map((p) => [p.id, p.price]));
  const productsWithAssets = applyProductAssets(products, catalog.categories);
  const productsWithRetail = productsWithAssets.map((p) => ({
    ...p,
    price: retailById.get(p.id) ?? p.price,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t.b2bPricesTitle}</h1>
      <p className="mt-1 text-sm text-muted">{t.b2bPricesSubtitle}</p>
      <div className="mt-4">
        <B2BAdminNav />
      </div>
      <div className="mt-2">
        <B2BPriceList
          products={productsWithRetail}
          categories={catalog.categories}
          b2bPrices={b2bPrices}
        />
      </div>
    </div>
  );
}
