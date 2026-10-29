-- =============================================================================
-- FISTIK B2B — TAM KURULUM (Supabase SQL Editor'a tek seferde yapıştırın)
-- Dosya: supabase/b2b-kurulum-tam.sql
-- Güvenli: IF NOT EXISTS / ADD COLUMN IF NOT EXISTS — tekrar çalıştırılabilir
-- =============================================================================

-- B2B wholesale channel: customers, branches, prices, order extensions

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
ALTER TABLE orders ADD CONSTRAINT orders_order_channel_check
  CHECK (order_channel IN ('b2c', 'b2b'));

ALTER TABLE orders ADD COLUMN IF NOT EXISTS b2b_customer_id uuid REFERENCES b2b_customers(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS b2b_branch_id uuid REFERENCES b2b_branches(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percent smallint NOT NULL DEFAULT 0;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_discount_percent_check;
ALTER TABLE orders ADD CONSTRAINT orders_discount_percent_check
  CHECK (discount_percent >= 0 AND discount_percent <= 100);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid'));

ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE INDEX IF NOT EXISTS orders_order_channel_idx ON orders(order_channel);
CREATE INDEX IF NOT EXISTS orders_b2b_customer_id_idx ON orders(b2b_customer_id);

ALTER TABLE b2b_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_monthly_stats ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DOĞRULAMA — aşağıdaki sorgu 4 satır döndürmeli (tablo adları)
-- =============================================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'b2b_customers',
    'b2b_branches',
    'b2b_product_prices',
    'b2b_monthly_stats'
  )
ORDER BY table_name;

-- orders B2B kolonları:
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN (
    'order_channel',
    'b2b_customer_id',
    'b2b_branch_id',
    'discount_percent',
    'subtotal',
    'payment_status',
    'paid_at'
  )
ORDER BY column_name;
