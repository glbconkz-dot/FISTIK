/** Unique product gallery: primary first, then extras. Works with 1–3 images. */
export function getProductGallery(product: {
  image_url?: string | null;
  image_urls?: string[] | null;
}): string[] {
  const urls = [product.image_url, ...(product.image_urls ?? [])]
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter(Boolean);
  return [...new Set(urls)];
}
