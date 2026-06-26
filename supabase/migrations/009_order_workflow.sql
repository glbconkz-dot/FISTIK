-- Sipariş zaman damgaları + sevkiyat durumu
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at timestamptz;

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE 'shipped';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
