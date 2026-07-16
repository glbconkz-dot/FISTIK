# FISTIK — Luxury Bakery Ordering System

Mobile-first bakery catalog and ordering app with WhatsApp checkout, built with Next.js 15, Supabase, and next-intl (KK / TR / RU / EN).

## Business

**Fistik** — Almaty (satış) & Kaskelen (üretim)

| | |
|---|---|
| **Phone / WhatsApp** | +7 778 268 17 55 |
| **BIN / BSN** | 150640023753K3 |
| **Satış şubesi (Almaty)** | A15G7D2, ул. Ауэзова 84, текстильная улица 69 |
| **Üretim (Kaskelen)** | 050900 Алматинская обл., Карасайский р-н, г. Каскелен, ул. Карасай Батыра 7А |

Brand colors: pistachio green `#b8c97d`, chocolate brown `#4a2c11`. Logo files: `public/logo.png`, `public/logo-square.png`.

## Features

- **Public storefront**: product catalog, product details, cart, checkout
- **WhatsApp orders**: saves order to Supabase, then redirects to WhatsApp with a formatted message
- **Admin panel**: secure login, dashboard, product CRUD, order management
- **Multilingual**: Kazakh, Turkish, Russian, English (UI + product content)

## Quick Start

### 1. Install dependencies

```bash
cd fistik
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a **new project** for FISTIK
2. Open **SQL Editor** and run migrations **in this order**:
   - `supabase/migrations/001_fistik_schema.sql`
   - `supabase/migrations/005_add_turkish.sql`
   - `supabase/migrations/003_grants.sql`
   - `supabase/migrations/004_full_menu.sql`

   See **`KURULUM.md`** (Turkish) for full Supabase + Vercel setup.

### 3. Configure environment

```bash
copy .env.example .env.local
```

Fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number with country code (no `+`) |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default locale (`ru`) |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | Currency symbol (e.g. `₸`) |

### 4. Create an admin user

1. In Supabase Dashboard → **Authentication** → **Users** → **Add user** (email + password)
2. Copy the user's UUID
3. Run in SQL Editor:

```sql
INSERT INTO admin_profiles (id, full_name)
VALUES ('YOUR-USER-UUID', 'Admin Name');
```

### 5. Run the dev server

```bash
npm run dev
```

- Storefront: [http://localhost:3000/en](http://localhost:3000/en)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Project Structure

```
fistik/
├── messages/          # en.json, ru.json, kk.json
├── supabase/migrations/
├── src/
│   ├── app/
│   │   ├── [locale]/  # Public pages
│   │   └── admin/     # Admin panel
│   ├── components/
│   ├── lib/
│   └── stores/
```

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL, Auth, Storage)
- next-intl
- Zustand (cart)
- react-hook-form + Zod

## Deployment

Deploy to [Vercel](https://vercel.com) and set the same environment variables as `.env.local`.

- If the repo root is the monorepo, set **Root Directory** to `fistik`.
- After deploy, add your Vercel URL in Supabase → Authentication → URL Configuration.

**Step-by-step (TR):** `KURULUM.md`

Verify local env: `npm run check:env`

## License

Private — FISTIK Bakery
