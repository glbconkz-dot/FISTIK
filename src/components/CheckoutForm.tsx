'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createOrder } from '@/app/actions/orders';
import {
  formatCheckoutAddress,
  getMinDeliveryDate,
  getPendingDeliveryTime,
  isDeliveryDateValid,
  isValidKzNationalPhone,
  normalizeKzPhone,
} from '@/lib/checkout';
import { makeFallbackOrderNumber } from '@/lib/order-numbers';
import { beginWhatsAppOpen } from '@/lib/open-whatsapp';
import { formatPrice } from '@/lib/utils';
import { buildWhatsAppMessage } from '@/lib/whatsapp';
import { PhoneNationalInput } from '@/components/PhoneNationalInput';
import { useIsClient } from '@/hooks/use-is-client';
import { useCartStore } from '@/stores/cart';
import { useCheckoutStore } from '@/stores/checkout';
import type { CheckoutFormData, Locale } from '@/types';

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  phoneNational: z.string().refine(isValidKzNationalPhone),
  deliveryDate: z.string().min(1),
  addressStreet: z.string().min(5),
  buildingNumber: z.string().min(1),
  floorApartment: z.string().min(1),
  addressNotes: z.string().optional(),
  cakeText: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  locale: Locale;
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const savedForm = useCheckoutStore((s) => s.form);
  const updateForm = useCheckoutStore((s) => s.updateForm);
  const clearForm = useCheckoutStore((s) => s.clearForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const minDate = getMinDeliveryDate();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: savedForm,
  });

  useEffect(() => {
    const rehydrate = () => {
      const saved = useCheckoutStore.getState().form;
      const deliveryDate = isDeliveryDateValid(saved.deliveryDate)
        ? saved.deliveryDate
        : '';
      reset({ ...saved, deliveryDate });
      setHydrated(true);
    };

    if (useCheckoutStore.persist.hasHydrated()) {
      rehydrate();
      return;
    }

    return useCheckoutStore.persist.onFinishHydration(rehydrate);
  }, [reset]);

  useEffect(() => {
    if (!hydrated) return;
    const subscription = watch((values) => {
      updateForm({
        customerName: values.customerName ?? '',
        phoneNational: values.phoneNational ?? '',
        deliveryDate: values.deliveryDate ?? '',
        addressStreet: values.addressStreet ?? '',
        buildingNumber: values.buildingNumber ?? '',
        floorApartment: values.floorApartment ?? '',
        addressNotes: values.addressNotes ?? '',
        cakeText: values.cakeText ?? '',
        notes: values.notes ?? '',
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateForm, hydrated]);

  const onSubmit = async (data: CheckoutValues) => {
    if (items.length === 0) {
      setError(t('errors.cartEmpty'));
      return;
    }

    const phone = normalizeKzPhone(data.phoneNational);
    if (!phone) {
      setError(t('errors.phoneRequired'));
      return;
    }

    const orderPlacedAt = new Date().toISOString();
    const orderNumber = makeFallbackOrderNumber(new Date(orderPlacedAt));

    const payload: CheckoutFormData = {
      customerName: data.customerName,
      phone,
      deliveryDate: data.deliveryDate,
      deliveryTime: getPendingDeliveryTime(locale),
      address: formatCheckoutAddress(data, locale),
      cakeText: data.cakeText,
      notes: data.notes,
    };

    const cartSnapshot = [...items];

    setError(null);
    setSubmitting(true);

    const wa = beginWhatsAppOpen();

    const result = await createOrder(payload, cartSnapshot, locale, {
      orderNumber,
      orderPlacedAt,
    });

    setSubmitting(false);

    if (!result.success) {
      wa.cancel();
      const key = result.error ?? 'generic';
      setError(t(`errors.${key}` as 'errors.generic'));
      return;
    }

    const total = cartSnapshot.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const message = buildWhatsAppMessage({
      orderNumber,
      orderPlacedAt,
      customerName: payload.customerName,
      phone: payload.phone,
      deliveryDate: payload.deliveryDate,
      deliveryTime: payload.deliveryTime,
      address: payload.address,
      cakeText: payload.cakeText,
      notes: payload.notes,
      items: cartSnapshot,
      total,
      locale,
    });

    clearCart();
    clearForm();
    wa.finish(message);
  };

  const onInvalid = () => {
    setError(t('errors.formInvalid'));
    const firstInvalid = document.querySelector<HTMLElement>(
      'input:invalid, textarea:invalid, .text-red-600'
    );
    firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!isClient || !hydrated) {
    return (
      <p className="py-8 text-center text-sm text-muted">{tCommon('loading')}</p>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('customerName')}</label>
        <input className="input-field" {...register('customerName')} />
        {errors.customerName && (
          <p className="mt-1 text-sm text-red-600">{t('errors.nameRequired')}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('phone')}</label>
        <Controller
          name="phoneNational"
          control={control}
          render={({ field }) => (
            <PhoneNationalInput
              name={field.name}
              value={field.value}
              placeholder={t('phonePlaceholder')}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <p className="mt-1 text-xs text-muted">{t('phoneHint')}</p>
        {errors.phoneNational && (
          <p className="mt-1 text-sm text-red-600">{t('errors.phoneRequired')}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('deliveryDate')}</label>
        <input className="input-field" type="date" min={minDate} {...register('deliveryDate')} />
        {errors.deliveryDate && (
          <p className="mt-1 text-sm text-red-600">{t('errors.dateRequired')}</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-brand/15 px-4 py-3 text-sm leading-relaxed text-foreground/90">
        {t('deliveryTimeNotice')}
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">{t('address')}</legend>

        <div>
          <label className="mb-1.5 block text-sm font-medium">{t('addressStreet')}</label>
          <textarea
            className="input-field min-h-[72px] resize-none"
            placeholder={t('addressStreetPlaceholder')}
            {...register('addressStreet')}
          />
          {errors.addressStreet && (
            <p className="mt-1 text-sm text-red-600">{t('errors.addressStreetRequired')}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('buildingNumber')}</label>
            <input className="input-field" {...register('buildingNumber')} />
            {errors.buildingNumber && (
              <p className="mt-1 text-sm text-red-600">{t('errors.buildingRequired')}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('floorApartment')}</label>
            <input className="input-field" {...register('floorApartment')} />
            {errors.floorApartment && (
              <p className="mt-1 text-sm text-red-600">{t('errors.apartmentRequired')}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">{t('addressNotes')}</label>
          <textarea
            className="input-field min-h-[64px] resize-none"
            placeholder={t('addressNotesPlaceholder')}
            {...register('addressNotes')}
          />
        </div>
      </fieldset>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('cakeText')}</label>
        <input className="input-field" {...register('cakeText')} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('notes')}</label>
        <textarea className="input-field min-h-[72px] resize-none" {...register('notes')} />
      </div>

      <div className="luxury-card p-4">
        <h3 className="font-display text-lg font-semibold">{t('orderSummary')}</h3>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
          <span>{t('total')}</span>
          <span className="text-accent">{formatPrice(subtotal)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={submitting || items.length === 0}
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
