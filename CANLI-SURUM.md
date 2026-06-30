# FISTIK — Canlı Sürüm Kaydı (v1.0.0)

> **Git:** `main` · tag `v1.0.0` · site: https://fistik.kz  
> **Son kod:** premium vitrin, 4 adımlı checkout, admin kategoriler/vitrin, çok dilli isimler, varsayılan dil RU

---

## 1. Supabase SQL (sırayla, bir kez)

| Sıra | Dosya | Zorunlu | Ne yapar |
|------|-------|---------|----------|
| 1 | `supabase/setup-step1.sql` | ✅ | Tablolar, RLS, admin, stok sütunu |
| 2 | `supabase/migrations/004_full_menu.sql` | ✅ | 84 ürün + 13 kategori |
| 3 | `supabase/canli-tamamla.sql` | ✅ | Stok, sipariş akışı, vitrin tablosu, kategori düzeltmeleri |
| 4 | `supabase/migrations/008_fix_localized_names.sql` | ✅ | Rusça ürün/kategori isimleri |
| 5 | `supabase/fix-product-names-tr.sql` | ✅ | Türkçe ürün isimleri |
| 6 | `supabase/fix-order-workflow.sql` | ⚠️ | `canli-tamamla` içinde varsa tekrar gerekmez |

**Kontrol:** Table Editor → `storefront_sections` (4 satır), `categories.image_url` sütunu var mı?

---

## 2. Vercel ortam değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=77782681755
NEXT_PUBLIC_DEFAULT_LOCALE=ru
NEXT_PUBLIC_CURRENCY_SYMBOL=₸
PRODUCT_DELETE_PIN=1234
```

Deploy sonrası: **Deployments → Redeploy** (env değiştiyse).

---

## 3. Müşteri sitesi — bölüm kontrol listesi

| Bölüm | URL | Beklenen |
|-------|-----|----------|
| Ana sayfa (RU varsayılan) | `/ru` | Hero, vitrin bölümleri, kategoriler, menü |
| Dil değiştirici | Header | RU / TR / KK / EN — isimler dile göre değişir |
| Kategoriler | Ana sayfa grid | Kapak foto; tıklayınca `#menu` filtresi |
| Menü | `/#menu` | Stok admin ile senkron |
| Ürün detay | `/ru/product/...` | Rusça ad, sepete ekle |
| Favoriler | `/ru/favorites` | Kalp ile kayıt (localStorage) |
| Sepet | `/ru/cart` | Dil değişince adlar güncellenir |
| Checkout 4 adım | `/ru/checkout` | Bilgi → Teslimat → Özet → WhatsApp |
| Hakkımızda | `/ru/about` | |
| İletişim | `/ru/contact` | WhatsApp + Instagram |
| Canlı katalog API | `/api/catalog` | `"source":"supabase"` |

---

## 4. Admin paneli

| Sayfa | URL | İşlev |
|-------|-----|--------|
| Giriş | `/admin/login` | Supabase auth |
| Özet | `/admin` | Dashboard |
| Ürünler | `/admin/products` | Stok, fiyat, foto, aktif/pasif |
| Kategoriler | `/admin/categories` | Ad (TR/RU/KK/EN), kapak foto, ana sayfada göster |
| Ana sayfa vitrini | `/admin/storefront` | Günün favorileri, yeni koleksiyon vb. (4’er ürün) |
| Siparişler | `/admin/orders` | Yeni → Onay → Sevkiyat → Tamamla / İptal |

---

## 5. Hızlı test (5 dk)

1. `fistik.kz/ru` — kategori **Пироги**, **Классические круглые торты** (Türkçe değil)
2. Sepete ekle → checkout → WhatsApp açılır
3. Supabase `orders` — yeni satır
4. Admin → vitrin → 1 bölüme ürün seç → Kaydet → ana sayfada görünür
5. Admin → kategoriler → kapak yükle → ana sayfa kartı güncellenir

---

## 6. Yerel geliştirme

```powershell
cd C:\Users\okan\Desktop\project\fistik
npm run check:env
npm run build
npm run dev:clean
```

Çeviri güncelleme (menü değişince):

```powershell
node scripts/sync-localized-names.mjs
```

---

## 7. Git kayıt noktası

```bash
git tag v1.0.0
git push origin main --tags
```

Bu tag: premium UI + admin vitrin + çok dil + RU varsayılan dil tam paket.
