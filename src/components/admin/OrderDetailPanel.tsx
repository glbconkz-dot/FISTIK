'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { Order } from '@/types';
import { AdminActionModal } from '@/components/admin/AdminActionModal';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { adminDateLocaleTag } from '@/lib/admin-messages';
import { getCurrentAlmatyTimeValue, getCancelReason, getCustomerNotes } from '@/lib/order-admin';
import { formatOrderDateTime, formatDeliveryTimeLabel } from '@/lib/order-dates';
import { formatPrice } from '@/lib/utils';
import { performOrderAction } from '@/app/actions/orders';
import { setB2BOrderPaymentStatus } from '@/app/actions/b2b-orders-admin';
import { isB2BOrder } from '@/lib/b2b/order-filter';
import { OrderChannelBadge, B2BPaymentBadge } from '@/components/admin/OrderChannelBadge';

interface OrderDetailPanelProps {
  order: Order;
  onOrderChange?: (order: Order) => void;
}

type ModalKind = 'confirm' | 'ship' | 'cancel' | null;

export function OrderDetailPanel({ order: initialOrder, onOrderChange }: OrderDetailPanelProps) {
  const router = useRouter();
  const { t, locale } = useAdminLocale();
  const dateLocale = adminDateLocaleTag(locale);
  const [order, setOrder] = useState(initialOrder);
  const [modal, setModal] = useState<ModalKind>(null);
  const [timeValue, setTimeValue] = useState(getCurrentAlmatyTimeValue());
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const applyPatch = (patch: Partial<Order>) => {
    const next = { ...order, ...patch };
    setOrder(next);
    onOrderChange?.(next);
  };

  const runAction = (action: Parameters<typeof performOrderAction>[0]) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await performOrderAction(action);

      if (!result.success) {
        const errors: Record<string, string> = {
          insufficientStock: t('ordersErrorInsufficientStock'),
          invalidDeliveryTime: t('ordersErrorInvalidDeliveryTime'),
          invalidShipTime: t('ordersErrorInvalidShipTime'),
          cancelReasonRequired: t('ordersErrorCancelReasonRequired'),
          mustShipFirst: t('ordersErrorMustShipFirst'),
          invalidTransition: t('ordersErrorInvalidTransition'),
          runOrderMigration: t('ordersErrorRunMigration'),
        };
        setError(errors[result.error ?? ''] ?? result.error ?? t('ordersErrorGeneric'));
        return;
      }

      if (result.order) applyPatch(result.order);
      setModal(null);
      setCancelReason('');
      if (result.migrationNeeded) {
        setNotice(t('ordersNoticeMigration'));
      }
      router.refresh();
    });
  };

  const openModal = (kind: ModalKind) => {
    setTimeValue(getCurrentAlmatyTimeValue());
    setError(null);
    setModal(kind);
  };

  const items = Array.isArray(order.items) ? order.items : [];
  const savedCancelReason = getCancelReason(order);
  const customerNotes = getCustomerNotes(order);
  const b2b = isB2BOrder(order);
  const isPaid = order.payment_status === 'paid';

  const togglePayment = (status: 'paid' | 'pending') => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await setB2BOrderPaymentStatus(order.id, status);
      if (!result.success) {
        const errors: Record<string, string> = {
          notB2B: t('ordersErrorNotB2b'),
          notFound: t('ordersErrorNotFound'),
          saveFailed: t('ordersErrorSaveFailed'),
          unauthorized: t('unauthorized'),
        };
        setError(errors[result.error ?? ''] ?? t('ordersErrorGeneric'));
        return;
      }
      if (result.order) applyPatch(result.order);
      setNotice(status === 'paid' ? t('ordersNoticePaid') : t('ordersNoticeUnpaid'));
      router.refresh();
    });
  };

  return (
    <>
      <div className="luxury-card space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold">#{order.order_number}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <OrderChannelBadge order={order} />
            <B2BPaymentBadge order={order} />
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {b2b && order.b2b_company_name ? (
          <p className="text-sm font-medium text-accent">{order.b2b_company_name}</p>
        ) : null}

        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted">{t('ordersFieldPlacedAt')}</dt>
            <dd className="font-medium">{formatOrderDateTime(order.created_at, dateLocale)}</dd>
          </div>
          {order.confirmed_at ? (
            <div>
              <dt className="text-muted">{t('ordersFieldConfirmedAt')}</dt>
              <dd className="font-medium">
                {formatOrderDateTime(order.confirmed_at, dateLocale)}
              </dd>
            </div>
          ) : null}
          {order.shipped_at ? (
            <div>
              <dt className="text-muted">{t('ordersFieldShippedAt')}</dt>
              <dd className="font-medium">{formatOrderDateTime(order.shipped_at, dateLocale)}</dd>
            </div>
          ) : null}
          {order.completed_at ? (
            <div>
              <dt className="text-muted">{t('ordersFieldCompletedAt')}</dt>
              <dd className="font-medium">
                {formatOrderDateTime(order.completed_at, dateLocale)}
              </dd>
            </div>
          ) : null}
          {order.cancelled_at ? (
            <div>
              <dt className="text-muted">{t('ordersFieldCancelledAt')}</dt>
              <dd className="font-medium">
                {formatOrderDateTime(order.cancelled_at, dateLocale)}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted">{t('ordersFieldCustomer')}</dt>
            <dd className="font-medium">{order.customer_name}</dd>
          </div>
          <div>
            <dt className="text-muted">{t('ordersFieldPhone')}</dt>
            <dd>
              <a href={`tel:${order.phone}`} className="font-medium text-accent underline">
                {order.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted">{t('ordersFieldDeliveryDate')}</dt>
            <dd className="font-medium">{order.delivery_date}</dd>
          </div>
          <div>
            <dt className="text-muted">{t('ordersFieldDeliveryTime')}</dt>
            <dd className="font-medium tabular-nums">
              {formatDeliveryTimeLabel(order.delivery_time)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">{t('ordersFieldAddress')}</dt>
            <dd>{order.address}</dd>
          </div>
          {order.cake_text ? (
            <div>
              <dt className="text-muted">{t('ordersFieldCakeText')}</dt>
              <dd>{order.cake_text}</dd>
            </div>
          ) : null}
          {customerNotes ? (
            <div>
              <dt className="text-muted">{t('ordersFieldNotes')}</dt>
              <dd>{customerNotes}</dd>
            </div>
          ) : null}
          {savedCancelReason ? (
            <div>
              <dt className="text-muted">{t('ordersFieldCancelReason')}</dt>
              <dd className="font-medium text-red-700">{savedCancelReason}</dd>
            </div>
          ) : null}
        </dl>

        <div>
          <p className="mb-2 text-sm font-medium">{t('ordersProducts')}</p>
          <ul className="space-y-1 text-sm">
            {items.map((item, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          {b2b && order.subtotal != null && Number(order.discount_percent) > 0 ? (
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between text-muted">
                <span>{t('ordersSubtotal')}</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>
                  {t('ordersDiscount')} ({order.discount_percent}%)
                </span>
                <span>−{formatPrice(Number(order.subtotal) - Number(order.total))}</span>
              </div>
            </div>
          ) : null}
          <p className="mt-2 font-semibold text-accent">
            {t('ordersTotal')} {formatPrice(Number(order.total))}
          </p>
          {b2b && order.paid_at ? (
            <p className="mt-1 text-xs text-green-700">
              {t('ordersPaymentAt')} {formatOrderDateTime(order.paid_at, dateLocale)}
            </p>
          ) : null}
        </div>

        {b2b ? (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium">{t('ordersB2bPayment')}</p>
            <p className="text-xs text-muted">{t('ordersB2bPaymentHint')}</p>
            {isPaid ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => togglePayment('pending')}
                className="btn-outline w-full border-amber-300 text-amber-900"
              >
                {t('ordersUnmarkPaid')}
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => togglePayment('paid')}
                className="btn-primary w-full"
              >
                {t('ordersMarkPaid')}
              </button>
            )}
          </div>
        ) : null}

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium">{t('ordersActions')}</p>

          {order.status === 'new' && (
            <>
              <p className="text-xs text-muted">
                {b2b ? t('ordersHintNewB2b') : t('ordersHintNewB2c')}
              </p>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('confirm')}
                className="btn-primary w-full py-3 text-base"
              >
                {t('ordersConfirmBtn')}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('cancel')}
                className="btn-outline w-full border-red-300 text-red-700"
              >
                {t('ordersCancelBtn')}
              </button>
            </>
          )}

          {order.status === 'confirmed' && (
            <>
              <p className="text-xs text-muted">{t('ordersHintConfirmed')}</p>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('ship')}
                className="btn-primary w-full"
              >
                {t('ordersShipBtn')}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('cancel')}
                className="btn-outline w-full border-red-300 text-red-700"
              >
                {t('ordersCancelBtn')}
              </button>
            </>
          )}

          {order.status === 'shipped' && (
            <>
              <p className="text-xs text-muted">{t('ordersHintShipped')}</p>
              <button
                type="button"
                disabled={isPending}
                onClick={() => runAction({ orderId: order.id, action: 'complete' })}
                className="btn-primary w-full"
              >
                {isPending ? t('ordersSaving') : t('ordersCompleteBtn')}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('cancel')}
                className="btn-outline w-full border-red-300 text-red-700"
              >
                {t('ordersCancelBtn')}
              </button>
            </>
          )}

          {order.status === 'completed' && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
              {t('ordersCompletedNotice')}
            </p>
          )}

          {order.status === 'cancelled' && (
            <div className="space-y-2">
              {savedCancelReason ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  <span className="font-semibold">{t('ordersCancelReasonLabel')}</span>{' '}
                  {savedCancelReason}
                </p>
              ) : (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {t('ordersCancelledNoReason')}
                </p>
              )}
            </div>
          )}

          {notice ? <p className="text-sm text-amber-700">{notice}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </div>

      <AdminActionModal
        open={modal === 'confirm'}
        title={t('ordersModalConfirmTitle')}
        description={t('ordersModalConfirmDesc')}
        label={t('ordersModalConfirmLabel')}
        inputType="time"
        value={timeValue}
        onChange={setTimeValue}
        onClose={() => setModal(null)}
        onSubmit={() =>
          runAction({ orderId: order.id, action: 'confirm', deliveryTime: timeValue })
        }
        submitLabel={t('ordersModalConfirmSubmit')}
        pending={isPending}
      />

      <AdminActionModal
        open={modal === 'ship'}
        title={t('ordersModalShipTitle')}
        description={t('ordersModalShipDesc')}
        label={t('ordersModalShipLabel')}
        inputType="time"
        value={timeValue}
        onChange={setTimeValue}
        onClose={() => setModal(null)}
        onSubmit={() => runAction({ orderId: order.id, action: 'ship', shipTime: timeValue })}
        submitLabel={t('ordersModalShipSubmit')}
        pending={isPending}
      />

      <AdminActionModal
        open={modal === 'cancel'}
        title={t('ordersModalCancelTitle')}
        description={t('ordersModalCancelDesc')}
        label={t('ordersModalCancelLabel')}
        inputType="textarea"
        placeholder={t('ordersModalCancelPlaceholder')}
        value={cancelReason}
        onChange={setCancelReason}
        onClose={() => setModal(null)}
        onSubmit={() =>
          runAction({ orderId: order.id, action: 'cancel', reason: cancelReason })
        }
        submitLabel={t('ordersModalCancelSubmit')}
        pending={isPending}
      />
    </>
  );
}
