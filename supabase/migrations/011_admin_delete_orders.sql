-- Admin panelden siparis gecmisi silme yetkisi
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
CREATE POLICY "Admin can delete orders"
  ON orders FOR DELETE
  USING (is_admin());
