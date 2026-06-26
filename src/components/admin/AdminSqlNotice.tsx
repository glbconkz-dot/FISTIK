export function AdminSqlNotice() {
  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">Sevkiyat butonları çalışmıyorsa</p>
      <p className="mt-1">
        Supabase → SQL Editor → <code className="rounded bg-amber-100 px-1">fix-order-workflow.sql</code>{' '}
        dosyasını bir kez çalıştırın. Sonra sayfayı yenileyin.
      </p>
    </div>
  );
}
