function getB2BWhatsAppDigitsRaw(): string {
  const digits = (
    process.env.NEXT_PUBLIC_B2B_WHATSAPP_NUMBER ??
    '77014537575'
  ).replace(/\D/g, '');

  if (digits.length === 10) return `7${digits}`;
  return digits;
}

export function getB2BWhatsAppDigitsForLink(): string {
  return getB2BWhatsAppDigitsRaw();
}

export function getB2BWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${getB2BWhatsAppDigitsRaw()}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
