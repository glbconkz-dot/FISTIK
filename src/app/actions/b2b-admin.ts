'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/supabase/server';
import { tryCreateServiceClient } from '@/lib/supabase/service';
import { hashPassword, generatePassword } from '@/lib/b2b/password';
import { normalizeB2BPhone, isValidB2BPhone } from '@/lib/b2b/phone';
import {
  B2B_ADMIN_COOKIE,
  B2B_ADMIN_COOKIE_MAX_AGE_SEC,
  getB2BAdminPassword,
} from '@/lib/b2b/constants';
import type { B2BBranchInput, B2BCustomerInput, B2BCustomerWithBranches } from '@/types/b2b';
import { mapB2BSupabaseError } from '@/lib/b2b/errors';

interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  errorDetail?: string;
  data?: T;
}

export async function verifyB2BAdminGate(password: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) {
    return { success: false, error: 'unauthorized' };
  }

  if (password.trim() !== getB2BAdminPassword()) {
    return { success: false, error: 'wrongPassword' };
  }

  const cookieStore = await cookies();
  cookieStore.set(B2B_ADMIN_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: B2B_ADMIN_COOKIE_MAX_AGE_SEC,
  });

  return { success: true };
}

export async function isB2BAdminGateOpen(): Promise<boolean> {
  const admin = await getAdminUser();
  if (!admin) return false;
  const cookieStore = await cookies();
  return cookieStore.get(B2B_ADMIN_COOKIE)?.value === '1';
}

export async function listB2BCustomers(): Promise<B2BCustomerWithBranches[]> {
  if (!(await isB2BAdminGateOpen())) return [];

  const supabase = tryCreateServiceClient();
  if (!supabase) return [];

  const { data: customers, error } = await supabase
    .from('b2b_customers')
    .select(
      'id, company_name, director_name, inn, legal_address, phone, phone_alt, is_active, terms_accepted_at, discount_tier, created_at, updated_at'
    )
    .order('company_name', { ascending: true });

  if (error || !customers) {
    console.error('listB2BCustomers:', error?.message);
    return [];
  }

  const { data: branches } = await supabase
    .from('b2b_branches')
    .select('id, customer_id, branch_name, address, is_default, sort_order, created_at')
    .order('sort_order', { ascending: true });

  const byCustomer = new Map<string, B2BCustomerWithBranches['branches']>();
  for (const branch of branches ?? []) {
    const list = byCustomer.get(branch.customer_id) ?? [];
    list.push(branch);
    byCustomer.set(branch.customer_id, list);
  }

  return customers.map((c) => ({
    ...c,
    discount_tier: c.discount_tier as 0 | 3 | 6,
    branches: byCustomer.get(c.id) ?? [],
  }));
}

function normalizeBranches(branches: B2BBranchInput[]): B2BBranchInput[] {
  const cleaned = branches
    .map((b) => ({
      branchName: b.branchName.trim(),
      address: b.address.trim(),
      isDefault: b.isDefault ?? false,
    }))
    .filter((b) => b.address.length > 0);

  if (cleaned.length === 0) return [];

  const hasDefault = cleaned.some((b) => b.isDefault);
  if (!hasDefault) {
    cleaned[0]!.isDefault = true;
  }

  return cleaned;
}

export async function createB2BCustomer(
  input: B2BCustomerInput
): Promise<ActionResult<{ generatedPassword?: string }>> {
  if (!(await isB2BAdminGateOpen())) {
    return { success: false, error: 'unauthorized' };
  }

  const phone = normalizeB2BPhone(input.phone);
  const phoneAlt = input.phoneAlt.trim() ? normalizeB2BPhone(input.phoneAlt) : '';

  if (!isValidB2BPhone(phone)) {
    return { success: false, error: 'invalidPhone' };
  }
  if (phoneAlt && !isValidB2BPhone(phoneAlt)) {
    return { success: false, error: 'invalidPhoneAlt' };
  }
  if (!input.companyName.trim()) {
    return { success: false, error: 'companyRequired' };
  }

  const password = input.password.trim() || generatePassword(8);
  const branches = normalizeBranches(input.branches);

  const supabase = tryCreateServiceClient();
  if (!supabase) {
    return { success: false, error: 'setup' };
  }

  const { data: customer, error } = await supabase
    .from('b2b_customers')
    .insert({
      company_name: input.companyName.trim(),
      director_name: input.directorName.trim(),
      inn: input.inn.trim(),
      legal_address: input.legalAddress.trim(),
      phone,
      phone_alt: phoneAlt,
      password_hash: hashPassword(password),
    })
    .select('id')
    .single();

  if (error || !customer) {
    const mapped = mapB2BSupabaseError(error);
    console.error('createB2BCustomer:', error?.code, error?.message);
    return {
      success: false,
      error: mapped.code,
      errorDetail: mapped.detail,
    };
  }

  if (branches.length > 0) {
    const rows = branches.map((b, index) => ({
      customer_id: customer.id,
      branch_name: b.branchName || `Şube ${index + 1}`,
      address: b.address,
      is_default: b.isDefault ?? false,
      sort_order: index,
    }));

    const { error: branchError } = await supabase.from('b2b_branches').insert(rows);
    if (branchError) {
      console.error('createB2BCustomer branches:', branchError.message);
    }
  } else if (input.legalAddress.trim()) {
    await supabase.from('b2b_branches').insert({
      customer_id: customer.id,
      branch_name: 'Ana adres',
      address: input.legalAddress.trim(),
      is_default: true,
      sort_order: 0,
    });
  }

  revalidatePath('/admin/b2b');
  return {
    success: true,
    data: { generatedPassword: input.password.trim() ? undefined : password },
  };
}

export async function toggleB2BCustomerActive(
  customerId: string,
  isActive: boolean
): Promise<ActionResult> {
  if (!(await isB2BAdminGateOpen())) {
    return { success: false, error: 'unauthorized' };
  }

  const supabase = tryCreateServiceClient();
  if (!supabase) return { success: false, error: 'setup' };

  const { error } = await supabase
    .from('b2b_customers')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', customerId);

  if (error) {
    console.error('toggleB2BCustomerActive:', error.message);
    return { success: false, error: 'saveFailed' };
  }

  revalidatePath('/admin/b2b');
  return { success: true };
}

export async function resetB2BCustomerPassword(
  customerId: string
): Promise<ActionResult<{ password: string }>> {
  if (!(await isB2BAdminGateOpen())) {
    return { success: false, error: 'unauthorized' };
  }

  const password = generatePassword(8);
  const supabase = tryCreateServiceClient();
  if (!supabase) return { success: false, error: 'setup' };

  const { error } = await supabase
    .from('b2b_customers')
    .update({
      password_hash: hashPassword(password),
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId);

  if (error) {
    console.error('resetB2BCustomerPassword:', error.message);
    return { success: false, error: 'saveFailed' };
  }

  revalidatePath('/admin/b2b');
  return { success: true, data: { password } };
}
