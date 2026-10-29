'use client';

import { useTranslations } from 'next-intl';
import { B2C_FREE_DELIVERY_THRESHOLD, B2C_MIN_ORDER_TOTAL } from '@/lib/b2c/constants';
import {
  b2cAmountUntilFreeDelivery,
  b2cAmountUntilMinOrder,
  isB2CFreeDelivery,
  isB2COrderAllowed,
} from '@/lib/b2c/pricing';
import { formatPrice } from '@/lib/utils';

interface B2COrderRulesNoticeProps {
  subtotal: number;
  deliveryMethod?: 'delivery' | 'pickup';
  compact?: boolean;
}

export function B2COrderRulesNotice({
  subtotal,
  deliveryMethod = 'delivery',
  compact = false,
}: B2COrderRulesNoticeProps) {
  const t = useTranslations('cart');

  const belowMin = !isB2COrderAllowed(subtotal);
  const freeDelivery = isB2CFreeDelivery(subtotal);
  const untilMin = b2cAmountUntilMinOrder(subtotal);
  const untilFree = b2cAmountUntilFreeDelivery(subtotal);

  if (compact && belowMin) {
    return (
      <p className="text-sm text-amber-800">
        {t('minOrder', { amount: formatPrice(B2C_MIN_ORDER_TOTAL) })}
      </p>
    );
  }

  return (
    <div
      className={`space-y-2 rounded-xl border border-border text-sm leading-relaxed ${
        compact ? 'bg-cream/80 px-3 py-2' : 'bg-pistachio-soft px-4 py-3'
      }`}
    >
      <p className="font-medium text-accent">{t('orderRulesTitle')}</p>
      <ul className="list-inside list-disc space-y-1 text-muted">
        <li>{t('orderRulesMin', { amount: formatPrice(B2C_MIN_ORDER_TOTAL) })}</li>
        <li>
          {t('orderRulesFreeDelivery', { amount: formatPrice(B2C_FREE_DELIVERY_THRESHOLD) })}
        </li>
      </ul>

      {belowMin ? (
        <p className="font-medium text-amber-800">
          {t('minOrderRemaining', {
            amount: formatPrice(untilMin),
            min: formatPrice(B2C_MIN_ORDER_TOTAL),
          })}
        </p>
      ) : null}

      {!belowMin && deliveryMethod === 'delivery' ? (
        freeDelivery ? (
          <p className="font-medium text-green-800">{t('freeDeliveryActive')}</p>
        ) : (
          <p className="text-muted">
            {t('paidDeliveryHint', { amount: formatPrice(untilFree) })}
          </p>
        )
      ) : null}
    </div>
  );
}
