-- FISTIK — Adım 1: Şema (Supabase SQL Editor'de TEK SEFER çalıştırın)
-- Hata: "already exists" alırsanız bu dosyayı kullanın (eski policy'leri temizler)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tablolar (001 ile aynı)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ru text NOT NULL,
  name_kk text NOT NULL,
  name_en text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name_ru text NOT NULL,
  name_kk text NOT NULL,
  name_en text NOT NULL,
  description_ru text NOT NULL DEFAULT '',
  description_kk text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  image_url text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  stock_quantity integer NOT NULL DEFAULT 30 CHECK (stock_quantity >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('new', 'confirmed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  delivery_date date NOT NULL,
  delivery_time text NOT NULL,
  address text NOT NULL,
  cake_text text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10, 2) NOT NULL CHECK (total >= 0),
  locale text NOT NULL DEFAULT 'en',
  status order_status NOT NULL DEFAULT 'new',
  stock_deducted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE seq_val bigint;
BEGIN
  seq_val := nextval('order_number_seq');
  RETURN 'FST-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(seq_val::text, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid());
$$;

-- Türkçe sütunlar (005 — şimdi burada, ayrı dosya gerekmez)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_tr text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_tr text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_tr text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 30 CHECK (stock_quantity >= 0);

-- İzinler (003)
GRANT EXECUTE ON FUNCTION generate_order_number() TO anon, authenticated;

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active categories" ON categories;
DROP POLICY IF EXISTS "Admin can insert categories" ON categories;
DROP POLICY IF EXISTS "Admin can update categories" ON categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON categories;
DROP POLICY IF EXISTS "Public can read active products" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Admin can read orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can read own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;

CREATE POLICY "Public can read active categories" ON categories FOR SELECT
  USING (is_active = true OR is_admin());
CREATE POLICY "Admin can insert categories" ON categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update categories" ON categories FOR UPDATE
  USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can delete categories" ON categories FOR DELETE USING (is_admin());

CREATE POLICY "Public can read active products" ON products FOR SELECT
  USING (is_active = true OR is_admin());
CREATE POLICY "Admin can insert products" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update products" ON products FOR UPDATE
  USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can delete products" ON products FOR DELETE USING (is_admin());

CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read orders" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin can read own profile" ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
CREATE POLICY "Admin can upload product images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admin can update product images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND is_admin())
  WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admin can delete product images" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND is_admin());
