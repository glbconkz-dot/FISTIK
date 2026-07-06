import { redirect } from '@/i18n/routing';
import { tryCreateServiceClient } from '@/lib/supabase/service';
import type { B2BCustomerWithBranches } from '@/types/b2b';

function unreachable(): never {
  throw new Error('Unreachable');
}

export async function getB2BCustomerById(
  customerId: string
): Promise<B2BCustomerWithBranches | null> {
  const supabase = tryCreateServiceClient();
  if (!supabase) return null;

  const { data: customer, error } = await supabase
    .from('b2b_customers')
    .select(
      'id, company_name, director_name, inn, legal_address, phone, phone_alt, is_active, terms_accepted_at, discount_tier, created_at, updated_at'
    )
    .eq('id', customerId)
    .maybeSingle();

  if (error || !customer) return null;

  const { getActiveDiscountTier } = await import('@/lib/b2b/monthly-stats');
  const discount_tier = await getActiveDiscountTier(customerId);

  const { data: branches } = await supabase
    .from('b2b_branches')
    .select('id, customer_id, branch_name, address, is_default, sort_order, created_at')
    .eq('customer_id', customerId)
    .order('sort_order', { ascending: true });

  return {
    ...customer,
    discount_tier,
    branches: branches ?? [],
  };
}

export async function getB2BCustomerSession(): Promise<B2BCustomerWithBranches | null> {
  const { getB2BSessionCustomerId } = await import('@/lib/b2b/session');
  const customerId = await getB2BSessionCustomerId();
  if (!customerId) return null;

  const customer = await getB2BCustomerById(customerId);
  if (!customer || !customer.is_active) return null;
  return customer;
}

/** B2B korumalı sayfalar: oturum yoksa girişe yönlendirir. */
export async function requireB2BCustomerLogin(
  locale: string
): Promise<B2BCustomerWithBranches> {
  const customer = await getB2BCustomerSession();
  if (!customer) {
    redirect({ href: '/b2b/login', locale });
    unreachable();
  }
  return customer;
}

/** B2B korumalı sayfalar: oturum ve sözleşme onayı yoksa yönlendirir. */
export async function requireB2BCustomerSession(
  locale: string
): Promise<B2BCustomerWithBranches> {
  const customer = await requireB2BCustomerLogin(locale);
  if (!customer.terms_accepted_at) {
    redirect({ href: '/b2b/terms', locale });
    unreachable();
  }
  return customer;
}
