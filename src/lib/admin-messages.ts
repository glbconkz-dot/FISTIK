export type AdminLocale = 'tr' | 'ru';

export const ADMIN_LOCALE_COOKIE = 'admin_locale';

const messages = {
  tr: {
    panelTitle: 'Yönetim paneli',
    dashboard: 'Özet',
    products: 'Ürünler',
    categories: 'Kategoriler',
    storefront: 'Ana Sayfa Vitrini',
    orders: 'Siparişler',
    signOut: 'Çıkış',
    signIn: 'Giriş yap',
    signingIn: 'Giriş yapılıyor…',
    adminLogin: 'Admin',
    email: 'E-posta',
    password: 'Şifre',
    loginTitle: 'Admin girişi',
    loginFailed: 'Giriş başarısız',
    unauthorized: 'Bu panele erişim yetkiniz yok.',
    setupRequired: 'Supabase ayarlanmamış. .env.local dosyasını kontrol edin.',
    addProduct: 'Ürün ekle',
    edit: 'Düzenle',
    save: 'Kaydet',
    active: 'Aktif',
    inactive: 'Pasif',
    onSale: 'Satışta',
    soldOut: 'Tükendi',
    stockLabel: 'Stok adedi',
    priceLabel: 'Fiyat (₸)',
    productsTitle: 'Ürünler',
    productsHint: 'Ürünler kategoriye göre listelenir. Fiyat ve stok → Kaydet.',
    productsInCategory: 'ürün',
    uncategorized: 'Kategorisiz',
    noProducts: 'Henüz ürün yok.',
    stockColumnMissing: 'Stok sütunu yok. Supabase’de 006_stock_quantity.sql çalıştırın.',
    toggleFailed: 'Durum güncellenemedi',
    langTr: 'Türkçe',
    langRu: 'Русский',
  },
  ru: {
    panelTitle: 'Панель управления',
    dashboard: 'Обзор',
    products: 'Товары',
    categories: 'Категории',
    storefront: 'Витрина',
    orders: 'Заказы',
    signOut: 'Выход',
    signIn: 'Войти',
    signingIn: 'Вход…',
    adminLogin: 'Админ',
    email: 'Эл. почта',
    password: 'Пароль',
    loginTitle: 'Вход администратора',
    loginFailed: 'Ошибка входа',
    unauthorized: 'Нет доступа к панели.',
    setupRequired: 'Supabase не настроен. Проверьте .env.local.',
    addProduct: 'Добавить товар',
    edit: 'Изменить',
    save: 'Сохранить',
    active: 'Активен',
    inactive: 'Неактивен',
    onSale: 'В продаже',
    soldOut: 'Нет в наличии',
    stockLabel: 'Остаток',
    priceLabel: 'Цена (₸)',
    productsTitle: 'Товары',
    productsHint: 'Товары по категориям. Цена и остаток → Сохранить.',
    productsInCategory: 'тов.',
    uncategorized: 'Без категории',
    noProducts: 'Товаров пока нет.',
    stockColumnMissing: 'Нет столбца stock_quantity. Запустите 006_stock_quantity.sql в Supabase.',
    toggleFailed: 'Не удалось обновить статус',
    langTr: 'Türkçe',
    langRu: 'Русский',
  },
} as const;

export type AdminMessageKey = keyof (typeof messages)['tr'];

export function getAdminMessages(locale: AdminLocale) {
  return messages[locale] ?? messages.tr;
}

export function resolveAdminLocale(value: string | undefined | null): AdminLocale {
  return value === 'ru' ? 'ru' : 'tr';
}

import { getLocalizedName } from '@/lib/utils';

export function getLocalizedProductName(
  product: {
    slug: string;
    name_tr: string;
    name_ru: string;
    name_kk?: string;
    name_en: string;
  },
  locale: AdminLocale
): string {
  return getLocalizedName(
    {
      slug: product.slug,
      name_en: product.name_en,
      name_ru: product.name_ru,
      name_kk: product.name_kk ?? '',
      name_tr: product.name_tr,
    },
    locale === 'ru' ? 'ru' : 'tr'
  );
}
