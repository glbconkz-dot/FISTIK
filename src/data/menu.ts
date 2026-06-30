import { applyProductAssets } from '@/data/product-assets';
import { CATEGORY_KK, CATEGORY_RU, CATEGORY_TR, PRODUCT_KK, PRODUCT_RU, PRODUCT_TR } from '@/data/menu-names';
import type { Category, Product } from '@/types';

export const PLACEHOLDER_IMAGE = '/product-placeholder.jpg';
export const DEFAULT_MENU_PRICE = 1500;

const desc = {
  en: 'Handcrafted fresh at Fistik bakery, Kaskelen.',
  ru: 'Свеже приготовлено в пекарне Fistik, Каскелен.',
  kk: 'Каскелендегі Fistik пекарнясында жаңа дайындалған.',
  tr: 'Kaskelen\'deki Fistik fırınında taze hazırlanır.',
};

function category(
  slug: string,
  name_en: string,
  name_ru: string,
  name_kk: string,
  name_tr: string,
  sort_order: number
): Category {
  return {
    id: slug,
    slug,
    name_en,
    name_ru,
    name_kk,
    name_tr,
    sort_order,
    is_active: true,
    created_at: '',
  };
}

function product(
  slug: string,
  categorySlug: string,
  name_en: string,
  name_ru: string,
  name_kk: string,
  sort_order: number,
  name_tr?: string,
  price = DEFAULT_MENU_PRICE
): Product {
  const tr = name_tr ?? PRODUCT_TR[slug] ?? name_en;
  const kkName = name_kk || PRODUCT_KK[slug] || name_en;
  return {
    id: slug,
    slug,
    category_id: categorySlug,
    name_en,
    name_ru,
    name_kk: kkName,
    name_tr: tr,
    description_en: desc.en,
    description_ru: desc.ru,
    description_kk: desc.kk,
    description_tr: desc.tr,
    price,
    image_url: PLACEHOLDER_IMAGE,
    is_active: true,
    stock_quantity: 0,
    sort_order,
    created_at: '',
  };
}

export const MENU_CATEGORIES: Category[] = [
  // Ekler en üstte → tatlı → tuzlu (samsa & borek en sonda)
  category('eclairs-large', 'Large Eclairs', 'Эклеры большие', 'Үлкен эклерлер', 'Büyük Ekler', 1),
  category('eclairs-mini', 'Mini Eclairs', 'Эклеры мини', 'Мини эклерлер', 'Mini Ekler', 2),
  category('packaged-desserts', 'Packaged Desserts', 'Десерты в упаковке', 'Қапталған десерттер', 'Paketli Tatlılar', 3),
  category('art-desserts', 'Art Desserts', 'Арт-десерты', 'Арт-десерттер', 'Sanat Tatlıları', 4),
  category('tarts', 'Tarts', 'Тарты', 'Тарттар', 'Tartlar', 5),
  category('american-cakes', 'American Cakes', 'Американские торты', 'Америкалық торттар', 'Amerikan Pastalar', 6),
  category('classic-round-cakes', 'Classic Round Cakes', 'Классические круглые торты', 'Классикалық дөңгелек торттар', 'Klasik Yuvarlak Pastalar', 7),
  category('pies', 'Pies', 'Пироги', 'Пирогтар', 'Turtalar', 8),
  category('cookies', 'Cookies', 'Печенье', 'Печеньелер', 'Kurabiyeler', 9),
  category('boreks', 'Boreks', 'Бореки', 'Боректер', 'Börekler', 10),
  category('samsa', 'Samsa', 'Самса', 'Самса', 'Samsa', 11),
  category('frozen-boreks', 'Frozen Boreks', 'Бореки полуфабрикаты', 'Борек жартылай дайын', 'Yarı Mamul Börekler', 12),
  category('semi-finished', 'Semi-finished Products', 'Полуфабрикаты', 'Жартылай дайын өнімдер', 'Yarı Mamul Ürünler', 13),
];

