# FISTIK — Kaldığımız Yer (Devam Notları)
> Son güncelleme: 23 Haziran 2026 (akşam)

---

## Yarın sabah — ilk 3 adım

1. **Supabase SQL (henüz yapılmadıysa zorunlu):** SQL Editor → `supabase/fix-order-workflow.sql` → Run  
   - Ekler: `confirmed_at`, `shipped_at`, `completed_at`, `cancelled_at`, `cancel_reason`, `shipped` durumu  
   - Bu olmadan: onay/sevkiyat 500 verir; iptal sebebi sütuna yazılmaz (sadece `notes` yedeği)

2. **Dev sunucu:**
   ```powershell
   cd C:\Users\okan\Desktop\project\fistik
   npm run dev
   ```
   Telefondan test: `npm run dev -- -H 0.0.0.0` → `http://BILGISAYAR-IP:3000/kk`

3. **Admin akışını uçtan uca dene:** `/admin/orders`  
   Yeni → Onayla (teslim saati 14:30) → Kuryeye teslim (15:00) → Tamamla  
   Ayrı bir siparişi iptal et → sebep **İptal edilen** sekmesinde görünmeli

---

## Son oturumda bitenler (23 Haziran)

### Admin sipariş akışı (5 sekme)
| Sekme | Durum | İşlem |
|-------|--------|--------|
| Yeni sipariş | `new` | Onayla → teslim saati modal |
| Sevkiyat bekleyen | `confirmed` | Kuryeye teslim → sevkiyat saati |
| Sevkiyata verilen | `shipped` | Teslim edildi — Tamamla |
| Tamamlanan | `completed` | Salt okunur |
| İptal edilen | `cancelled` | İptal modal → kısa neden |

### İptal sebebi düzeltmesi
- Sebep hem `cancel_reason` sütununa hem `notes` içine `[İptal] ...` olarak yazılıyor
- UI `getCancelReason()` kullanıyor (sütun yoksa notes’tan okur)
- Build hatası giderildi: `OrderDetailPanel` içinde `savedCancelReason` (gösterim) vs `cancelReason` (modal state)

### Diğer
- Saatler **24 saat** formatında (AM/PM yok)
- WhatsApp mesajı form stili, sipariş saati eklendi
- Stok sadece **onay** anında düşülüyor
- `npm run build` ✅ başarılı
- Test WhatsApp: `.env.local` → `NEXT_PUBLIC_WHATSAPP_NUMBER=77014537575` (prod: `77782681755`)

---

## Projeyi başlatma

```powershell
cd C:\Users\okan\Desktop\project\fistik
npm run dev
```

- Site: http://localhost:3000/kk (veya `/tr`, `/ru`, `/en`)
- Admin: http://localhost:3000/admin/login
- Ortam kontrolü: `npm run check:env`

Telefondan (aynı Wi‑Fi): `npm run dev -- -H 0.0.0.0` → `http://BILGISAYAR-IP:3000/kk`

---

## Supabase kurulum durumu

| Adım | Durum |
|------|--------|
| Supabase projesi açıldı | ✅ |
| `supabase/setup-step1.sql` | ✅ Success (No rows returned — normal) |
| `migrations/004_full_menu.sql` | ⏳ Çalıştırılacak / kontrol edilecek |
| `.env.local` gerçek URL + anon key | ❌ Hâlâ placeholder |
| Admin kullanıcı + `admin_profiles` | ⏳ Bekliyor |

**Sıradaki 3 iş:**
1. SQL Editor → `004_full_menu.sql` → Run
2. Settings → API → URL + anon key → `.env.local`
3. Authentication → Users → admin oluştur → UUID ile `admin_profiles` INSERT

Detaylı rehber: **`KURULUM.md`**

**Not:** Supabase olmadan da menü açılır; sipariş WhatsApp’a gider. Admin paneli ve `orders` kaydı için `.env.local` şart.

---

## Tamamlananlar (son oturumlar)

### Checkout
- Telefon: `(+7)` sabit etiket + `778 268 17 55` formatı
- Silme / × ile temizleme düzeltildi
- Adres: sokak, bina, kat/daire, ek bilgi
- Teslimat saati: satış temsilcisi arayacak metni
- Sipariş: Supabase yoksa bile WhatsApp açılır (`src/app/actions/orders.ts`)

### Ürün görselleri
- 11 fotoğraf `public/products/` altına kopyalandı
- Börekler: tek resim, alt açıklama dolguya göre (et, tavuk, peynir, ıspanak…)
- Eşleme: `src/data/product-assets.json`

### Diğer
- Header wordmark, yeşil band, KZ etiketi, hero görselleri
- `supabase/setup-step1.sql` — tek dosyada şema + TR sütunları
- `npm run check:env` scripti

---

## Önemli dosyalar

