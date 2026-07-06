export const B2B_MIN_ORDER_TOTAL = 30_000;
export const B2B_DISCOUNT_TIER_3_THRESHOLD = 500_000;
export const B2B_DISCOUNT_TIER_6_THRESHOLD = 1_000_000;

export const B2B_ADMIN_COOKIE = 'fistik_b2b_admin';
export const B2B_ADMIN_COOKIE_MAX_AGE_SEC = 60 * 60 * 8;

export function getB2BAdminPassword(): string {
  return process.env.B2B_ADMIN_PASSWORD?.trim() || 'Global2026';
}
