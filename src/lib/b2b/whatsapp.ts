import { formatPhoneForDisplay } from '@/lib/checkout';
import { formatOrderDateTime } from '@/lib/order-dates';
import { formatPrice } from '@/lib/utils';
import type { CartItem, Locale } from '@/types';

export interface B2BWhatsAppOrderPayload {
  orderNumber: string;
  orderPlacedAt: string;
  companyName: string;
  inn: string;
  directorName: string;
  contactName: string;
  phone: string;
  phoneAlt?: string;
  branchName: string;
  deliveryDate: string;
  deliveryTime: string;
  address: string;
  notes: string;
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  locale: Locale;
  /** D+1 / D+2 — müşteri temsilcisi tarih onayı gerekir */
  deliveryDateNeedsApproval?: boolean;
}

const labels: Record<
  Locale,
  {
    title: string;
    channel: string;
    orderNo: string;
    orderTime: string;
    company: string;
    inn: string;
    director: string;
    contact: string;
    name: string;
    phone: string;
    phoneAlt: string;
    delivery: string;
    date: string;
    time: string;
    branch: string;
    address: string;
    notes: string;
    products: string;
    subtotal: string;
    discount: string;
    total: string;
    dateApproval: string;
  }
> = {
  tr: {
    title: 'FISTIK — B2B Sipariş',
    channel: 'Toptan (B2B)',
    orderNo: 'Sipariş No',
    orderTime: 'Sipariş saati',
    company: 'Firma',
    inn: 'INN',
    director: 'Direktör',
    contact: 'İletişim',
    name: 'Ad',
    phone: 'Telefon',
    phoneAlt: 'Ek telefon',
    delivery: 'Teslimat',
    date: 'Tarih',
    time: 'Saat',
    branch: 'Şube',
    address: 'Adres',
    notes: 'Sipariş açıklaması',
    products: 'Ürünler',
    subtotal: 'Ara toplam',
    discount: 'İndirim',
    total: 'Toplam',
    dateApproval: '⚠ Ertesi gün / 2. gün — müşteri temsilcisi tarih onayı gerekli',
  },
  ru: {
    title: 'FISTIK — B2B заказ',
    channel: 'Опт (B2B)',
    orderNo: '№ заказа',
    orderTime: 'Время заказа',
    company: 'Компания',
    inn: 'ИНН',
    director: 'Директор',
    contact: 'Контакт',
    name: 'Имя',
    phone: 'Телефон',
    phoneAlt: 'Доп. телефон',
    delivery: 'Доставка',
    date: 'Дата',
    time: 'Время',
    branch: 'Филиал',
    address: 'Адрес',
    notes: 'Описание заказа',
    products: 'Товары',
    subtotal: 'Подытог',
    discount: 'Скидка',
    total: 'Итого',
    dateApproval: '⚠ Завтра / через 2 дня — требуется подтверждение даты менеджером',
  },
  kk: {
    title: 'FISTIK — B2B тапсырыс',
    channel: 'Опт (B2B)',
    orderNo: 'Тапсырыс №',
    orderTime: 'Тапсырыс уақыты',
    company: 'Компания',
    inn: 'СТН/ИНН',
    director: 'Директор',
    contact: 'Байланыс',
    name: 'Аты',
    phone: 'Телефон',
    phoneAlt: 'Қос. телефон',
    delivery: 'Жеткізу',
    date: 'Күні',
    time: 'Уақыты',
    branch: 'Филиал',
    address: 'Мекенжай',
    notes: 'Тапсырыс сипаттамасы',
    products: 'Өнімдер',
    subtotal: 'Қосалқы',
    discount: 'Жеңілдік',
    total: 'Барлығы',
    dateApproval: '⚠ Ертең / 2-күн — клиент өкілінің күн растауы қажет',
  },
  en: {
    title: 'FISTIK — B2B Order',
    channel: 'Wholesale (B2B)',
    orderNo: 'Order No',
    orderTime: 'Order time',
    company: 'Company',
    inn: 'INN',
    director: 'Director',
    contact: 'Contact',
    name: 'Name',
    phone: 'Phone',
    phoneAlt: 'Alt. phone',
    delivery: 'Delivery',
    date: 'Date',
    time: 'Time',
    branch: 'Branch',
    address: 'Address',
    notes: 'Order notes',
    products: 'Items',
    subtotal: 'Subtotal',
    discount: 'Discount',
    total: 'Total',
    dateApproval: '⚠ Next-day / day+2 — account manager must confirm the date',
  },
};

function field(label: string, value: string): string | null {
  const v = value.trim();
  return v ? `${label}: ${v}` : null;
}

export function buildB2BWhatsAppMessage(payload: B2BWhatsAppOrderPayload): string {
  const l = labels[payload.locale];
  const localeTag =
    payload.locale === 'tr'
      ? 'tr-TR'
      : payload.locale === 'ru'
        ? 'ru-RU'
        : payload.locale === 'kk'
          ? 'kk-KZ'
          : 'en-GB';

  const productLines = payload.items.map((item, i) => {
    const lineTotal = item.price * item.quantity;
    return `${i + 1}. ${item.name}  x${item.quantity}  —  ${formatPrice(lineTotal)}`;
  });

  const blocks: string[] = [
    [
      `*${l.title}*`,
      field(l.channel, 'B2B'),
      field(l.orderNo, payload.orderNumber),
      field(l.orderTime, formatOrderDateTime(payload.orderPlacedAt, localeTag)),
    ]
      .filter(Boolean)
      .join('\n'),
    [
      `*${l.company}*`,
      field(l.company, payload.companyName),
      field(l.inn, payload.inn),
      field(l.director, payload.directorName),
    ]
      .filter(Boolean)
      .join('\n'),
    [
      `*${l.contact}*`,
      field(l.name, payload.contactName),
      field(l.phone, formatPhoneForDisplay(payload.phone)),
      payload.phoneAlt?.trim()
        ? field(l.phoneAlt, formatPhoneForDisplay(payload.phoneAlt))
        : null,
    ]
      .filter(Boolean)
      .join('\n'),
    [
      `*${l.delivery}*`,
      payload.deliveryDateNeedsApproval ? l.dateApproval : null,
      field(l.date, payload.deliveryDate),
      field(l.time, payload.deliveryTime),
      field(l.branch, payload.branchName),
      field(l.address, payload.address),
    ]
      .filter(Boolean)
      .join('\n'),
  ];

  if (payload.notes.trim()) {
    blocks.push([`*${l.notes}*`, payload.notes.trim()].join('\n'));
  }

  blocks.push([`*${l.products}*`, ...productLines].join('\n'));

  const totals: string[] = [`*${l.subtotal}: ${formatPrice(payload.subtotal)}*`];
  if (payload.discountPercent > 0) {
    totals.push(
      `*${l.discount} (${payload.discountPercent}%): -${formatPrice(payload.discountAmount)}*`
    );
  }
  totals.push(`*${l.total}: ${formatPrice(payload.total)}*`);
  blocks.push(totals.join('\n'));

  return blocks.join('\n\n');
}
