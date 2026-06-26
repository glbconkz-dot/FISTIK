export const HERO_SWEETS = [
  { src: '/products/eclairs/pistachio.png', alt: 'Pistachio Eclair' },
  { src: '/products/eclairs/strawberry.png', alt: 'Strawberry Eclair' },
  { src: '/products/eclairs/hazelnut.png', alt: 'Hazelnut Eclair' },
  { src: '/products/eclairs/raspberry.png', alt: 'Raspberry Eclair' },
  { src: '/products/cherry-brownie.png', alt: 'Cherry Brownie' },
  { src: '/products/oreo-dessert.png', alt: 'Oreo' },
  { src: '/products/pistachio-raspberry.png', alt: 'Pistachio Raspberry' },
  { src: '/products/eclairs/vanilla.png', alt: 'Vanilla Eclair' },
] as const;

export function pickRandomHeroSweet() {
  const index = Math.floor(Math.random() * HERO_SWEETS.length);
  return HERO_SWEETS[index];
}
