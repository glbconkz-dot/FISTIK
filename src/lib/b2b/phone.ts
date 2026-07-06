/** Normalize Kazakhstan phone to digits only (7XXXXXXXXXX). */
export function normalizeB2BPhone(input: string): string {
  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    digits = `7${digits}`;
  }

  return digits;
}

export function isValidB2BPhone(digits: string): boolean {
  return /^7\d{10}$/.test(digits);
}

export function formatB2BPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }
  return digits;
}
