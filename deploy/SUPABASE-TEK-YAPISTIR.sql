-- FISTIK — TEK SEFERDE YAPIŞTIR (Supabase → SQL Editor → New query → Run)

-- === 1) Küp ürün isimleri (Latin, tüm diller) ===

UPDATE products SET name_en = 'Tiramisu Cube', name_ru = 'Tiramisu Cube', name_kk = 'Tiramisu Cube', name_tr = 'Tiramisu Cube' WHERE slug = 'pack-tiramisu';
UPDATE products SET name_en = 'Strawberry Cube', name_ru = 'Strawberry Cube', name_kk = 'Strawberry Cube', name_tr = 'Strawberry Cube' WHERE slug = 'pack-strawberry-cake';
UPDATE products SET name_en = 'Crunch Cube', name_ru = 'Crunch Cube', name_kk = 'Crunch Cube', name_tr = 'Crunch Cube' WHERE slug = 'pack-crunch';
UPDATE products SET name_en = 'Lotus Cube', name_ru = 'Lotus Cube', name_kk = 'Lotus Cube', name_tr = 'Lotus Cube' WHERE slug = 'pack-lotus';
UPDATE products SET name_en = 'Cherry Cube', name_ru = 'Cherry Cube', name_kk = 'Cherry Cube', name_tr = 'Cherry Cube' WHERE slug = 'pack-cherry-brownie';
UPDATE products SET name_en = 'Pistachio Cube', name_ru = 'Pistachio Cube', name_kk = 'Pistachio Cube', name_tr = 'Pistachio Cube' WHERE slug = 'pack-pistachio-raspberry';
UPDATE products SET name_en = 'Oreo Cube', name_ru = 'Oreo Cube', name_kk = 'Oreo Cube', name_tr = 'Oreo Cube' WHERE slug = 'pack-oreo';
UPDATE products SET name_en = 'Merenga Cube', name_ru = 'Merenga Cube', name_kk = 'Merenga Cube', name_tr = 'Merenga Cube' WHERE slug = 'pack-meringue-cake';

-- === 2) B2B tabloları (zaten varsa atlanır) ===

CREATE TABLE IF NOT EXISTS b2b_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  director_name text NOT NULL DEFAULT '',
  inn text NOT NULL DEFAULT '',
  legal_address text NOT NULL DEFAULT '',
  phone text NOT NULL UNIQUE,
  phone_alt text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  terms_accepted_at timestamptz,
  discount_tier smallint NOT NULL DEFAULT 0 CHECK (discount_tier IN (0, 3, 6)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS b2b_customers_phone_idx ON b2b_customers(phone);
CREATE INDEX IF NOT EXISTS b2b_customers_is_active_idx ON b2b_customers(is_active);

CREATE TABLE IF NOT EXISTS b2b_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES b2b_customers(id) ON DELETE CASCADE,
  branch_name text NOT NULL DEFAULT '',
  address text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS b2b_branches_customer_id_idx ON b2b_branches(customer_id);

CREATE TABLE IF NOT EXISTS b2b_product_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id)
);

CREATE TABLE IF NOT EXISTS b2b_monthly_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES b2b_customers(id) ON DELETE CASCADE,
  year_month text NOT NULL,
  paid_total numeric(12, 2) NOT NULL DEFAULT 0 CHECK (paid_total >= 0),
  discount_for_next_month smallint NOT NULL DEFAULT 0 CHECK (discount_for_next_month IN (0, 3, 6)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, year_month)
);
CREATE INDEX IF NOT EXISTS b2b_monthly_stats_customer_idx ON b2b_monthly_stats(customer_id, year_month);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_channel text NOT NULL DEFAULT 'b2c';
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_channel_check;
ALTER TABLE orders ADD CONSTRAINT orders_order_channel_check CHECK (order_channel IN ('b2c', 'b2b'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS b2b_customer_id uuid REFERENCES b2b_customers(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS b2b_branch_id uuid REFERENCES b2b_branches(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percent smallint NOT NULL DEFAULT 0;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_discount_percent_check;
ALTER TABLE orders ADD CONSTRAINT orders_discount_percent_check CHECK (discount_percent >= 0 AND discount_percent <= 100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'paid'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
CREATE INDEX IF NOT EXISTS orders_order_channel_idx ON orders(order_channel);
CREATE INDEX IF NOT EXISTS orders_b2b_customer_id_idx ON orders(b2b_customer_id);

ALTER TABLE b2b_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_monthly_stats ENABLE ROW LEVEL SECURITY;
