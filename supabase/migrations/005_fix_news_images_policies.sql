-- ============================================
-- Fix news-images Bucket Policies
-- ============================================
-- This script specifically fixes the news-images bucket policies
-- Run this if announcements are still not uploading

-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-images',
  'news-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================
-- Drop existing policies for news-images (if any)
-- ============================================
DROP POLICY IF EXISTS "Public read access for news-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to news-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files in news-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files in news-images" ON storage.objects;

-- ============================================
-- Create explicit policies for news-images
-- ============================================

-- Public read access (anyone can view)
CREATE POLICY "Public read access for news-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');

-- Authenticated users can upload (any authenticated user)
CREATE POLICY "Authenticated users can upload to news-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news-images' 
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update (any authenticated user can update any file)
CREATE POLICY "Authenticated users can update in news-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'news-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'news-images' 
  AND auth.role() = 'authenticated'
);

-- Users can delete (any authenticated user, or admin)
CREATE POLICY "Users can delete in news-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'news-images' 
  AND (
    auth.role() = 'authenticated'
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND is_verified = true
    )
  )
);

-- ============================================
-- Verify policies were created
-- ============================================
-- You can run this query to verify:
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND schemaname = 'storage'
-- AND policyname LIKE '%news-images%';

