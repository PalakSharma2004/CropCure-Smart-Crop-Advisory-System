-- Remove the overly permissive public SELECT policy on crop-images bucket
DROP POLICY IF EXISTS "Public can view crop images" ON storage.objects;