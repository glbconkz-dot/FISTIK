import { STORE_TIMEZONE } from '@/lib/order-dates';
import type { ClearanceRule, Product } from '@/types';

function getAlmatyTimeMinutes(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: STORE_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const hourRaw = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const hour = hourRaw === 24 ? 0 : hourRaw;
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.slice(0, 5).split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Whether current Almaty time falls inside the clearance window (supports overnight ranges). */
export function isClearanceWindowActive(
  startTime: string,
  endTime: string,
  now = new Date()
): boolean {
  const current = getAlmatyTimeMinutes(now);
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  if (start <= end) {
    return current >= start && current <= end;
  }

  return current >= start || current <= end;
}

export function computeSalePrice(basePrice: number, discountPercent: number): number {
  return Math.round(basePrice * (1 - discountPercent / 100));
}

export function getEffectivePrice(product: Product): number {
  if (product.clearance_active && product.sale_price != null) {
    return product.sale_price;
  }
  return Number(product.price);
}

export function applyClearanceToProduct(
  product: Product,
  rule: ClearanceRule | undefined,
  now = new Date()
): Product {
  // Always strip stale sale flags (e.g. from a previous cache fill).
  const base: Product = {
    ...product,
    clearance_active: undefined,
    sale_price: undefined,
    sale_discount_percent: undefined,
  };

  if (!rule?.is_active) return base;

  const active = isClearanceWindowActive(rule.start_time, rule.end_time, now);
  if (!active) return base;

  const basePrice = Number(product.price);
  const salePrice = computeSalePrice(basePrice, rule.discount_percent);

  return {
    ...base,
    clearance_active: true,
    sale_price: salePrice,
    sale_discount_percent: rule.discount_percent,
  };
}

export function applyClearanceToProducts(
  products: Product[],
  rules: ClearanceRule[],
  now = new Date()
): Product[] {
  const bySlug = new Map(rules.filter((r) => r.is_active).map((r) => [r.product_slug, r]));

  return products.map((product) => applyClearanceToProduct(product, bySlug.get(product.slug), now));
}

export function formatClearanceTime(time: string): string {
  return time.slice(0, 5);
}

const TIME_24_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** HH:MM — 24 saat; "1600" gibi girişleri de kabul eder. */
export function normalizeTime24Input(raw: string): string | null {
  const trimmed = raw.trim();
  if (TIME_24_RE.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 4) {
    const candidate = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    if (TIME_24_RE.test(candidate)) return candidate;
  }

  return null;
}
