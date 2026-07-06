'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hashPassword, verifyPassword } from '@/lib/b2b/password';
import { normalizeB2BPhone, isValidB2BPhone } from '@/lib/b2b/phone';
import {
  b2bSessionCookieOptions,
  B2B_SESSION_COOKIE,
  getB2BSessionCustomerId,
  signB2BSession,
} from '@/lib/b2b/session';
import { tryCreateServiceClient } from '@/lib/supabase/service';
import type { Locale } from '@/types';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function signInB2B(
  phoneRaw: string,
  password: string,
  locale: Locale
): Promise<ActionResult> {
  const phone = normalizeB2BPhone(phoneRaw);
  if (!isValidB2BPhone(phone)) {
    return { success: false, error: 'invalidPhone' };
  }
  if (!password.trim()) {
    return { success: false, error: 'invalidCredentials' };
  }

  const supabase = tryCreateServiceClient();
  if (!supabase) {
    return { success: false, error: 'setup' };
  }

  const { data: customer, error } = await supabase
    .from('b2b_customers')
    .select('id, password_hash, is_active, terms_accepted_at')
    .eq('phone', phone)
    .maybeSingle();

  if (error || !customer) {
    return { success: false, error: 'invalidCredentials' };
  }

  if (!customer.is_active) {
    return { success: false, error: 'inactive' };
  }

  if (!verifyPassword(password, customer.password_hash)) {
    return { success: false, error: 'invalidCredentials' };
  }

  const token = signB2BSession(customer.id);
  const cookieStore = await cookies();
  const opts = b2bSessionCookieOptions(token);
  cookieStore.set(opts.name, opts.value, opts);

  if (!customer.terms_accepted_at) {
    redirect(`/${locale}/b2b/terms`);
  }

  redirect(`/${locale}/b2b/menu`);
}

export async function acceptB2BTerms(locale: Locale): Promise<ActionResult> {
  const customerId = await getB2BSessionCustomerId();
  if (!customerId) {
    return { success: false, error: 'unauthorized' };
  }

  const supabase = tryCreateServiceClient();
  if (!supabase) {
    return { success: false, error: 'setup' };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('b2b_customers')
    .update({ terms_accepted_at: now, updated_at: now })
    .eq('id', customerId);

  if (error) {
    console.error('acceptB2BTerms:', error.message);
    return { success: false, error: 'saveFailed' };
  }

  redirect(`/${locale}/b2b/menu`);
}

export async function signOutB2B(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(B2B_SESSION_COOKIE);
  redirect(`/${locale}/b2b/login`);
}
