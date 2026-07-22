import { applyProductAssets } from '@/data/product-assets';
import { CATEGORY_KK, CATEGORY_RU, CATEGORY_TR, PRODUCT_KK, PRODUCT_RU, PRODUCT_TR } from '@/data/menu-names';
import type { Category, Product } from '@/types';

export const PLACEHOLDER_IMAGE = '/product-placeholder.jpg';
export const DEFAULT_MENU_PRICE = 1500;

const desc = {
  en: 'Made to order with care at the FISTIK atelier.',
  ru: 'Готовим на заказ с душой в ателье FISTIK.',
  kk: 'FISTIK ательесінде тапсырыс бойынша махаббатпен дайындалады.',
  tr: 'Siparişiniz üzerine, FISTIK atölyesinde özenle hazırlanır.',
};

function category(
  slug: string,
  name_en: string,
  name_ru: string,
  name_kk: string,
  name_tr: string,
  sort_order: number,
  image_url = ''
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
    image_url,
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
  price = DEFAULT_MENU_PRICE,
  stock_quantity = 8
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
    stock_quantity,
    sort_order,
    created_at: '',
  };
}

export const MENU_CATEGORIES: Category[] = [
  category('eclairs-large', 'Large Eclairs', 'Эклеры', 'Эклерлер', 'Büyük Ekler', 1),
  category('eclairs-mini', 'Mini Eclairs', 'Мини-эклеры', 'Мини-эклерлер', 'Mini Ekler', 2),
  category('packaged-desserts', 'Cube Portion Desserts', 'Порционные торты в кубе', 'Кубтағы порциялық торттар', 'Küp Porsiyon Pastalar', 3),
  category('american-cakes', 'Rectangular Box Cakes', 'Прямоугольные торты в боксах', 'Қораптағы тіктөртбұрышты торттар', 'Box Dikdörtgen Pastalar', 4, '/products/american-cakes/lotus.png'),
  category('art-desserts', 'Art Desserts', 'Арт-десерты', 'Арт-десерттер', 'Art Desserts', 5),
  category('pirozhnye', 'Pastries', 'Пирожные', 'Пирожныйлар', 'Mono Cakes', 6),
  category('tarts', 'Tarts', 'Тарты', 'Тарттар', 'Tartlar', 7),
  category('cookies', 'Cookies', 'Печенья', 'Печеньелер', 'Kurabiyeler', 8),
  category('turtas', 'Turtas', 'Сладкие пироги', 'Тәтті пирогтар', 'Turtalar', 9),
  category('classic-round-cakes', 'Gateau', 'Торты', 'Торттар', 'Yaş Pasta', 10),
  category('pies', 'Pies', 'Пироги', 'Пирогтар', 'Piroglar', 11),
  category('boreks', 'Boreks', 'Бореки', 'Боректер', 'Börekler', 12),
  category('samsa', 'Samsa', 'Самса', 'Самса', 'Samsa', 13),
  category('semi-finished', 'Semi-finished Products', 'Полуфабрикаты', 'Полуфабрикаты', 'Yarı Mamul Ürünler', 14),
  category('frozen-boreks', 'Semi-finished Products', 'Полуфабрикаты', 'Полуфабрикаты', 'Yarı Mamul Ürünler', 15),
  category('coffee', 'Fıstık Signature', 'Fıstık Signature', 'Fıstık Signature', 'Fıstık Signature', 16),
  category('classic-coffee', 'Coffee', 'Кофе', 'Кофе', 'Kahve', 17),
  category('iced-coffee', 'Iced Coffee', 'Холодный кофе', 'Суық кофе', 'Soğuk Kahveler', 18),
  category('chocolate-series', 'Chocolate Series', 'Шоколадная серия', 'Шоколад сериясы', 'Çikolata Serisi', 19),
];

