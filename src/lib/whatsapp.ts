import { formatPhoneForDisplay } from '@/lib/checkout';
import {
  getB2cFulfillmentBranchLabel,
  getWhatsAppLink,
} from '@/lib/business';
import { formatOrderDateTime } from '@/lib/order-dates';
import { formatPrice } from '@/lib/utils';
import type { CartItem, Locale } from '@/types';

export interface WhatsAppOrderPayload {
  orderNumber: string;
  orderPlacedAt: string;
  customerName: string;
  phone: string;
  deliveryDate: string;
  deliveryTime: string;
  address: string;
  cakeText?: string;
  notes?: string;
  items: CartItem[];
  total: number;
  locale: Locale;
}

const labels: Record<
  Locale,
  {
    title: string;
    channel: string;
    branch: string;
    orderNo: string;
    orderTime: string;
    customer: string;
    name: string;
    phone: string;
    deliverySection: string;
    delivery: string;
    deliveryTime: string;
    address: string;
    cakeText: string;
    notes: string;
    products: string;
    total: string;
  }
> = {
  tr: {
    title: 'FISTIK — Yeni Sipariş',
    channel: 'Perakende (B2C)',
    branch: 'Şube hattı',
    orderNo: 'Sipariş No',
    orderTime: 'Sipariş saati',
    customer: 'Müşteri',
    name: 'Ad',
    phone: 'Telefon',
    deliverySection: 'Teslimat',
    delivery: 'Tarih',
    deliveryTime: 'Saat',
    address: 'Adres',
    cakeText: 'Pasta yazısı',
    notes: 'Sipariş notu',
    products: 'Ürünler',
    total: 'Toplam',
  },
  ru: {
    title: 'FISTIK — Новый заказ',
    channel: 'Розница (B2C)',
    branch: 'Линия филиала',
    orderNo: '№ заказа',
    orderTime: 'Время заказа',
    customer: 'Клиент',
    name: 'Имя',
    phone: 'Телефон',
    deliverySection: 'Доставка',
    delivery: 'Дата',
    deliveryTime: 'Время',
    address: 'Адрес',
    cakeText: 'Надпись на торте',
    notes: 'Примечание',
    products: 'Товары',
    total: 'Итого',
  },
  kk: {
    title: 'FISTIK — Жаңа тапсырыс',
    channel: 'Бөлшек (B2C)',
    branch: 'Филиал желісі',
    orderNo: 'Тапсырыс №',
    orderTime: 'Тапсырыс уақыты',
    customer: 'Клиент',
    name: 'Аты',
    phone: 'Телефон',
    deliverySection: 'Жеткізу',
    delivery: 'Күні',
    deliveryTime: 'Уақыты',
    address: 'Мекенжай',
    cakeText: 'Торт мәтіні',
    notes: 'Ескертулер',
    products: 'Өнімдер',
    total: 'Барлығы',
  },
  en: {
    title: 'FISTIK — New Order',
    channel: 'Retail (B2C)',
    branch: 'Branch line',
    orderNo: 'Order No',
    orderTime: 'Order time',
    customer: 'Customer',
    name: 'Name',
    phone: 'Phone',
    deliverySection: 'Delivery',
    delivery: 'Date',
    deliveryTime: 'Time',
    address: 'Address',
    cakeText: 'Cake inscription',
    notes: 'Order notes',
    products: 'Items',
    total: 'Total',
  },
};

function field(label: string, value: string): string | null {
  const v = value.trim();
  return v ? `${label}: ${v}` : null;
}

/** Virgülle birleşen adres parçalarını satır satır göster */
function formatAddressBlock(address: string): string {
  return address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * WhatsApp metni — emoji yok (wa.me önizlemesinde bozuluyor).
 * *kalın* başlıklar WhatsApp'ta form benzeri okunaklılık sağlar.
 */
export function buildWhatsAppMessage(payload: WhatsAppOrderPayload): string {
  const {
    orderNumber,
    orderPlacedAt,
    customerName,
    phone,
    deliveryDate,
    deliveryTime,
    address,
    cakeText,
    notes,
    items,
    total,
    locale,
  } = payload;

  const l = labels[locale];
  const phoneDisplay = formatPhoneForDisplay(phone);
  const branchLabel = getB2cFulfillmentBranchLabel(locale);

  const productLines = items.map((item, i) => {
    const subtotal = item.price * item.quantity;
    return `${i + 1}. ${item.name}  x${item.quantity}  —  ${formatPrice(subtotal)}`;
  });

  const localeTag =
    locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'kk' ? 'kk-KZ' : 'en-GB';

  const blocks: string[] = [
    [
      `*${l.title}*`,
      field(l.channel, 'B2C'),
      field(l.branch, branchLabel),
      field(l.orderNo, orderNumber),
      field(l.orderTime, formatOrderDateTime(orderPlacedAt, localeTag)),
    ]
      .filter(Boolean)
      .join('\n'),
    [
      `*${l.customer}*`,
      field(l.name, customerName),
      field(l.phone, phoneDisplay),
    ]
      .filter(Boolean)
      .join('\n'),
    [
      `*${l.deliverySection}*`,
      field(l.delivery, deliveryDate),
      field(l.deliveryTime, deliveryTime),
    ]
      .filter(Boolean)
      .join('\n'),
    [`*${l.address}*`, formatAddressBlock(address)].filter(Boolean).join('\n'),
  ];

  if (cakeText?.trim()) {
    blocks.push([`*${l.cakeText}*`, cakeText.trim()].join('\n'));
  }

  if (notes?.trim()) {
    blocks.push([`*${l.notes}*`, notes.trim()].join('\n'));
  }

  blocks.push([`*${l.products}*`, ...productLines].join('\n'));
  blocks.push(`*${l.total}: ${formatPrice(total)}*`);

  return blocks.join('\n\n');
}

export function buildWhatsAppUrl(message: string): string {
  return getWhatsAppLink(message);
}
