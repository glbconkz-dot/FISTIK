'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createB2BOrder } from '@/app/actions/b2b-orders';
import { CartLineItemList } from '@/components/CartLineItemList';
import { PhoneNationalInput } from '@/components/PhoneNationalInput';
import {
  extractKzNationalDigits,
  getMinDeliveryDate,
} from '@/lib/checkout';
import { B2B_MIN_ORDER_TOTAL } from '@/lib/b2b/constants';
import { calculateB2BTotals } from '@/lib/b2b/pricing';
import { getB2BWhatsAppDigitsForLink } from '@/lib/b2b/whatsapp-link';
import { makeFallbackOrderNumber } from '@/lib/order-numbers';
import { beginWhatsAppOpen, buildOrderWhatsAppUrl } from '@/lib/open-whatsapp';
import { formatPrice } from '@/lib/utils';
import { useIsClient } from '@/hooks/use-is-client';
import { useB2BCartStore } from '@/stores/b2b-cart';
import type { B2BCustomerWithBranches } from '@/types/b2b';
import type { Locale } from '@/types';

interface B2BCheckoutFormProps {
  customer: B2BCustomerWithBranches;
  locale: Locale;
}

export function B2BCheckoutForm({ customer, locale }: B2BCheckoutFormProps) {
  const t = useTranslations('b2b.checkout');
  const tCart = useTranslations('b2b.cart');
  const tCommon = useTranslations('common');
  const isClient = useIsClient();
  const items = useB2BCartStore((s) => s.items);
  const subtotal = useB2BCartStore((s) => s.subtotal());
  const updateQuantity = useB2BCartStore((s) => s.updateQuantity);
  const removeItem = useB2BCartStore((s) => s.removeItem);
  const clearCart = useB2BCartStore((s) => s.clearCart);

  const defaultBranch =
    customer.branches.find((b) => b.is_default)?.id ?? customer.branches[0]?.id ?? '';

  const [contactName, setContactName] = useState(
    customer.director_name.trim() || customer.company_name
  );
  const [phoneNational, setPhoneNational] = useState(
    extractKzNationalDigits(customer.phone)
  );
  const [deliveryDate, setDeliveryDate] = useState('');
  const [branchId, setBranchId] = useState(defaultBranch);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [waFallbackUrl, setWaFallbackUrl] = useState<string | null>(null);

  const minDate = getMinDeliveryDate();
  const discountPercent = customer.discount_tier;
  const totals = useMemo(
    () => calculateB2BTotals(subtotal, discountPercent),
    [subtotal, discountPercent]
  );
  const belowMin = subtotal < B2B_MIN_ORDER_TOTAL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError(t('errors.cartEmpty'));
      return;
    }
    if (belowMin) {
      setError(t('errors.minOrder', { amount: formatPrice(B2B_MIN_ORDER_TOTAL) }));
      return;
    }
    if (!branchId) {
      setError(t('errors.branchRequired'));
      return;
    }

    setError('');
    setWaFallbackUrl(null);
    setSubmitting(true);

    const orderPlacedAt = new Date().toISOString();
    const orderNumber = makeFallbackOrderNumber(new Date(orderPlacedAt));
    const cartSnapshot = [...items];
    const phone = phoneNational.length === 10 ? `+7${phoneNational}` : phoneNational;

    const wa = beginWhatsAppOpen();

    const result = await createB2BOrder(
      {
        contactName,
        phone,
        deliveryDate,
        branchId,
        notes,
      },
      cartSnapshot,
      locale,
      { orderNumber, orderPlacedAt }
    );

    setSubmitting(false);

    if (!result.success) {
      wa.cancel();
      const key = result.error ?? 'generic';
      setError(t(`errors.${key}` as 'errors.generic'));
      return;
    }

    clearCart();

    if (result.whatsappMessage) {
      const url =
        result.whatsappUrl ??
        buildOrderWhatsAppUrl(result.whatsappMessage, getB2BWhatsAppDigitsForLink());
      setWaFallbackUrl(url);
      wa.finish(result.whatsappMessage, getB2BWhatsAppDigitsForLink());
      return;
    }

    wa.cancel();
  };

  if (!isClient) {
    return <p className="py-8 text-center text-sm text-muted">{tCommon('loading')}</p>;
  }

  if (items.length === 0 && waFallbackUrl) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <p className="font-display text-xl font-semibold">{t('orderSaved')}</p>
        <p className="text-sm text-muted">{t('whatsappFallbackHint')}</p>
        <a href={waFallbackUrl} className="btn-primary inline-flex min-h-[48px] items-center justify-center px-6">
          {t('openWhatsApp')}
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">{t('emptyCart')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="luxury-card space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold">{t('summary')}</h2>
        <CartLineItemList
          items={items}
          subtotal={subtotal}
          totalLabel={t('subtotal')}
          removeLabel={tCart('remove')}
          removeItem={removeItem}
          updateQuantity={updateQuantity}
          compact
          hideTotal
        />
        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">{t('subtotal')}</span>
            <span className="tabular-nums">{formatPrice(totals.subtotal)}</span>
          </div>
          {totals.discountPercent > 0 ? (
            <div className="flex justify-between text-accent">
              <span>{t('discount', { percent: totals.discountPercent })}</span>
              <span className="tabular-nums">−{formatPrice(totals.discountAmount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-semibold">
            <span>{t('total')}</span>
            <span className="text-accent tabular-nums">{formatPrice(totals.total)}</span>
          </div>
        </div>
        {belowMin ? (
          <p className="text-sm text-amber-700">
            {t('errors.minOrder', { amount: formatPrice(B2B_MIN_ORDER_TOTAL) })}
          </p>
        ) : null}
      </div>

      <div className="luxury-card space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold">{t('deliveryTitle')}</h2>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('company')}</label>
          <input className="input-field bg-cream/50" value={customer.company_name} readOnly />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('contactName')}</label>
          <input
            className="input-field"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('phone')}</label>
          <PhoneNationalInput
            name="phoneNational"
            value={phoneNational}
            onChange={setPhoneNational}
            onBlur={() => undefined}
            placeholder="701 453 75 75"
          />
          <p className="mt-1 text-xs text-muted">{t('phoneHint')}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('deliveryDate')}</label>
          <input
            className="input-field"
            type="date"
            min={minDate}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('branch')}</label>
          {customer.branches.length === 0 ? (
            <p className="text-sm text-red-600">{t('errors.noBranches')}</p>
          ) : (
            <select
              className="input-field"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              required
            >
              {customer.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.is_default ? '★ ' : ''}
                  {b.branch_name} — {b.address}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="rounded-xl border border-border bg-pistachio-soft px-4 py-3 text-sm leading-relaxed text-muted">
          {t('deliveryTimeNotice')}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('notes')}</label>
          <textarea
            className="input-field min-h-[96px] resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {waFallbackUrl ? (
        <a href={waFallbackUrl} className="btn-primary block w-full text-center">
          {t('openWhatsApp')}
        </a>
      ) : null}

      <p className="text-sm text-muted">{t('whatsappHint')}</p>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={submitting || belowMin || customer.branches.length === 0}
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
