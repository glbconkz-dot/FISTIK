/** Products that must show the full photo without cropping (object-contain). */
const CONTAIN_FIT_SLUGS = new Set([
  'semi-waffle',
  'art-hamburger',
  'cake-medovik',
  'cake-snickers',
  'cake-chocolate',
  'cake-milk-girl',
  'cake-pistachio-raspberry',
]);

const CONTAIN_PATH_HINTS = [
  '/semi-finished/waffle',
  '/art-desserts/hamburger',
  '/classic-cakes/',
];

export function shouldContainProductImage(slug: string, imageUrl?: string): boolean {
  if (CONTAIN_FIT_SLUGS.has(slug)) return true;
  if (!imageUrl) return false;
  return CONTAIN_PATH_HINTS.some((hint) => imageUrl.includes(hint));
}

export function getProductImageClasses(slug: string, imageUrl?: string) {
  const contain = shouldContainProductImage(slug, imageUrl);

  return {
    container: contain ? 'bg-[#e8dcc8]' : 'bg-cream',
    /** Inset frame — padding on fill images breaks Next/Image layout */
    frame: contain ? 'absolute inset-3 sm:inset-5' : 'absolute inset-0',
    image: contain ? 'object-contain' : 'object-cover',
    imageCard: contain
      ? 'object-contain transition-transform duration-500 group-hover:scale-[1.02]'
      : 'object-cover transition-transform duration-500 group-hover:scale-105',
  };
}
