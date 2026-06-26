import Image from 'next/image';
import Link from 'next/link';

interface AdminBrandProps {
  logoHeight?: number;
}

export function AdminBrand({ logoHeight = 44 }: AdminBrandProps) {
  return (
    <Link href="/admin" className="inline-flex">
      <Image
        src="/logo.png"
        alt="Fistik"
        width={Math.round(logoHeight * 2.8)}
        height={logoHeight}
        className="h-auto w-auto object-contain"
        priority
      />
    </Link>
  );
}
