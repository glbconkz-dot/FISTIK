/** Browser-side helpers for admin product image upload (bypasses Vercel body limits). */

const MAX_EDGE = 1800;
const JPEG_QUALITY = 0.82;
const SKIP_COMPRESS_UNDER_BYTES = 900_000;

function isHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return (
    type.includes('heic') ||
    type.includes('heif') ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Resim okunamadı. JPEG veya PNG deneyin.'));
    };
    img.src = url;
  });
}

/** Resize / recompress so uploads stay under Supabase bucket + network limits. */
export async function compressImageForAdmin(file: File): Promise<File> {
  if (isHeic(file)) {
    throw new Error(
      'iPhone HEIC desteklenmiyor. Fotoğrafı JPEG olarak kaydedip tekrar yükleyin.'
    );
  }

  if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
    throw new Error('Sadece resim dosyası yükleyin (JPEG, PNG, WebP).');
  }

  if (
    file.size <= SKIP_COMPRESS_UNDER_BYTES &&
    (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')
  ) {
    return file;
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tarayıcı resim işleyemedi');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Resim sıkıştırılamadı'))),
      'image/jpeg',
      JPEG_QUALITY
    );
  });

  const base = file.name.replace(/\.[^.]+$/, '') || 'product';
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}

export function friendlyUploadError(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : 'Yükleme başarısız';

  const msg = raw.toLowerCase();

  if (
    msg.includes('body') ||
    msg.includes('payload') ||
    msg.includes('413') ||
    msg.includes('too large') ||
    msg.includes('entity too large') ||
    msg.includes('request entity')
  ) {
    return 'Dosya çok büyük (Vercel limiti). Daha küçük JPEG deneyin veya sayfayı yenileyip tekrar deneyin.';
  }
  if (msg.includes('bucket not found') || msg.includes('product-images')) {
    return 'Supabase Storage: product-images bucket eksik veya erişilemiyor.';
  }
  if (msg.includes('unauthorized') || msg.includes('jwt') || msg.includes('session')) {
    return 'Oturum süresi dolmuş olabilir. Admin’e tekrar giriş yapın.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Ağ hatası. Bağlantıyı kontrol edip tekrar deneyin.';
  }
  if (msg.includes('mime') || msg.includes('not allowed')) {
    return 'Bu dosya tipi kabul edilmiyor. JPEG veya PNG kullanın.';
  }

  return raw;
}
