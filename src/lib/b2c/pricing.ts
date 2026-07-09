import { B2C_FREE_DELIVERY_THRESHOLD, B2C_MIN_ORDER_TOTAL } from '@/lib/b2c/constants';

export function isB2COrderAllowed(subtotal: number): boolean {
  return subtotal >= B2C_MIN_ORDER_TOTAL;
}

export function isB2CFreeDelivery(subtotal: number): boolean {
  return subtotal >= B2C_FREE_DELIVERY_THRESHOLD;
}

export function b2cDeliveryAvailable(subtotal: number): boolean {
  return subtotal >= B2C_MIN_ORDER_TOTAL;
}

export function b2cAmountUntilMinOrder(subtotal: number): number {
  return Math.max(0, B2C_MIN_ORDER_TOTAL - subtotal);
}

export function b2cAmountUntilFreeDelivery(subtotal: number): number {
  return Math.max(0, B2C_FREE_DELIVERY_THRESHOLD - subtotal);
}
