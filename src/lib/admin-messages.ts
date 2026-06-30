export type AdminLocale = 'tr' | 'ru';

export const ADMIN_LOCALE_COOKIE = 'admin_locale';

const messages = {
  tr: {
    panelTitle: 'Yönetim paneli',
    dashboard: 'Özet',
    products: 'Ürünler',
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
    productsTitle: 'Ürünler',
    productsHint: 'Stok adedini yazın → Kaydet. Sadece admin panelindeki stok menüde görünür.',
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
    productsTitle: 'Товары',
    productsHint: 'Введите остаток → Сохранить. На сайте только данные из панели.',
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

import { PRODUCT_KK, PRODUCT_TR } from '@/data/menu-names';

export function getLocalizedProductName(
  product: { slug: string; name_tr: string; name_ru: string; name_en: string },
  locale: AdminLocale
): string {
  if (locale === 'ru') {
    const ru = product.name_ru?.trim();
    if (ru && ru !== product.name_en) return ru;
    return ru ?? product.name_en;
  }

  const tr = product.name_tr?.trim();
  if (tr && tr !== product.name_en) return tr;
  return PRODUCT_TR[product.slug] ?? tr ?? product.name_en;
}
