# FISTIK — Supabase + Vercel Kurulum Rehberi

Bu rehber sipariş kaydı, admin paneli ve telefondan canlı erişim için gereken adımları anlatır.

**Tahmini süre:** 30–45 dakika  
**Maliyet:** Supabase Free + Vercel Free (başlangıç için yeterli)

---

## Bölüm 1 — Supabase (veritabanı)

### 1.1 Proje oluştur

1. [supabase.com](https://supabase.com) → giriş yapın → **New project**
2. Proje adı: `fistik` (veya istediğiniz)
3. Database password: güçlü bir şifre kaydedin
4. Region: **Frankfurt** veya size en yakın bölge
5. **Create project** (2–3 dk bekleyin)

### 1.2 API anahtarlarını al

**Project Settings → API**

| Alan | Nereye yazılacak |
|------|------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role key | `SUPABASE_SERVICE_ROLE_KEY` (sadece sunucu; paylaşmayın) |

### 1.3 SQL migration’ları çalıştır

**Kolay yol (önerilen):** SQL Editor’de **2 dosya**, bu sırayla:

| Sıra | Dosya | Ne yapar |
|------|-------|----------|
| **1** | `supabase/setup-step1.sql` | Tablolar + Türkçe sütunlar + güvenlik (tek seferde) |
| **2** | `supabase/migrations/004_full_menu.sql` | Menü (84 ürün) — büyük dosya, 1–2 dk sürebilir |
| **3** | `supabase/canli-tamamla.sql` | Stok, sipariş akışı, vitrin, kategori düzeltmeleri |
| **4** | `supabase/migrations/008_fix_localized_names.sql` | Rusça isimler |
| **5** | `supabase/fix-product-names-tr.sql` | Türkçe ürün isimleri |

Tam kontrol listesi: **`CANLI-SURUM.md`**

#### Sık SQL hataları

| Hata mesajı | Çözüm |
|-------------|--------|
| `column "name_tr" does not exist` | Önce `setup-step1.sql` çalıştırın, sonra `004` |
| `policy "..." already exists` | `setup-step1.sql` kullanın (policy’leri temizler) |
| `type "order_status" already exists` | Normal — `setup-step1.sql` devam eder |
| `004` çok uzun / timeout | SQL Editor’de tekrar Run; veya parça parça |

#### Eski 4 dosyalı yol (isteğe bağlı)

| Sıra | Dosya |
|------|-------|
| 1 | `001_fistik_schema.sql` |
| 2 | `005_add_turkish.sql` |
| 3 | `003_grants.sql` |
| 4 | `004_full_menu.sql` |

### 1.4 Admin kullanıcı

1. **Authentication → Users → Add user → Create new user**
2. E-posta + şifre girin (ör. `admin@fistik.kz`)
3. Oluşan kullanıcının **UUID**’sini kopyalayın
4. SQL Editor’de çalıştırın:

```sql
INSERT INTO admin_profiles (id, full_name)
VALUES ('BURAYA-UUID-YAPIŞTIR', 'Fistik Admin')
ON CONFLICT (id) DO NOTHING;
```

Admin giriş: `https://SITENIZ/admin/login`

---

## Bölüm 2 — Bilgisayarda `.env.local`

`.env.local` dosyasını düzenleyin (proje kökünde):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (opsiyonel, ileride scriptler için)

NEXT_PUBLIC_WHATSAPP_NUMBER=77782681755
NEXT_PUBLIC_DEFAULT_LOCALE=ru
NEXT_PUBLIC_CURRENCY_SYMBOL=₸
```

Kaydedin, dev sunucuyu **yeniden başlatın** (Ctrl+C → `npm run dev`):

```bash
cd fistik
npm run check:env
npm run dev
```

> **Önemli:** `.env.local` hâlâ `your-project.supabase.co` yazıyorsa sipariş **admin paneline kaydedilmez** ama WhatsApp yine açılır (güncel kod). Admin için mutlaka gerçek anahtarları yapıştırın.

**Test:** Sepete ürün ekleyin → checkout → WhatsApp açılmalı. Supabase ayarlıysa **Table Editor → orders** tablosunda yeni satır görünmeli.

---

## Bölüm 3 — Telefondan test (henüz Vercel yokken)

Aynı Wi‑Fi’de:

```bash
npm run dev -- -H 0.0.0.0
```

Windows’ta IP: `ipconfig` → IPv4 (ör. `192.168.1.45`)

Telefonda: `http://192.168.1.45:3000/kk`

---

## Bölüm 4 — GitHub’a yükleme

`fistik` klasörü ayrı bir repo olmalı (mevcut proje başka bir uygulamaya ait).

### Seçenek A — Yeni repo (önerilen)

1. GitHub’da yeni repo: `fistik-bakery` (private)
2. Terminal:

```bash
cd fistik
git init
git add .
git commit -m "FISTIK bakery app — initial"
git branch -M main
git remote add origin https://github.com/KULLANICI/fistik-bakery.git
git push -u origin main
```

`.env.local` **asla** commit edilmez (`.gitignore`’da).

---

## Bölüm 5 — Vercel’e yayınlama

### 5.1 Vercel hesabı

1. [vercel.com](https://vercel.com) → GitHub ile giriş
2. **Add New → Project**
3. `fistik-bakery` reposunu seçin

### 5.2 Proje ayarları

| Ayar | Değer |
|------|-------|
| Root Directory | `fistik` (repo kökünde değilse boş bırakın) |
| Framework | Next.js (otomatik) |
| Build Command | `npm run build` |
| Output | (varsayılan) |

### 5.3 Environment Variables

Vercel → Project → **Settings → Environment Variables** — `.env.local` ile aynı değerler:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_DEFAULT_LOCALE` = `ru`
- `NEXT_PUBLIC_CURRENCY_SYMBOL` = `₸`

**Deploy** → birkaç dakika sonra `https://fistik-bakery.vercel.app` benzeri bir adres alırsınız.

### 5.4 Supabase’de site adresini izinli yap

Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://SITENIZ.vercel.app`
- **Redirect URLs:** aynı adres + `https://SITENIZ.vercel.app/admin/**`

---

## Bölüm 6 — Canlıda kontrol listesi

- [ ] Ana sayfa açılıyor (`/ru`, `/tr`, `/kk`)
- [ ] Ürün görselleri yükleniyor
- [ ] Sipariş verince `orders` tablosuna kayıt düşüyor
- [ ] WhatsApp açılıyor, mesaj dolu geliyor
- [ ] `/admin/login` ile giriş yapılabiliyor
- [ ] Admin → Orders’da sipariş görünüyor

---

## Sık sorunlar

| Sorun | Çözüm |
|-------|--------|
| Sipariş hata veriyor | `.env.local` / Vercel env Supabase anahtarlarını kontrol edin |
| Admin giriş olmuyor | `admin_profiles` tablosuna UUID eklendi mi? |
| WhatsApp açılmıyor | Telefonda WhatsApp yüklü mü; numara `77782681755` formatında mı |
| Telefondan localhost açılmıyor | Aynı Wi‑Fi, `-H 0.0.0.0`, firewall 3000 portu |

---

## Özet akış (müşteri)

```
Menü → Sepet → Checkout formu
  → Supabase orders tablosuna kayıt
  → WhatsApp (778 268 17 55) hazır mesajla açılır
  → Müşteri Gönder’e basar
  → Siz admin panelden de görürsünüz
```

Sorun olursa Supabase **Logs → Postgres** ve Vercel **Deployments → Function Logs** bakın.
