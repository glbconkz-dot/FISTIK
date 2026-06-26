-- FISTIK — Sipariş akışı (Supabase SQL Editor → TEK SEFER çalıştırın)

ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason text NOT NULL DEFAULT '';

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE 'shipped';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
