/** Public storefront ISR — admin edits bust cache via revalidateTag('catalog') */
export const CATALOG_REVALIDATE_SECONDS = 60;

export const CATALOG_CACHE_CONTROL =
  `public, s-maxage=${CATALOG_REVALIDATE_SECONDS}, stale-while-revalidate=300`;