export const MENU_PRODUCTS: Product[] = [
  // Large Eclairs — 750 ₸
  product('eclair-large-pistachio', 'eclairs-large', 'Pistachio Eclair', 'Pistachio Eclair', 'Pistachio Eclair', 1, 'Pistachio Eclair', 750),
  product('eclair-large-hazelnut', 'eclairs-large', 'Hazelnut Eclair', 'Hazelnut Eclair', 'Hazelnut Eclair', 2, 'Hazelnut Eclair', 750),
  product('eclair-large-vanilla', 'eclairs-large', 'Vanilla Eclair', 'Vanilla Eclair', 'Vanilla Eclair', 3, 'Vanilla Eclair', 750),
  product('eclair-large-mastic', 'eclairs-large', 'Damla sakizi Eclair', 'Damla sakizi Eclair', 'Damla sakizi Eclair', 4, 'Damla sakizi Eclair', 750),
  product('eclair-large-strawberry', 'eclairs-large', 'Strawberry Eclair', 'Strawberry Eclair', 'Strawberry Eclair', 5, 'Strawberry Eclair', 750),
  product('eclair-large-raspberry', 'eclairs-large', 'Raspberry Eclair', 'Raspberry Eclair', 'Raspberry Eclair', 6, 'Raspberry Eclair', 750),
  product('eclair-large-cherry', 'eclairs-large', 'Cherry Eclair', 'Cherry Eclair', 'Cherry Eclair', 7, 'Cherry Eclair', 750),
  product('eclair-large-pineapple', 'eclairs-large', 'Pineapple Eclair', 'Pineapple Eclair', 'Pineapple Eclair', 8, 'Pineapple Eclair', 750),

  // Mini Eclairs — 450 ₸
  product('eclair-mini-pistachio', 'eclairs-mini', 'Pistachio Eclair (mini)', 'Pistachio Eclair (mini)', 'Pistachio Eclair (mini)', 1, 'Pistachio Eclair (mini)', 450),
  product('eclair-mini-hazelnut', 'eclairs-mini', 'Hazelnut Eclair (mini)', 'Hazelnut Eclair (mini)', 'Hazelnut Eclair (mini)', 2, 'Hazelnut Eclair (mini)', 450),
  product('eclair-mini-vanilla', 'eclairs-mini', 'Vanilla Eclair (mini)', 'Vanilla Eclair (mini)', 'Vanilla Eclair (mini)', 3, 'Vanilla Eclair (mini)', 450),
  product('eclair-mini-mastic', 'eclairs-mini', 'Damla sakizi Eclair (mini)', 'Damla sakizi Eclair (mini)', 'Damla sakizi Eclair (mini)', 4, 'Damla sakizi Eclair (mini)', 450),
  product('eclair-mini-strawberry', 'eclairs-mini', 'Strawberry Eclair (mini)', 'Strawberry Eclair (mini)', 'Strawberry Eclair (mini)', 5, 'Strawberry Eclair (mini)', 450),
  product('eclair-mini-raspberry', 'eclairs-mini', 'Raspberry Eclair (mini)', 'Raspberry Eclair (mini)', 'Raspberry Eclair (mini)', 6, 'Raspberry Eclair (mini)', 450),
  product('eclair-mini-cherry', 'eclairs-mini', 'Cherry Eclair (mini)', 'Cherry Eclair (mini)', 'Cherry Eclair (mini)', 7, 'Cherry Eclair (mini)', 450),
  product('eclair-mini-pineapple', 'eclairs-mini', 'Pineapple Eclair (mini)', 'Pineapple Eclair (mini)', 'Pineapple Eclair (mini)', 8, 'Pineapple Eclair (mini)', 450),

  // Cookies (Latin names in all languages)
  product('pistachio-cookies', 'cookies', 'Pistachio Cookie', 'Pistachio Cookie', 'Pistachio Cookie', 1, 'Pistachio Cookie', 650),
  product('cookie-brownie', 'cookies', 'Brownie Cookie', 'Brownie Cookie', 'Brownie Cookie', 2, 'Brownie Cookie', 650),
  product('cookie-lotus', 'cookies', 'Lotus Cookie', 'Lotus Cookie', 'Lotus Cookie', 3, 'Lotus Cookie', 650),
  product('cookie-lemon', 'cookies', 'Lemon Cookie', 'Lemon Cookie', 'Lemon Cookie', 4, 'Lemon Cookie', 650),
  product('cookie-chocolate', 'cookies', 'Chocolate Cookie', 'Chocolate Cookie', 'Chocolate Cookie', 5, 'Chocolate Cookie', 650),
  product('cookie-dubai', 'cookies', 'Dubai Cookie', 'Dubai Cookie', 'Dubai Cookie', 6, 'Dubai Cookie', 650),
  product('almond-kavala', 'cookies', 'Almond Cookie', 'Almond Cookie', 'Almond Cookie', 7, 'Almond Cookie', 1850),

  // Samsa
  product('samsa-meat', 'samsa', 'Meat samsa', 'Самса с мясом', 'Етті самса', 1, 'Etli Samsa', 350),
  product('samsa-chicken', 'samsa', 'Chicken Samsa', 'Самса с курицей', 'Тауықты самса', 2, 'Tavuklu Samsa', 350),

  // Boreks
  product('borek-meat', 'boreks', 'Meat Borek', 'Борек с мясом', 'Борек етпен', 1, 'Etli Börek', 380),
  product('borek-chicken', 'boreks', 'Chicken Borek', 'Борек с курицей', 'Борек тауықпен', 2, 'Tavuklu Börek', 390),
  product('borek-potato', 'boreks', 'Potato Borek', 'Борек с картошкой', 'Борек картоппен', 3, 'Patatesli Börek', 360),
  product('borek-brinza', 'boreks', 'Cheese Borek', 'Борек с брынзой', 'Борек брынзамен', 4, 'Peynirli Börek', 360),
  product('borek-spinach', 'boreks', 'Spinach Borek', 'Борек со шпинатом', 'Борек спанатпен', 5, 'Ispanaklı Börek', 380),
  product('borek-lentils', 'boreks', 'Lentil Borek', 'Борек с чечевицей', 'Борек бұршақпен', 6, 'Mercimekli Börek', 380),

  // Packaged desserts (Cube — Latin names in all languages)
  product('pack-tiramisu', 'packaged-desserts', 'Tiramisu Cube', 'Tiramisu Cube', 'Tiramisu Cube', 1, 'Tiramisu Cube', 2050),
  product('pack-strawberry-cake', 'packaged-desserts', 'Strawberry Cube', 'Strawberry Cube', 'Strawberry Cube', 2, 'Strawberry Cube', 2250),
  product('pack-crunch', 'packaged-desserts', 'Crunch Cube', 'Crunch Cube', 'Crunch Cube', 3, 'Crunch Cube', 1850),
  product('pack-lotus', 'packaged-desserts', 'Lotus Cube', 'Lotus Cube', 'Lotus Cube', 4, 'Lotus Cube', 2550),
  product('pack-cherry-brownie', 'packaged-desserts', 'Cherry Cube', 'Cherry Cube', 'Cherry Cube', 5, 'Cherry Cube', 2150),
  product('pack-pistachio-raspberry', 'packaged-desserts', 'Pistachio Cube', 'Pistachio Cube', 'Pistachio Cube', 6, 'Pistachio Cube', 2550),
  product('pack-oreo', 'packaged-desserts', 'Oreo Cube', 'Oreo Cube', 'Oreo Cube', 7, 'Oreo Cube', 1950),
  product('pack-meringue-cake', 'packaged-desserts', 'Merenga Cube', 'Merenga Cube', 'Merenga Cube', 8, 'Merenga Cube', 2050),

  // Art desserts
  product('art-pistachio', 'art-desserts', 'Pistachio Art', 'Pistachio Art', 'Pistachio Art', 1, 'Pistachio Art', 1850),
  product('art-lemon', 'art-desserts', 'Lemon Art', 'Lemon Art', 'Lemon Art', 2, 'Lemon Art', 1850),
  product('art-coffee', 'art-desserts', 'Coffee Art', 'Coffee Art', 'Coffee Art', 3, 'Coffee Art', 1450),
  product('art-mango', 'art-desserts', 'Mango Art', 'Mango Art', 'Mango Art', 4, 'Mango Art', 1850),
  product('art-heart', 'art-desserts', 'Heart Art', 'Heart Art', 'Heart Art', 5, 'Heart Art', 1450),
  product('art-raspberry', 'art-desserts', 'Raspberry Art', 'Raspberry Art', 'Raspberry Art', 6, 'Raspberry Art', 1450),
  product('art-blueberry', 'art-desserts', 'Blueberry Art', 'Blueberry Art', 'Blueberry Art', 7, 'Blueberry Art', 1450),
  product('art-hamburger', 'art-desserts', 'Hamburger', 'Hamburger', 'Hamburger', 8, 'Hamburger', 2350),

  // Tarts
  product('tart-dark-chocolate', 'tarts', 'Chocolate Tart', 'Chocolate Tart', 'Chocolate Tart', 1, 'Chocolate Tart', 1250),
  product('tart-berry-mix', 'tarts', 'Berry Tart', 'Berry Tart', 'Berry Tart', 2, 'Berry Tart', 1950),
  product('tart-lemon', 'tarts', 'Lemon Tart', 'Lemon Tart', 'Lemon Tart', 3, 'Lemon Tart', 1250),
  product('tart-pistachio', 'tarts', 'Pistachio Tart', 'Pistachio Tart', 'Pistachio Tart', 4, 'Pistachio Tart', 1250),

  // Turtalar (tatli turta — pirog ve tart degil)
  product('pie-apple-walnut-cinnamon', 'turtas', 'Elmalı Turta', 'Elmalı Turta', 'Elmalı Turta', 1, 'Elmalı Turta', 3500),
  product('pie-snickers', 'turtas', 'Snikers Pie', 'Snikers Pie', 'Snikers Pie', 2, 'Snikers Pie', 3750),

  // Semi-finished
  product('semi-waffle', 'semi-finished', 'Waffle', 'Вафли', 'Вафли', 1, 'Waffle', 2969),
  product('semi-croissant', 'semi-finished', 'Croissant', 'Круассан', 'Круассан', 2, 'Kruvasan', 0, 0),
  product('frozen-samsa-chicken', 'semi-finished', 'Frozen Chicken Samsa', 'Замороженная самса с курицей', 'Мұздатылған тауықты самса', 3, 'Dondurulmuş Tavuklu Samsa', 1800, 5),
  product('frozen-samsa-meat', 'semi-finished', 'Frozen Meat Samsa', 'Замороженная самса с мясом', 'Мұздатылған етті самса', 4, 'Dondurulmuş Etli Samsa', 1800, 5),

  // Frozen boreks (semi-finished)
  product('frozen-borek-meat', 'frozen-boreks', 'Meat Borek', 'Борек с мясом', 'Борек етпен', 1, 'Etli Börek', 2220),
  product('frozen-borek-chicken', 'frozen-boreks', 'Chicken Borek', 'Борек с курицей', 'Борек тауықпен', 2, 'Tavuklu Börek', 2280),
  product('frozen-borek-potato', 'frozen-boreks', 'Potato Borek', 'Борек с картошкой', 'Борек картоппен', 3, 'Patatesli Börek', 2100),
  product('frozen-borek-brinza', 'frozen-boreks', 'Cheese Borek', 'Борек с брынзой', 'Борек брынзамен', 4, 'Peynirli Börek', 2100),
  product('frozen-borek-spinach', 'frozen-boreks', 'Spinach Borek', 'Борек со шпинатом', 'Борек спанатпен', 5, 'Ispanaklı Börek', 2220),
  product('frozen-borek-lentils', 'frozen-boreks', 'Lentil Borek', 'Борек с чечевицей', 'Борек бұршақпен', 6, 'Mercimekli Börek', 2220),
  product('mini-borek-meat', 'frozen-boreks', 'Meat Mini Borek', 'Мини борек с мясом', 'Мини борек етпен', 7, 'Etli Mini Börek', 4480),
  product('mini-borek-chicken', 'frozen-boreks', 'Chicken Mini Borek', 'Мини борек с курицей', 'Мини борек тауықпен', 8, 'Tavuklu Mini Börek', 4640),
  product('mini-borek-potato', 'frozen-boreks', 'Potato Mini Borek', 'Мини борек с картошкой', 'Мини борек картоппен', 9, 'Patatesli Mini Börek', 4320),
  product('mini-borek-spinach', 'frozen-boreks', 'Spinach Mini Borek', 'Мини борек со шпинатом', 'Мини борек спанатпен', 10, 'Ispanaklı Mini Börek', 4480),
  product('mini-borek-brinza', 'frozen-boreks', 'Cheese Mini Borek', 'Мини борек с брынзой', 'Мини борек брынзамен', 11, 'Peynirli Mini Börek', 4320),
  product('mini-borek-lentils', 'frozen-boreks', 'Lentil Mini Borek', 'Мини борек с чечевицей', 'Мини борек бұршақпен', 12, 'Mercimekli Mini Börek', 4480),
  product('sarma-borek-meat', 'frozen-boreks', 'Meat Sarma Borek', 'Сарма борек с мясом', 'Сарма борек етпен', 13, 'Etli Sarma Börek', 2999),
  product('sarma-borek-chicken', 'frozen-boreks', 'Chicken Sarma Borek', 'Сарма борек с курицей', 'Сарма борек тауықпен', 14, 'Tavuklu Sarma Börek', 2999),
  product('sarma-borek-brinza', 'frozen-boreks', 'Cheese Sarma Borek', 'Сарма борек с брынзой', 'Сарма борек брынзамен', 15, 'Peynirli Sarma Börek', 2699),
  product('sarma-borek-spinach', 'frozen-boreks', 'Spinach Sarma Borek', 'Сарма борек со шпинатом', 'Сарма борек спанатпен', 16, 'Ispanaklı Sarma Börek', 2999),
  product('sarma-borek-lentils', 'frozen-boreks', 'Lentil Sarma Borek', 'Сарма борек с чечевицей', 'Сарма борек бұршақпен', 17, 'Mercimekli Sarma Börek', 2999),
  product('sarma-borek-potato', 'frozen-boreks', 'Potato Sarma Borek', 'Сарма борек с картошкой', 'Сарма борек картоппен', 18, 'Patatesli Sarma Börek', 2699),

  // Pirozhnye (Latin names in all languages)
  product('eskimo-dubai', 'pirozhnye', 'Dubai Eskimo', 'Dubai Eskimo', 'Dubai Eskimo', 1, 'Dubai Eskimo', 1100),
  product('eskimo-strawberry', 'pirozhnye', 'Strawberry Eskimo', 'Strawberry Eskimo', 'Strawberry Eskimo', 2, 'Strawberry Eskimo', 1100),
  product('eskimo-oreo', 'pirozhnye', 'Oreo Eskimo', 'Oreo Eskimo', 'Oreo Eskimo', 3, 'Oreo Eskimo', 1100),
  product('eskimo-caramel', 'pirozhnye', 'Caramel Eskimo', 'Caramel Eskimo', 'Caramel Eskimo', 4, 'Caramel Eskimo', 1100),
  product('kids-eskimo', 'pirozhnye', 'Kids Eskimo', 'Kids Eskimo', 'Kids Eskimo', 5, 'Kids Eskimo', 550),
  product('kartoshka-dubai', 'pirozhnye', 'Dubai Potato', 'Dubai Potato', 'Dubai Potato', 6, 'Dubai Potato', 550),
  product('kartoshka-strawberry', 'pirozhnye', 'Strawberry Potato', 'Strawberry Potato', 'Strawberry Potato', 7, 'Strawberry Potato', 550),
  product('kartoshka-oreo', 'pirozhnye', 'Oreo Potato', 'Oreo Potato', 'Oreo Potato', 8, 'Oreo Potato', 550),
  product('kartoshka-caramel', 'pirozhnye', 'Caramel Potato', 'Caramel Potato', 'Caramel Potato', 9, 'Caramel Potato', 550),
  product('kartoshka-pack-4', 'pirozhnye', 'Potato Asorti', 'Potato Asorti', 'Potato Asorti', 10, 'Potato Asorti', 2100),

  // Rectangular box cakes (Latin names in all languages)
  product('american-tiramisu', 'american-cakes', 'Tiramisu Elite box', 'Tiramisu Elite box', 'Tiramisu Elite box', 1, 'Tiramisu Elite box', 15250),
  product('american-strawberry-cake', 'american-cakes', 'Strawberry Elite box', 'Strawberry Elite box', 'Strawberry Elite box', 2, 'Strawberry Elite box', 16250),
  product('american-lotus', 'american-cakes', 'Lotus Elite box', 'Lotus Elite box', 'Lotus Elite box', 3, 'Lotus Elite box', 17750),
  product('american-cherry-brownie', 'american-cakes', 'Cherry Elite box', 'Cherry Elite box', 'Cherry Elite box', 4, 'Cherry Elite box', 15750),
  product('american-pistachio-raspberry', 'american-cakes', 'Pistachio Elite box', 'Pistachio Elite box', 'Pistachio Elite box', 5, 'Pistachio Elite box', 15750),
  product('mango-coconut-mousse', 'american-cakes', 'Mango Musse Elite box', 'Mango Musse Elite box', 'Mango Musse Elite box', 6, 'Mango Musse Elite box', 15750),
  product('ferrero-hazelnut-mousse', 'american-cakes', 'Ferrero Musse Elite box', 'Ferrero Musse Elite box', 'Ferrero Musse Elite box', 7, 'Ferrero Musse Elite box', 16250),

  // Gateau / Yas Pasta (Latin names in all languages)
  product('cake-snickers', 'classic-round-cakes', 'Snickers Cake', 'Snickers Cake', 'Snickers Cake', 1, 'Snickers Cake', 8300),
  product('cake-medovik', 'classic-round-cakes', 'Honey Cake', 'Honey Cake', 'Honey Cake', 2, 'Honey Cake', 7500),
  product('cake-milk-girl', 'classic-round-cakes', 'Milky girl Cake', 'Milky girl Cake', 'Milky girl Cake', 3, 'Milky girl Cake', 7000),
  product('cake-whoopie-pie', 'classic-round-cakes', 'Whoopie Pie Cake', 'Whoopie Pie Cake', 'Whoopie Pie Cake', 4, 'Whoopie Pie Cake', 8500),
  product('cake-red-velvet', 'classic-round-cakes', 'Red Velvet Cake', 'Red Velvet Cake', 'Red Velvet Cake', 5, 'Red Velvet Cake', 7500),
  product('cake-chocolate', 'classic-round-cakes', 'Chocolate Cake', 'Chocolate Cake', 'Chocolate Cake', 6, 'Chocolate Cake', 7500),
  product('cake-pistachio-raspberry', 'classic-round-cakes', 'Pistachio Cake', 'Pistachio Cake', 'Pistachio Cake', 7, 'Pistachio Cake', 8500),

  // Pies (savory)
  product('pie-meat', 'pies', 'Meat Pie', 'Пирог с мясом', 'Пирог етпен', 1, 'Etli Pirog', 3400),
  product('pie-chicken', 'pies', 'Chicken Pie', 'Пирог с курицей', 'Пирог тауықпен', 2, 'Tavuklu Pirog', 3600),
  product('pie-spinach-cheese', 'pies', 'Spinach Cheese Pie', 'Пирог со шпинатом и сыром', 'Пирог спанат және ірімшікпен', 3, 'Ispanak Peynirli Pirog', 3800),
  product('pie-cheese', 'pies', 'Cheese Pie', 'Сырный пирог', 'Сырлы пирог', 4, 'Peynirli Pirog', 3400),

  // Fıstık Signature (B2C coffee)
  product('coffee-fistik-latte', 'coffee', 'Fıstık Latte', 'Fıstık Latte', 'Fıstık Latte', 1, 'Fıstık Latte', 1890),
  product('coffee-salted-caramel-latte', 'coffee', 'Salted Caramel Latte', 'Salted Caramel Latte', 'Salted Caramel Latte', 2, 'Salted Caramel Latte', 1890),
  product('coffee-lotus-latte', 'coffee', 'Lotus Latte', 'Lotus Latte', 'Lotus Latte', 3, 'Lotus Latte', 1890),
  product('coffee-spanish-latte', 'coffee', 'Spanish Latte', 'Spanish Latte', 'Spanish Latte', 4, 'Spanish Latte', 1890),

  // Normal Kahve
  product('classic-espresso', 'classic-coffee', 'Espresso', 'Espresso', 'Espresso', 1, 'Espresso', 990),
  product('classic-americano', 'classic-coffee', 'Americano', 'Americano', 'Americano', 2, 'Americano', 1290),
  product('classic-cappuccino', 'classic-coffee', 'Cappuccino', 'Cappuccino', 'Cappuccino', 3, 'Cappuccino', 1590),
  product('classic-flat-white', 'classic-coffee', 'Flat White', 'Flat White', 'Flat White', 4, 'Flat White', 1590),
  product('classic-turkish-coffee', 'classic-coffee', 'Turkish Coffee', 'Turkish Coffee', 'Turkish Coffee', 5, 'Türk Kahvesi', 990),

  // Soğuk Kahveler
  product('iced-americano', 'iced-coffee', 'Iced Americano', 'Iced Americano', 'Iced Americano', 1, 'Iced Americano', 1490),
  product('iced-latte', 'iced-coffee', 'Iced Latte', 'Iced Latte', 'Iced Latte', 2, 'Iced Latte', 1690),
  product('iced-spanish-latte', 'iced-coffee', 'Iced Spanish Latte', 'Iced Spanish Latte', 'Iced Spanish Latte', 3, 'Iced Spanish Latte', 1690),
  product('iced-caramel-latte', 'iced-coffee', 'Iced Caramel Latte', 'Iced Caramel Latte', 'Iced Caramel Latte', 4, 'Iced Caramel Latte', 1690),
  product('iced-mocha', 'iced-coffee', 'Iced Mocha', 'Iced Mocha', 'Iced Mocha', 5, 'Iced Mocha', 1690),
  product('iced-vanilla-latte', 'iced-coffee', 'Iced Vanilla Latte', 'Iced Vanilla Latte', 'Iced Vanilla Latte', 6, 'Iced Vanilla Latte', 1690),
  product('cold-brew-latte', 'iced-coffee', 'Cold Brew Latte', 'Cold Brew Latte', 'Cold Brew Latte', 7, 'Cold Brew Latte', 1690),
  product('cold-brew', 'iced-coffee', 'Cold Brew', 'Cold Brew', 'Cold Brew', 8, 'Cold Brew', 1490),
  product('espresso-tonic', 'iced-coffee', 'Espresso Tonic', 'Espresso Tonic', 'Espresso Tonic', 9, 'Espresso Tonic', 1690),

  // Çikolata Serisi (B2C drinks)
  product('chocolate-pistachio-hot', 'chocolate-series', 'Pistachio Hot Chocolate', 'Pistachio Hot Chocolate', 'Pistachio Hot Chocolate', 1, 'Fıstıklı Sıcak Çikolata', 1890),
  product('chocolate-white-hot', 'chocolate-series', 'White Hot Chocolate', 'White Hot Chocolate', 'White Hot Chocolate', 2, 'Beyaz Sıcak Çikolata', 1890),
  product('chocolate-hot', 'chocolate-series', 'Hot Chocolate', 'Hot Chocolate', 'Hot Chocolate', 3, 'Sıcak Çikolata', 1890),
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
