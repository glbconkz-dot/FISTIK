/**
 * Mobilde WhatsApp açma — form gönderiminde senkron tıklama en güvenilir yol.
 */
export function openWhatsAppUrl(url: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('a');
  link.href = url;
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Bazı Android tarayıcıları <a> ile açmaz — kısa gecikmeyle yedek
  window.setTimeout(() => {
    if (document.visibilityState === 'visible') {
      window.location.assign(url);
    }
  }, 400);
}
