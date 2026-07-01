import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface BackToMenuBannerProps {
  title: string;
  linkLabel: string;
}

export function BackToMenuBanner({ title, linkLabel }: BackToMenuBannerProps) {
  return (
    <div className="luxury-card mb-6 border-dashed bg-brand/20 px-4 py-4 text-center">
      <p className="font-display text-xl text-foreground">{title}</p>
      <Link
        href="/menu"
        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-2 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {linkLabel}
      </Link>
    </div>
  );
}
