-- Optional gallery column for 2nd/3rd product photos (admin-managed)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';
