/** Client + server — WhatsApp mesajı ile DB kaydında aynı numara kullanılır */
export function makeFallbackOrderNumber(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = now.getTime().toString().slice(-4);
  return `FST-${date}-${suffix}`;
}
