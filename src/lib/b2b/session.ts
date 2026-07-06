import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const B2B_SESSION_COOKIE = 'fistik_b2b_session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

function getSessionSecret(): string {
  return (
    process.env.B2B_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    'fistik-b2b-dev-secret-change-me'
  );
}

export function signB2BSession(customerId: string): string {
  const expires = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = `${customerId}.${expires}`;
  const sig = createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyB2BSessionToken(token: string): { customerId: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [customerId, expiresStr, sig] = parts;
  const expires = Number(expiresStr);
  if (!customerId || !Number.isFinite(expires) || Date.now() > expires) return null;

  const payload = `${customerId}.${expiresStr}`;
  const expected = createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');

  try {
    const a = Buffer.from(sig!, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return { customerId };
}

export async function getB2BSessionCustomerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(B2B_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyB2BSessionToken(token)?.customerId ?? null;
}

export function b2bSessionCookieOptions(token: string) {
  return {
    name: B2B_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
