import type { Locale } from '@/types';

export const HERO_CAROUSEL_SLIDES: {
  src: string;
  captions: Record<Locale, string>;
}[] = [
  {
    src: '/products/eclairs/pistachio.png',
    captions: {
      kk: 'Фисташка эклер',
      tr: 'Fıstıklı Ekler',
      ru: 'Фисташковый эклер',
      en: 'Pistachio Eclair',
    },
  },
  {
    src: '/products/eclairs/strawberry.png',
    captions: {
      kk: 'Құлпынай эклер',
      tr: 'Çilekli Ekler',
      ru: 'Клубничный эклер',
      en: 'Strawberry Eclair',
    },
  },
  {
    src: '/products/eclairs/hazelnut.png',
    captions: {
      kk: 'Жаңғақ эклер',
      tr: 'Fındıklı Ekler',
      ru: 'Фундучный эклер',
      en: 'Hazelnut Eclair',
    },
  },
  {
    src: '/products/eclairs/raspberry.png',
    captions: {
      kk: 'Таңқурай эклер',
      tr: 'Ahududulu Ekler',
      ru: 'Малиновый эклер',
      en: 'Raspberry Eclair',
    },
  },
  {
    src: '/products/cherry-brownie.png',
    captions: {
      kk: 'Cherry Cube',
      tr: 'Cherry Cube',
      ru: 'Cherry Cube',
      en: 'Cherry Cube',
    },
  },
  {
    src: '/products/pistachio-raspberry.png',
    captions: {
      kk: 'Pistachio Cube',
      tr: 'Pistachio Cube',
      ru: 'Pistachio Cube',
      en: 'Pistachio Cube',
    },
  },
  {
    src: '/products/oreo-dessert.png',
    captions: {
      kk: 'Oreo Cube',
      tr: 'Oreo Cube',
      ru: 'Oreo Cube',
      en: 'Oreo Cube',
    },
  },
  {
    src: '/products/eclairs/vanilla.png',
    captions: {
      kk: 'Ваниль эклер',
      tr: 'Vanilyalı Ekler',
      ru: 'Ванильный эклер',
      en: 'Vanilla Eclair',
    },
  },
];

/** @deprecated use HERO_CAROUSEL_SLIDES */
export const HERO_SWEETS = HERO_CAROUSEL_SLIDES.map((s) => ({
  src: s.src,
  alt: s.captions.en,
}));

export function pickRandomHeroSweet() {
  const index = Math.floor(Math.random() * HERO_SWEETS.length);
  return HERO_SWEETS[index];
}
