'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { openWhatsAppWithMessage } from '@/lib/open-whatsapp';
import { formatPrice } from '@/lib/utils';
import { buildWhatsAppMessage } from '@/lib/whatsapp';
import { PhoneNationalInput } from '@/components/PhoneNationalInput';
import { useIsClient } from '@/hooks/use-is-client';
import { useCartStore } from '@/stores/cart';
import { useCheckoutStore } from '@/stores/checkout';
import type { CheckoutFormData, Locale } from '@/types';

const TOTAL_STEPS = 4;

const checkoutSchema = z
  .object({
    customerName: z.string().min(2),
    phoneNational: z.string().refine(isValidKzNationalPhone),
    deliveryMethod: z.enum(['delivery', 'pickup']),
    deliveryDate: z.string().min(1),
    addressStreet: z.string().optional(),
    buildingNumber: z.string().optional(),
    floorApartment: z.string().optional(),
    addressNotes: z.string().optional(),
    cakeText: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== 'delivery') return;
    if (!data.addressStreet || data.addressStreet.trim().length < 5) {
      ctx.addIssue({ code: 'custom', path: ['addressStreet'], message: 'required' });
    }
    if (!data.buildingNumber?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['buildingNumber'], message: 'required' });
    }
    if (!data.floorApartment?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['floorApartment'], message: 'required' });
    }
  });

type CheckoutValues = z.infer<typeof checkoutSchema>;

interface CheckoutWizardProps {
  locale: Locale;
}

export function CheckoutWizard({ locale }: CheckoutWizardProps) {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const savedForm = useCheckoutStore((s) => s.form);
  const updateForm = useCheckoutStore((s) => s.updateForm);
  const clearForm = useCheckoutStore((s) => s.clearForm);
  const [step, setStep] = useState(1);
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
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { ...savedForm, deliveryMethod: savedForm.deliveryMethod ?? 'delivery' },
  });

  const deliveryMethod = watch('deliveryMethod');

  useEffect(() => {
    const rehydrate = () => {
      const saved = useCheckoutStore.getState().form;
      const deliveryDate = isDeliveryDateValid(saved.deliveryDate) ? saved.deliveryDate : '';
      reset({ ...saved, deliveryDate, deliveryMethod: saved.deliveryMethod ?? 'delivery' });
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
        deliveryMethod: values.deliveryMethod ?? 'delivery',
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

  const stepFields: Record<number, (keyof CheckoutValues)[]> = {
    1: ['customerName', 'phoneNational'],
    2: ['deliveryMethod', 'deliveryDate', 'addressStreet', 'buildingNumber', 'floorApartment'],
    3: ['cakeText', 'notes'],
    4: [],
  };

  const goNext = async () => {
    setError(null);
    const fields = stepFields[step];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (!valid) {
      setError(t('errors.formInvalid'));
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

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

    const address =
      data.deliveryMethod === 'pickup'
        ? t('pickupAddress')
        : formatCheckoutAddress(
            {
              addressStreet: data.addressStreet ?? '',
              buildingNumber: data.buildingNumber ?? '',
              floorApartment: data.floorApartment ?? '',
              addressNotes: data.addressNotes,
            },
            locale
          );

    const payload: CheckoutFormData = {
      customerName: data.customerName,
      phone,
      deliveryDate: data.deliveryDate,
      deliveryTime: getPendingDeliveryTime(locale),
      address,
      cakeText: data.cakeText,
      notes: data.notes,
    };

    const cartSnapshot = [...items];

    setError(null);
    setSubmitting(true);

    const result = await createOrder(payload, cartSnapshot, locale, {
      orderNumber,
      orderPlacedAt,
    });

    setSubmitting(false);

    if (!result.success) {
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
    openWhatsAppWithMessage(message);
  };

  if (!isClient || !hydrated) {
    return <p className="py-8 text-center text-sm text-muted">{tCommon('loading')}</p>;
  }

  const stepLabels = [t('step1'), t('step2'), t('step3'), t('step4')];

  return (
    <div>
      <div className="mb-8">
        <div className="flex gap-2">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-foreground text-surface'
                      : done
                        ? 'bg-brand text-foreground'
                        : 'bg-cream text-muted'
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`hidden text-center text-[10px] leading-tight sm:block ${
                    active ? 'font-medium text-foreground' : 'text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-cream">
          <motion.div
            className="h-full bg-brand"
            initial={false}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              <h2 className="font-display text-xl font-semibold">{t('step1Title')}</h2>
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
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              <h2 className="font-display text-xl font-semibold">{t('step2Title')}</h2>

              <div className="flex gap-2">
                {(['delivery', 'pickup'] as const).map((method) => (
                  <label
                    key={method}
                    className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      deliveryMethod === method
                        ? 'border-foreground bg-foreground text-surface'
                        : 'border-border bg-surface hover:bg-cream'
                    }`}
                  >
                    <input
                      type="radio"
                      value={method}
                      className="sr-only"
                      {...register('deliveryMethod')}
                    />
                    {method === 'delivery' ? t('deliveryOption') : t('pickupOption')}
                  </label>
                ))}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('deliveryDate')}</label>
                <input className="input-field" type="date" min={minDate} {...register('deliveryDate')} />
                {errors.deliveryDate && (
                  <p className="mt-1 text-sm text-red-600">{t('errors.dateRequired')}</p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-pistachio-soft px-4 py-3 text-sm leading-relaxed">
                {t('deliveryTimeNotice')}
              </div>

              {deliveryMethod === 'delivery' ? (
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
              ) : (
                <p className="rounded-xl border border-border bg-cream px-4 py-3 text-sm text-muted">
                  {t('pickupInfo')}
                </p>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              <h2 className="font-display text-xl font-semibold">{t('step3Title')}</h2>

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

              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('cakeText')}</label>
                <input className="input-field" {...register('cakeText')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('notes')}</label>
                <textarea className="input-field min-h-[72px] resize-none" {...register('notes')} />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              <h2 className="font-display text-xl font-semibold">{t('step4Title')}</h2>
              <p className="text-sm leading-relaxed text-muted">{t('step4Desc')}</p>

              <div className="luxury-card space-y-3 p-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted">{t('customerName')}</span>
                  <span className="font-medium">{getValues('customerName')}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">{t('phone')}</span>
                  <span className="font-medium">{getValues('phoneNational')}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">{t('deliveryDate')}</span>
                  <span className="font-medium">{getValues('deliveryDate')}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-3">
                  <span className="font-semibold">{t('total')}</span>
                  <span className="font-semibold text-accent">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button type="button" onClick={goBack} className="btn-outline flex-1">
              {t('back')}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={goNext} className="btn-primary flex-1">
              {t('next')}
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={submitting || items.length === 0}
            >
              {submitting ? t('submitting') : t('submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
