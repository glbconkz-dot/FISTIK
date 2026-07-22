-- Raise product-images bucket limit (phone photos often exceed 5MB before compress).
-- Run once in Supabase SQL Editor if uploads still fail with size errors.

UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10 MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'product-images';