| Dosya | Açıklama |
|-------|----------|
| `YARIN-DEVAM.md` | Bu dosya — kaldığımız yer |
| `KURULUM.md` | Supabase + Vercel adım adım (TR) |
| `supabase/fix-order-workflow.sql` | **Admin akışı için zorunlu** — bir kez çalıştır |
| `supabase/setup-step1.sql` | SQL adım 1 (çalıştırıldı ✅) |
| `supabase/migrations/004_full_menu.sql` | SQL adım 2 — menü |
| `.env.local` | Supabase + WhatsApp anahtarları |
| `src/app/actions/orders.ts` | Sipariş + admin confirm/ship/complete/cancel |
| `src/lib/order-admin.ts` | Sekmeler, `getCancelReason`, saat doğrulama |
| `src/components/admin/OrdersList.tsx` | 5 sekmeli sipariş listesi |
| `src/components/admin/OrderDetailPanel.tsx` | Detay + modallar |
| `src/data/menu.ts` | Yerel menü (Supabase yoksa) |
| `src/components/CheckoutForm.tsx` | Sipariş formu |

---

## Eksik fiyatlar (2500 ₸ placeholder)

Mercimekli börek, tüm yarı mamul börekler, waffle, hamburger art, mango/ferrero mousse, bento dışı klasik pastalar, tüm turtalar/piroglar — fiyat tablosu gelince `menu.ts` güncellenecek.

---

## Zikr ile aynı workspace — sorun var mı?

**Kısa cevap: Hayır — artık tamamen ayrı klasörler.**

```
project/
├── zikr/         ← ZIKR (Expo/React Native) — kendi Git reposu
├── fistik/       ← FISTIK fırın (Next.js) — kendi Git reposu
└── zikr-fistik.code-workspace
```

| Konu | Durum |
|------|--------|
| Cursor workspace | ✅ `zikr-fistik.code-workspace` ile iki ayrı kök |
| `node_modules` | ✅ Ayrı (`zikr/` ve `fistik/`) |
| Port | Zikr Expo ≠ Fistik `:3000` — çakışmaz |
| Git | ✅ İki ayrı repo (`zikr/.git`, `fistik/.git`) |

**Zikr çalışırken:** `cd zikr` → `npx expo start`  
**Fistik çalışırken:** `cd fistik` → `npm run dev`

İleride Fistik için ayrı GitHub repo (`fistik-bakery`) — `KURULUM.md` Bölüm 4.

---

## Yarın kontrol listesi

- [ ] `fix-order-workflow.sql` Supabase’de çalıştı mı?
- [ ] İptal sebebi **İptal edilen** listesinde ve detayda görünüyor mu?
- [ ] Sevkiyat butonu 500 vermiyor mu?
- [ ] Eski iptallerde sebep yoksa normal (o tarihten önce kayıt yok)
- [ ] İlk `git commit` + GitHub push (aşağıdaki Git bölümü)

---

## Git — ayrı repo (23 Haziran 2026)

Fistik **kendi Git reposu** (`fistik/.git`). Zikr ayrı klasörde (`../zikr/`).

### Yerel durum
- ✅ `git init` yapıldı, dosyalar **stage** edildi
- ⏳ Henüz **commit yok** — yarın ilk commit atılabilir
- ⏳ Stage dışı yeni dosyalar (commit önce `git add`):
  - `src/lib/order-admin.ts`, `src/lib/order-dates.ts`
  - `src/components/admin/AdminActionModal.tsx`, `AdminDashboardClient.tsx`, `AdminSqlNotice.tsx`
  - `supabase/fix-order-workflow.sql`, `fix-stock-now.sql`
  - `supabase/migrations/006–009_*.sql`

```powershell
cd C:\Users\okan\Desktop\project\fistik

# Bir kez (sadece bu repo için)
git config user.email "SIZIN@EMAIL.com"
git config user.name "Adiniz"

git commit -m "FISTIK bakery app: catalog, checkout, WhatsApp orders, admin panel"
```

### GitHub’da yeni repo

1. https://github.com/new → repo adı: **`fistik-bakery`** → **Private** → README ekleme
2. Terminal:

```powershell
cd C:\Users\okan\Desktop\project\fistik
git remote add origin https://github.com/KULLANICI/fistik-bakery.git
git push -u origin main
```

**veya** GitHub CLI (önce `gh auth login`):

```powershell
gh auth login
gh repo create fistik-bakery --private --source=. --remote=origin --push
```

### Vercel
- Import → `fistik-bakery` reposu
- Root Directory: **boş** (repo kökü zaten fistik)
- Env: `KURULUM.md` Bölüm 2

### Zikr reposu
Zikr artık `../zikr/` klasöründe — ayrı Git reposu, birbirine karışmaz.

---

## Eski not (artık geçersiz)

~~Fistik ayrı repo açılmalı~~ → **Yapıldı** (yerel `.git`); GitHub push bekliyor.

---

## Bilinen uyarılar (kritik değil)

- Next.js middleware → proxy deprecation uyarısı
- `.env.local` placeholder iken `check:env` hata verir — normal
