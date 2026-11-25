# Fıstık sipariş uyarısı (iOS)

Yönetici iPhone uygulaması. Yeni B2C/B2B siparişte push gelir; liste `https://fistik.kz/api/manager/*` üzerinden okunur.

## TestFlight

```bash
cd fistik-orders
npx eas-cli build --platform ios --profile production --auto-submit --non-interactive
```

Gerekli ortam:

- `EXPO_TOKEN` — expo.dev → Access tokens
- `EXPO_PUBLIC_MANAGER_SECRET` — Vercel `MANAGER_APP_SECRET` ile aynı
- Apple / EAS credentials (önceki projede kayıtlıysa token yeter)

Build bitince App Store Connect → TestFlight Internal testers.
