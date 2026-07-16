import { productInCategory } from '@/lib/category-utils';
import type { Category, Product } from '@/types';

/** B2C-only drink category slugs (pasta menüsünden ayrı) */
export const DRINKS_CATEGORY_SLUGS = [
  'coffee',
  'classic-coffee',
  'iced-coffee',
  'chocolate-series',
] as const;

export type DrinksCategorySlug = (typeof DRINKS_CATEGORY_SLUGS)[number];

/** Slug `coffee` = Fıstık Signature (özel latte’ler) */
export const COFFEE_CATEGORY_SLUG: DrinksCategorySlug = 'coffee';
export const CLASSIC_COFFEE_CATEGORY_SLUG: DrinksCategorySlug = 'classic-coffee';
export const ICED_COFFEE_CATEGORY_SLUG: DrinksCategorySlug = 'iced-coffee';
export const CHOCOLATE_SERIES_CATEGORY_SLUG: DrinksCategorySlug = 'chocolate-series';

export type DrinksHubSection = {
  key: string;
  categorySlug?: DrinksCategorySlug;
  href?: '/coffee' | '/classic-coffee' | '/iced-coffee' | '/chocolate';
  i18n: 'coffee' | 'classicCoffee' | 'icedCoffee' | 'chocolate' | 'tea' | 'otherDrinks';
  comingSoon?: boolean;
};

export const DRINKS_HUB_SECTIONS: DrinksHubSection[] = [
  { key: 'signature', categorySlug: 'coffee', href: '/coffee', i18n: 'coffee' },
  {
    key: 'classic',
    categorySlug: 'classic-coffee',
    href: '/classic-coffee',
    i18n: 'classicCoffee',
  },
  {
    key: 'iced',
    categorySlug: 'iced-coffee',
    href: '/iced-coffee',
    i18n: 'icedCoffee',
  },
  {
    key: 'chocolate',
    categorySlug: 'chocolate-series',
    href: '/chocolate',
    i18n: 'chocolate',
  },
  { key: 'tea', i18n: 'tea', comingSoon: true },
  { key: 'other', i18n: 'otherDrinks', comingSoon: true },
];

/** @deprecated use DRINKS_HUB_SECTIONS */
export const DRINKS_SECTIONS: {
  slug: DrinksCategorySlug;
  href: '/coffee' | '/classic-coffee' | '/iced-coffee' | '/chocolate';
}[] = [
  { slug: 'coffee', href: '/coffee' },
  { slug: 'classic-coffee', href: '/classic-coffee' },
  { slug: 'iced-coffee', href: '/iced-coffee' },
  { slug: 'chocolate-series', href: '/chocolate' },
];

export function isDrinksCategorySlug(slug: string): boolean {
  return (DRINKS_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

export function findDrinksCategory(
  categories: Category[],
  slug: DrinksCategorySlug
): Category | undefined {
  return categories.find((c) => c.slug === slug && c.is_active);
}

export function findCoffeeCategory(categories: Category[]): Category | undefined {
  return findDrinksCategory(categories, COFFEE_CATEGORY_SLUG);
}

export function findClassicCoffeeCategory(categories: Category[]): Category | undefined {
  return findDrinksCategory(categories, CLASSIC_COFFEE_CATEGORY_SLUG);
}

export function findIcedCoffeeCategory(categories: Category[]): Category | undefined {
  return findDrinksCategory(categories, ICED_COFFEE_CATEGORY_SLUG);
}

export function findChocolateSeriesCategory(categories: Category[]): Category | undefined {
  return findDrinksCategory(categories, CHOCOLATE_SERIES_CATEGORY_SLUG);
}

export function isDrinksProduct(product: Product, categories: Category[]): boolean {
  const joined = product.categories as Category | null | undefined;
  if (joined?.slug && isDrinksCategorySlug(joined.slug)) return true;

  const cat = categories.find(
    (c) => c.id === product.category_id || c.slug === product.category_id
  );
  if (cat && isDrinksCategorySlug(cat.slug)) return true;

  return typeof product.category_id === 'string' && isDrinksCategorySlug(product.category_id);
}

function isProductInSlug(
  product: Product,
  categories: Category[],
  slug: DrinksCategorySlug
): boolean {
  const joined = product.categories as Category | null | undefined;
  if (joined?.slug === slug) return true;

  const cat = findDrinksCategory(categories, slug);
  if (cat && productInCategory(product, cat)) return true;

  return product.category_id === slug;
}

export function isCoffeeProduct(product: Product, categories: Category[]): boolean {
  return isProductInSlug(product, categories, COFFEE_CATEGORY_SLUG);
}

export function isClassicCoffeeProduct(product: Product, categories: Category[]): boolean {
  return isProductInSlug(product, categories, CLASSIC_COFFEE_CATEGORY_SLUG);
}

export function isIcedCoffeeProduct(product: Product, categories: Category[]): boolean {
  return isProductInSlug(product, categories, ICED_COFFEE_CATEGORY_SLUG);
}

export function isChocolateSeriesProduct(product: Product, categories: Category[]): boolean {
  return isProductInSlug(product, categories, CHOCOLATE_SERIES_CATEGORY_SLUG);
}

export function getCoffeeProducts(products: Product[], categories: Category[]): Product[] {
  return products
    .filter((p) => isCoffeeProduct(p, categories))
    .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));
}

export function getClassicCoffeeProducts(
  products: Product[],
  categories: Category[]
): Product[] {
  return products
    .filter((p) => isClassicCoffeeProduct(p, categories))
    .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));
}

export function getIcedCoffeeProducts(
  products: Product[],
  categories: Category[]
): Product[] {
  return products
    .filter((p) => isIcedCoffeeProduct(p, categories))
    .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));
}

export function getChocolateSeriesProducts(
  products: Product[],
  categories: Category[]
): Product[] {
  return products
    .filter((p) => isChocolateSeriesProduct(p, categories))
    .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));
}

export function getDrinksSectionProducts(
  products: Product[],
  categories: Category[],
  slug: DrinksCategorySlug
): Product[] {
  if (slug === 'coffee') return getCoffeeProducts(products, categories);
  if (slug === 'classic-coffee') return getClassicCoffeeProducts(products, categories);
  if (slug === 'iced-coffee') return getIcedCoffeeProducts(products, categories);
  if (slug === 'chocolate-series') return getChocolateSeriesProducts(products, categories);
  return [];
}

export function excludeDrinksFromBakeryProducts(
  products: Product[],
  categories: Category[]
): Product[] {
  return products.filter((p) => !isDrinksProduct(p, categories));
}

export function excludeDrinksFromB2BCatalog<T extends { products: Product[]; categories: Category[] }>(
  catalog: T
): T {
  return {
    ...catalog,
    categories: catalog.categories.filter((c) => !isDrinksCategorySlug(c.slug)),
    products: catalog.products.filter((p) => !isDrinksProduct(p, catalog.categories)),
  };
}

/** @deprecated use excludeDrinksFromB2BCatalog */
export function excludeCoffeeFromB2BCatalog<T extends { products: Product[]; categories: Category[] }>(
  catalog: T
): T {
  return excludeDrinksFromB2BCatalog(catalog);
}
