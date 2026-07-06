export function calculateB2BTotals(subtotal: number, discountPercent: 0 | 3 | 6) {
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;
  return { subtotal, discountPercent, discountAmount, total };
}
