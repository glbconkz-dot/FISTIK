'use client';

import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';
import { getOrderPhoneDisplay } from '@/lib/business';
import { getB2BWhatsAppLink } from '@/lib/b2b/whatsapp-link';

/** B2B müşteri / sipariş WhatsApp hattı — sipariş öncesi iletişim */
export function B2BContactLine() {
  const t = useTranslations('b2b.support');
  const phone = getOrderPhoneDisplay('b2b');
  const href = getB2BWhatsAppLink();

  return (
    <div className="border-b border-brand-dark/20 bg-cream/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-brand-dark">{t('label')}</p>
          <p className="text-[11px] text-muted">{t('hint')}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-brand-dark"
        >
          <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
          <span className="tabular-nums">{phone}</span>
        </a>
      </div>
    </div>
  );
}
