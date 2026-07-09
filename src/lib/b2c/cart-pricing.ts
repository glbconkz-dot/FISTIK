import { applyClearanceToProduct, getEffectivePrice } from '@/lib/b2c/clearance';
import type { CartItem, ClearanceRule } from '@/types';

export function applyClearancePricesToCartItems(
  items: CartItem[],
  productsBySlug: Map<string, { price: number }>,
  rules: ClearanceRule[]
): CartItem[] {
  const rulesBySlug = new Map(rules.filter((r) => r.is_active).map((r) => [r.product_slug, r]));

  return items.map((item) => {
    const base = productsBySlug.get(item.slug);
    if (!base) return item;

    const rule = rulesBySlug.get(item.slug);
    const product = applyClearanceToProduct(
      {
        id: item.productId,
        slug: item.slug,
        category_id: null,
        name_ru: '',
        name_kk: '',
        name_tr: '',
        name_en: '',
        description_ru: '',
        description_kk: '',
        description_tr: '',
        description_en: '',
        price: base.price,
        image_url: '',
        is_active: true,
        stock_quantity: 0,
        sort_order: 0,
        created_at: '',
      },
      rule
    );

    return { ...item, price: getEffectivePrice(product) };
  });
}