export const MENU_PRODUCTS: Product[] = [
  // Large Eclairs — 750 ₸
  product('eclair-large-pistachio', 'eclairs-large', 'Pistachio Eclair', 'Эклер фисташковый', 'Фисташка эклер', 1, undefined, 750),
  product('eclair-large-hazelnut', 'eclairs-large', 'Hazelnut Eclair', 'Эклер фундучный', 'Жаңғақ эклер', 2, undefined, 750),
  product('eclair-large-vanilla', 'eclairs-large', 'Vanilla Eclair', 'Эклер ванильный', 'Ваниль эклер', 3, undefined, 750),
  product('eclair-large-mastic', 'eclairs-large', 'Mastic Eclair', 'Эклер дамла сакызы', 'Damla sakız эклер', 4, undefined, 750),
  product('eclair-large-strawberry', 'eclairs-large', 'Strawberry Eclair', 'Эклер клубничный', 'Құлпынай эклер', 5, undefined, 750),
  product('eclair-large-raspberry', 'eclairs-large', 'Raspberry Eclair', 'Эклер малиновый', 'Таңқурай эклер', 6, undefined, 750),
  product('eclair-large-cherry', 'eclairs-large', 'Cherry Eclair', 'Эклер вишневый', 'Шие эклер', 7, undefined, 750),
  product('eclair-large-pineapple', 'eclairs-large', 'Pineapple Eclair', 'Эклер ананасовый', 'Ананас эклер', 8, undefined, 750),

  // Mini Eclairs — 450 ₸
  product('eclair-mini-pistachio', 'eclairs-mini', 'Mini Pistachio Eclair', 'Эклер мини фисташковый', 'Мини фисташка эклер', 1, undefined, 450),
  product('eclair-mini-hazelnut', 'eclairs-mini', 'Mini Hazelnut Eclair', 'Эклер мини фундучный', 'Мини жаңғақ эклер', 2, undefined, 450),
  product('eclair-mini-vanilla', 'eclairs-mini', 'Mini Vanilla Eclair', 'Эклер мини ванильный', 'Мини ваниль эклер', 3, undefined, 450),
  product('eclair-mini-mastic', 'eclairs-mini', 'Mini Mastic Eclair', 'Эклер мини дамла сакызы', 'Мини damla sakız эклер', 4, undefined, 450),
  product('eclair-mini-strawberry', 'eclairs-mini', 'Mini Strawberry Eclair', 'Эклер мини клубничный', 'Мини құлпынай эклер', 5, undefined, 450),
  product('eclair-mini-raspberry', 'eclairs-mini', 'Mini Raspberry Eclair', 'Эклер мини малиновый', 'Мини таңқурай эклер', 6, undefined, 450),
  product('eclair-mini-cherry', 'eclairs-mini', 'Mini Cherry Eclair', 'Эклер мини вишневый', 'Мини шие эклер', 7, undefined, 450),
  product('eclair-mini-pineapple', 'eclairs-mini', 'Mini Pineapple Eclair', 'Эклер мини ананасовый', 'Мини анanas эклер', 8, undefined, 450),

  // Cookies
  product('pistachio-cookies', 'cookies', 'Pistachio Cookies', 'Фисташковые cookies', 'Фисташка cookies', 1, undefined, 550),
  product('almond-kavala', 'cookies', 'Almond Kavala', 'Миндальные кавала', 'Миндаль kavala', 2, undefined, 1850),
  product('eskimo-dubai', 'cookies', 'Eskimo — Dubai Filling', 'Эскимо с дубайской начинкой', 'Эскимо — Dubai начинкасы', 3, undefined, 1100),
  product('eskimo-strawberry', 'cookies', 'Eskimo — Strawberry Filling', 'Эскимо с клубничной начинкой', 'Эскимо — Құлпынай начинкасы', 4, undefined, 1100),
  product('eskimo-oreo', 'cookies', 'Eskimo — OREO Filling', 'Эскимо с начинкой OREO', 'Эскимо — OREO начинкасы', 5, undefined, 1100),
  product('eskimo-caramel', 'cookies', 'Eskimo — Caramel Filling', 'Эскимо с карамельной начинкой', 'Эскимо — карамель начинкасы', 6, undefined, 1100),
  product('kartoshka-dubai', 'cookies', 'Kartoshka — Dubai Filling', 'Картошка с дубайской начинкой', 'Картошка — Dubai начинкасы', 7, undefined, 550),
  product('kartoshka-strawberry', 'cookies', 'Kartoshka — Strawberry Filling', 'Картошка с клубничной начинкой', 'Картошка — құлпынай начинкасы', 8, undefined, 550),
  product('kartoshka-oreo', 'cookies', 'Kartoshka — OREO Filling', 'Картошка с начинкой OREO', 'Картошка — OREO начинкасы', 9, undefined, 550),
  product('kartoshka-caramel', 'cookies', 'Kartoshka — Caramel Filling', 'Картошка с карамельной начинкой', 'Картошка — карамель начинкасы', 10, undefined, 550),

  // Samsa
  product('samsa-meat', 'samsa', 'Samsa with Meat', 'Самса с мясом', 'Етті самса', 1, undefined, 350),
  product('samsa-chicken', 'samsa', 'Samsa with Chicken', 'Самса с курицей', 'Тауықты самса', 2, undefined, 350),

  // Boreks
  product('borek-meat', 'boreks', 'Borek with Meat', 'Борек с мясом', 'Етті борек', 1, undefined, 350),
  product('borek-chicken', 'boreks', 'Borek with Chicken', 'Борек с курицей', 'Тауықты борек', 2, undefined, 360),
  product('borek-potato', 'boreks', 'Borek with Potato', 'Борек с картошкой', 'Картопты борек', 3, undefined, 330),
  product('borek-brinza', 'boreks', 'Borek with Brinza Cheese', 'Борек с брынзой', 'Ірімшікті борек', 4, undefined, 330),
  product('borek-spinach', 'boreks', 'Borek with Spinach', 'Борек со шпинатом', 'Спанатты борек', 5, undefined, 330),
  product('borek-lentils', 'boreks', 'Borek with Lentils', 'Борек с чечевицей', 'Буршақты борек', 6),

  // Packaged desserts
  product('pack-cherry-brownie', 'packaged-desserts', 'Cherry Brownie', 'Вишневый брауни', 'Шие брауни', 1, 'Vişneli Brownie', 1850),
  product('pack-pistachio-raspberry', 'packaged-desserts', 'Pistachio Raspberry', 'Фисташково-малиновый', 'Фисташка-малина', 2, 'Fıstıklı Ahududulu', 2250),
  product('pack-oreo', 'packaged-desserts', 'Oreo', 'Oreo', 'Oreo', 3, undefined, 1650),
  product('pack-tiramisu', 'packaged-desserts', 'Tiramisu', 'Тирамису', 'Тiramisu', 4, undefined, 1750),
  product('pack-strawberry-cake', 'packaged-desserts', 'Strawberry Dessert Cake', 'Клубничный десерт-торт', 'Құлпынай десерт-торт', 5, undefined, 1950),
  product('pack-crunch', 'packaged-desserts', 'Crunch', 'Кранч', 'Crunch', 6, undefined, 1550),
  product('pack-lotus', 'packaged-desserts', 'Lotus', 'Лотус', 'Lotus', 7, undefined, 2250),
  product('pack-meringue-cake', 'packaged-desserts', 'Meringue Cake', 'Меренговый торт', 'Меренга торт', 8, undefined, 1750),

  // Art desserts
  product('art-pistachio', 'art-desserts', 'Art Dessert — Pistachio', 'Арт-десерт ФИСТАШКА', 'Арт-десерт ФИСТАШКА', 1, undefined, 1850),
  product('art-lemon', 'art-desserts', 'Art Dessert — Lemon', 'Арт-десерт ЛИМОН', 'Арт-десерт ЛИМОН', 2, undefined, 1850),
  product('art-coffee', 'art-desserts', 'Art Dessert — Coffee', 'Арт-десерт КОФЕ', 'Арт-десерт КОФЕ', 3, undefined, 1450),
  product('art-mango', 'art-desserts', 'Art Dessert — Mango', 'Арт-десерт МАНГО', 'Арт-десерт МАНГО', 4, undefined, 1850),
  product('art-heart', 'art-desserts', 'Art Dessert — Heart', 'Арт-десерт СЕРДЦЕ', 'Арт-десерт ЖҮРЕК', 5, undefined, 1450),
  product('art-raspberry', 'art-desserts', 'Art Dessert — Raspberry', 'Арт-десерт МАЛИНА', 'Арт-десерт МАЛИНА', 6, undefined, 1450),
  product('art-blueberry', 'art-desserts', 'Art Dessert — Blueberry', 'Арт-десерт ГОЛУБИКА', 'Арт-десерт Қарақат', 7, undefined, 1450),
  product('art-hamburger', 'art-desserts', 'Hamburger', 'Hamburger', 'Hamburger', 8),

  // Tarts
  product('tart-dark-chocolate', 'tarts', 'Dark Chocolate Tart', 'Тарт темный шоколад', 'Қара шоколад тарт', 1, undefined, 1250),
  product('tart-berry-mix', 'tarts', 'Berry Mix Tart', 'Тарт ягодный микс', 'Жидек микс тарт', 2, undefined, 1950),
  product('tart-lemon', 'tarts', 'Lemon Tart', 'Тарт лимонный', 'Лимон тарт', 3, undefined, 1250),
  product('tart-pistachio', 'tarts', 'Pistachio Tart', 'Тарт фисташковый', 'Фисташка тарт', 4, undefined, 1250),

  // Semi-finished
  product('semi-waffle', 'semi-finished', 'Waffle', 'Waffle', 'Waffle', 1),

  // Frozen boreks
  product('frozen-borek-meat', 'frozen-boreks', 'Frozen Borek with Meat', 'Борек с мясом', 'Етті борек', 1),
  product('frozen-borek-chicken', 'frozen-boreks', 'Frozen Borek with Chicken', 'Борек с курицей', 'Тауықты борек', 2),
  product('frozen-borek-potato', 'frozen-boreks', 'Frozen Borek with Potato', 'Борек с картошкой', 'Картопты борек', 3),
  product('frozen-borek-brinza', 'frozen-boreks', 'Frozen Borek with Brinza', 'Борек с брынзой', 'Ірімшікті борек', 4),
  product('frozen-borek-spinach', 'frozen-boreks', 'Frozen Borek with Spinach', 'Борек со шпинатом', 'Спанатты борек', 5),
  product('frozen-borek-lentils', 'frozen-boreks', 'Frozen Borek with Lentils', 'Борек с чечевицей', 'Бұршақты борек', 6),
  product('kucuk-borek', 'frozen-boreks', 'Küçük Borek', 'Kucuk borek', 'Küçük borek', 7),
  product('sarma-borek', 'frozen-boreks', 'Sarma Borek', 'Sarma borek', 'Sarma borek', 8),

  // American cakes
  product('american-tiramisu', 'american-cakes', 'Tiramisu', 'Тирамису', 'Tiramisu', 1, undefined, 1750),
  product('american-strawberry-cake', 'american-cakes', 'Strawberry Dessert Cake', 'Клубничный десерт-торт', 'Құлпынай десерт-торт', 2, undefined, 1950),
  product('american-lotus', 'american-cakes', 'Lotus', 'Лотус', 'Lotus', 3, undefined, 2250),
  product('american-cherry-brownie', 'american-cakes', 'Cherry Brownie', 'Брауни-вишневый', 'Шие брауни', 4, undefined, 1850),
  product('american-pistachio-raspberry', 'american-cakes', 'Pistachio Raspberry', 'Фисташково-малиновый', 'Фисташка-малина', 5, undefined, 2250),
  product('mango-coconut-mousse', 'american-cakes', 'Mango Coconut Mousse', 'Mango hindistan cevizi Mousse', 'Mango hindistan cevizi Mousse', 6),
  product('ferrero-hazelnut-mousse', 'american-cakes', 'Ferrero Hazelnut Mousse', 'Ferrero Findik Mousse', 'Ferrero Findik Mousse', 7),

  // Classic round cakes (Bento)
  product('cake-snickers', 'classic-round-cakes', 'Snickers Cake', 'Snickers', 'Snickers', 1, undefined, 4990),
  product('cake-medovik', 'classic-round-cakes', 'Medovik', 'Medovik', 'Medovik', 2),
  product('cake-milk-girl', 'classic-round-cakes', 'Milk Girl Cake', 'Malocni Devuska', 'Malocni Devuska', 3),
  product('cake-whoopie-pie', 'classic-round-cakes', 'Whoopie Pie', 'Vupi Pay', 'Vupi Pay', 4),
  product('cake-red-velvet', 'classic-round-cakes', 'Red Velvet', 'Krasni Barhat', 'Krasni Barhat', 5),
  product('cake-chocolate', 'classic-round-cakes', 'Chocolate Cake', 'Cikolatali', 'Cikolatali', 6),
  product('cake-pistachio-raspberry', 'classic-round-cakes', 'Pistachio Raspberry Cake', 'Fistik Malina', 'Fistik Malina', 7, undefined, 4990),

  // Pies
  product('pie-apple-walnut-cinnamon', 'pies', 'Apple Walnut Cinnamon Pie', 'Elma ceviz tarcin', 'Elma ceviz tarcin', 1),
  product('pie-snickers', 'pies', 'Snickers Pie', 'Snikerrs Pirog', 'Snikerrs Pirog', 2),
  product('pie-quark', 'pies', 'Quark Pie', 'Tvarok Pirog', 'Tvarok Pirog', 3),
  product('pie-meat', 'pies', 'Meat Pie', 'Etli Pirog', 'Etli Pirog', 4),
  product('pie-chicken', 'pies', 'Chicken Pie', 'Tavuklu Pirog', 'Tavuklu Pirog', 5),
  product('pie-spinach-cheese', 'pies', 'Spinach Cheese Pie', 'Ispanak Peynirli Pirog', 'Ispanak Peynirli Pirog', 6),
  product('pie-cheese', 'pies', 'Cheese Pie', 'Peynirli Pirog', 'Peynirli Pirog', 7),
];

