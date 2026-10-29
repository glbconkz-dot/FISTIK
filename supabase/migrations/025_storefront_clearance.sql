-- Time-window clearance sales (acil satış) for B2C storefront

CREATE TABLE IF NOT EXISTS storefront_clearance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  discount_percent smallint NOT NULL CHECK (discount_percent BETWEEN 1 AND 90),
  start_time time NOT NULL DEFAULT '16:00',
  end_time time NOT NULL DEFAULT '23:59',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS storefront_clearance_slug_idx ON storefront_clearance(product_slug);
CREATE INDEX IF NOT EXISTS storefront_clearance_active_idx ON storefront_clearance(is_active, sort_order);

ALTER TABLE storefront_clearance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read storefront_clearance"
  ON storefront_clearance FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admin manage storefront_clearance"
  ON storefront_clearance FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
