/** Products that must show the full photo without cropping (object-contain). */
const CONTAIN_FIT_SLUGS = new Set([
  'semi-waffle',
  'art-hamburger',
  'cake-medovik',
  'cake-snickers',
  'cake-chocolate',
  'cake-milk-girl',
  'cake-pistachio-raspberry',
  'cake-red-velvet',
  /** Pişmiş tekli börek — tabak fotoğrafları kırpılmadan ortalansın */
  'borek-meat',
  'borek-spinach',
]);

const CONTAIN_PATH_HINTS = [
  '/eclairs/mini/',
  '/semi-finished/waffle',
  '/art-desserts/hamburger',
  '/classic-cakes/',
];

/** object-position overrides when cover-cropping still needed */
const OBJECT_POSITION: Record<string, string> = {
  'borek-meat': 'object-[42%_48%]',
};

export function shouldContainProductImage(slug: string, imageUrl?: string): boolean {
  if (CONTAIN_FIT_SLUGS.has(slug)) return true;
  if (!imageUrl) return false;
  return CONTAIN_PATH_HINTS.some((hint) => imageUrl.includes(hint));
}

export function getProductImageClasses(slug: string, imageUrl?: string) {
  const contain = shouldContainProductImage(slug, imageUrl);
  const position = OBJECT_POSITION[slug] ?? 'object-center';

  return {
    container: contain ? 'bg-[#c9b090]' : 'bg-cream',
    /** Inset frame — padding on fill images breaks Next/Image layout */
    frame: contain ? 'absolute inset-3 sm:inset-5' : 'absolute inset-0',
    image: contain ? `object-contain ${position}` : `object-cover ${position}`,
    imageCard: contain
      ? `object-contain ${position} transition-transform duration-500 group-hover:scale-[1.02]`
      : `object-cover ${position} transition-transform duration-500 group-hover:scale-105`,
  };
}