function applyLocalizedNames(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    name_tr: PRODUCT_TR[p.slug] ?? p.name_tr,
    name_ru: PRODUCT_RU[p.slug] ?? p.name_ru,
    name_kk: PRODUCT_KK[p.slug] ?? p.name_kk,
  }));
}

function applyLocalizedCategories(categories: Category[]): Category[] {
  return categories.map((c) => ({
    ...c,
    name_tr: CATEGORY_TR[c.slug] ?? c.name_tr,
    name_ru: CATEGORY_RU[c.slug] ?? c.name_ru,
    name_kk: CATEGORY_KK[c.slug] ?? c.name_kk,
  }));
}

export function getLocalCatalog() {
  const categoryOrder = new Map(MENU_CATEGORIES.map((c) => [c.slug, c.sort_order]));

  const products = applyProductAssets(
    applyLocalizedNames(
      [...MENU_PRODUCTS].sort((a, b) => {
    const catA = categoryOrder.get(a.category_id ?? '') ?? 999;
    const catB = categoryOrder.get(b.category_id ?? '') ?? 999;
    if (catA !== catB) return catA - catB;
    return a.sort_order - b.sort_order;
  })
    ),
    MENU_CATEGORIES
  );

  return {
    categories: applyLocalizedCategories(MENU_CATEGORIES),
    products,
  };
}
