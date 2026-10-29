# Yönetici iPhone app — kurulum ve dağıtım

Sistem çalışıyor: sipariş → Expo Push → iPhone; liste `https://fistik.kz/api/manager/*`.

## Önemli gerçek (iPhone)

Apple’da **App Store’suz, sınırsız, herkese linkle kur** diye bir yol **yok**.
Seçenekler:

| Yol | App Store? | Kim kurar | Süre | Zorluk |
|-----|------------|-----------|------|--------|
| **TestFlight (Internal)** | Hayır (mağaza yok) | Davetli yöneticiler | Build ~90 gün | En kolay — şu anki |
| **Ad Hoc (EAS Internal)** | Hayır | Sadece kayıtlı iPhone’lar | Profil ~1 yıl | Orta — her cihaz UDID |
| **Enterprise** | Hayır | Şirket cihazları | Uzun | Ağır, ayrı Apple programı |
| **Public App Store** | Evet | Herkes | Sürekli | Review, ağır |

**Mağaza prosedürü şart değil.** TestFlight Internal / Ad Hoc yeterli.

---

## Önerilen: TestFlight Internal (sabitle)

- Mağazaya çıkmaz, müşteri görmez.
- 2–3 yönetici için en az sürtünme.
- Build ~**90 gün** geçerli. Bitmeden önce yenile:

```powershell
cd C:\Users\okan\Desktop\project\fistik-orders
npx eas-cli build --platform ios --profile production --auto-submit
```

### 90 gün hatırlatma
- Takvim: her build tarihinden **~80. günde** “Fistik TestFlight yenile”
- Son bilinen production build: App Store Connect → TestFlight → build numarası / expiry
- Komut hazır; kod değişmese bile yeni build yeter

TestFlight’ta güncelle → devam.

---

## Alternatif: Ad Hoc — TestFlight’sız kurulum

Link/QR ile kurulum; **TestFlight uygulaması gerekmez**.
Her yönetici iPhone’unun **UDID**’si Apple Developer’a eklenmeli.

### 1) UDID al (her telefon)

iPhone → Ayarlar → Genel → Bilgi → **Tanımlayıcı (UDID)**  
veya Mac’te Finder / Apple Configurator.

### 2) Cihazları kaydet + Ad Hoc build

```powershell
cd C:\Users\okan\Desktop\project\fistik-orders
npx eas-cli device:create
npx eas-cli build --platform ios --profile preview
```

Bitince Expo sayfasında **Install** linki / QR çıkar.
Yöneticiler Safari’den açıp kurar (ilk seferde “Güven” ayarı gerekebilir).

Yeni telefon eklenince: UDID kaydı → **yeniden Ad Hoc build**.

---

## Backend (zaten canlı)

1. Supabase: `026_admin_device_tokens.sql`
2. Vercel: `MANAGER_APP_SECRET` (= app’teki anahtar)
3. Sipariş sonrası push: `scheduleManagerOrderPush` → Expo

App env (`eas.json` production/preview):

- `EXPO_PUBLIC_API_URL=https://fistik.kz`
- `EXPO_PUBLIC_MANAGER_SECRET` = Vercel `MANAGER_APP_SECRET`

Senkron:

```powershell
cd C:\Users\okan\Desktop\project\fistik-orders
node scripts/sync-manager-app-env.mjs
```

---

## Akış

Sipariş (B2C/B2B) → DB → push → kayıtlı iPhone  
App → `GET /api/manager/orders` (en yeni üstte) + token yenileme

## Karar

- **Az yönetici, az uğraş** → TestFlight Internal + 90 günde bir build  
- **TestFlight istemiyorum** → Ad Hoc (UDID listesi gerekli)

Hangisini istediğini söyle; Ad Hoc profilini cihazlarla birlikte kurarız.
