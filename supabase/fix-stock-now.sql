-- FISTIK — TEK SEFER: stok sütunu + 30 adet + sipariş onay fonksiyonları
-- Supabase → SQL Editor → New query → yapıştır → Run

-- 1) Stok sütunu
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 30
  CHECK (stock_quantity >= 0);

CREATE INDEX IF NOT EXISTS products_stock_quantity_idx ON products (stock_quantity);

-- 2) Tüm ürünleri 30 adet yap
UPDATE products SET stock_quantity = 30;

-- 3) Sipariş stok takibi
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stock_deducted boolean NOT NULL DEFAULT false;

-- 4) Checkout: sadece kontrol (stok düşürmez)
CREATE OR REPLACE FUNCTION check_order_stock(order_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  pid uuid;
  qty integer;
  current_stock integer;
BEGIN
  IF order_items IS NULL OR jsonb_array_length(order_items) = 0 THEN
    RAISE EXCEPTION 'empty_cart';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(order_items) AS t(value)
  LOOP
    pid := (item->>'productId')::uuid;
    qty := COALESCE((item->>'quantity')::integer, 0);
    IF qty <= 0 THEN RAISE EXCEPTION 'invalid_quantity'; END IF;
    SELECT stock_quantity INTO current_stock FROM products WHERE id = pid AND is_active = true;
    IF NOT FOUND THEN RAISE EXCEPTION 'product_unavailable'; END IF;
    IF current_stock < qty THEN RAISE EXCEPTION 'insufficient_stock'; END IF;
  END LOOP;
END;
$$;

-- 5) Admin onayında stok düşür
CREATE OR REPLACE FUNCTION deduct_order_stock(order_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  pid uuid;
  qty integer;
  current_stock integer;
BEGIN
  IF order_items IS NULL OR jsonb_array_length(order_items) = 0 THEN
    RAISE EXCEPTION 'empty_cart';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(order_items) AS t(value)
  LOOP
    pid := (item->>'productId')::uuid;
    qty := COALESCE((item->>'quantity')::integer, 0);
    IF qty <= 0 THEN RAISE EXCEPTION 'invalid_quantity'; END IF;
    SELECT stock_quantity INTO current_stock FROM products WHERE id = pid AND is_active = true FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'product_unavailable'; END IF;
    IF current_stock < qty THEN RAISE EXCEPTION 'insufficient_stock'; END IF;
  END LOOP;
  FOR item IN SELECT value FROM jsonb_array_elements(order_items) AS t(value)
  LOOP
    UPDATE products SET stock_quantity = stock_quantity - COALESCE((item->>'quantity')::integer, 0)
    WHERE id = (item->>'productId')::uuid;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION fulfill_order_stock(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE o orders%ROWTYPE;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order_not_found'; END IF;
  IF o.stock_deducted THEN RETURN; END IF;
  PERFORM deduct_order_stock(o.items);
  UPDATE orders SET stock_deducted = true WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION restore_order_stock(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE o orders%ROWTYPE;
DECLARE item jsonb;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT * INTO o FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR NOT o.stock_deducted THEN RETURN; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(o.items) AS t(value)
  LOOP
    UPDATE products SET stock_quantity = stock_quantity + COALESCE((item->>'quantity')::integer, 0)
    WHERE id = (item->>'productId')::uuid;
  END LOOP;
  UPDATE orders SET stock_deducted = false WHERE id = p_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION check_order_stock(jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION fulfill_order_stock(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION restore_order_stock(uuid) TO authenticated, service_role;

DROP FUNCTION IF EXISTS reserve_order_stock(jsonb);
