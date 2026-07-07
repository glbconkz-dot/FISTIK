/** Products with flat/white backgrounds — show full image without cropping */
const CONTAIN_FIT_SLUGS = new Set(['semi-waffle', 'art-hamburger']);

export function getProductImageClasses(slug: string, imageUrl?: string) {
  const contain =
    CONTAIN_FIT_SLUGS.has(slug) ||
    imageUrl?.includes('/semi-finished/waffle') ||
    imageUrl?.includes('/art-desserts/hamburger');

  return {
    container: contain ? 'bg-white' : 'bg-cream',
    /** Inset frame — padding on fill images breaks Next/Image layout */
    frame: contain ? 'absolute inset-4 sm:inset-6' : 'absolute inset-0',
    image: contain ? 'object-contain' : 'object-cover',
    imageCard: contain
      ? 'object-contain transition-transform duration-500 group-hover:scale-[1.02]'
      : 'object-cover transition-transform duration-500 group-hover:scale-105',
  };
}
