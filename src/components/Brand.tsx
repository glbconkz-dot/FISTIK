import type { CSSProperties } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getBusinessAddress, getInstagramLink, getWhatsAppLink, BUSINESS } from '@/lib/business';
import type { Locale } from '@/types';

interface LogoProps {
  className?: string;
  height?: number;
  priority?: boolean;
  variant?: 'wide' | 'square' | 'text';
}

export function Logo({
  className = '',
  height = 40,
  priority = false,
  variant = 'wide',
}: LogoProps) {
  if (variant === 'text') {
    return (
      <BrandWordmark
        className={className}
        style={{ fontSize: height ? `${height * 0.72}px` : undefined }}
      />
    );
  }

  const isSquare = variant === 'square';

  return (
    <Image
      src={isSquare ? '/logo-square.png' : '/logo.png'}
      alt="Fistik"
      width={isSquare ? height : Math.round(height * 2.8)}
      height={height}
      className={`h-auto w-auto object-contain ${className}`}
      priority={priority}
    />
  );
}

interface BrandWordmarkProps {
  className?: string;
  style?: CSSProperties;
}

export function BrandWordmark({ className = '', style }: BrandWordmarkProps) {
  return (
    <Image
      src="/logo-wordmark.png"
      alt="Fistik"
      width={651}
      height={381}
      priority
      className={`h-14 w-auto object-contain sm:h-16 md:h-[4.25rem] ${className}`}
      style={style}
    />
  );
}

interface BrandLinkProps {
  className?: string;
  logoHeight?: number;
  wordmark?: boolean;
}

export function BrandLink({
  className = '',
  logoHeight = 36,
  wordmark = false,
}: BrandLinkProps) {
  return (
    <Link href="/" className={`inline-flex shrink-0 items-center ${className}`}>
      {wordmark ? (
        <BrandWordmark className="h-14 sm:h-16 md:h-[4.25rem]" />
      ) : (
        <Logo height={logoHeight} priority />
      )}
    </Link>
  );
}

interface FooterProps {
  locale: Locale;
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const address = getBusinessAddress(locale);

  return (
    <footer className="mt-20 border-t border-border bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <BrandWordmark className="h-12 sm:h-14" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{t('tagline')}</p>
          </div>

          <div className="text-sm leading-relaxed text-foreground/90">
            <p className="font-semibold">{address.legalName}</p>
            <p className="text-muted">
              {address.idLabel} {BUSINESS.bin}
            </p>
            {address.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="mt-2">
              {t('phone')}:{' '}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                {BUSINESS.phone}
              </a>
            </p>
            <p className="mt-2">
              <a
                href={getInstagramLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-2 hover:underline"
              >
                {t('instagramCta')}
              </a>
              <span className="text-muted"> @{BUSINESS.instagram.handle}</span>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} Fistik ·{' '}
          <Link href="/about" className="underline-offset-2 hover:text-foreground hover:underline">
            {t('aboutLink')}
          </Link>
          {' · '}
          <Link href="/contact" className="underline-offset-2 hover:text-foreground hover:underline">
            {t('contactLink')}
          </Link>
          {' · '}
          <NextLink
            href="/admin/login"
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            {t('adminLink')}
          </NextLink>
        </p>
      </div>
    </footer>
  );
}
