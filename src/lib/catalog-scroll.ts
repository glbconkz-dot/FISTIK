/** Sticky header altında ürün grid’ine sabitle */
export const CATALOG_PRODUCTS_ID = 'all-products';

export function scrollToCatalogProducts(): void {
  const el = document.getElementById(CATALOG_PRODUCTS_ID);
  if (!el) return;
  el.scrollIntoView({ block: 'start', behavior: 'instant' });
}
