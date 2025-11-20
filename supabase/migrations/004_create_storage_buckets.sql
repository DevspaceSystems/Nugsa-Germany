-- ============================================
-- Create Storage Buckets and Policies
-- ============================================
-- This script creates all required storage buckets for file uploads
-- Run this AFTER running the initial schema migrations

-- ============================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================

-- Announcement images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-images',
  'news-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Board member images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'board-images',
  'board-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Constitution documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'constitution-docs',
  'constitution-docs',
  true,
  10485760, -- 10MB limit for PDFs
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Hero images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-images',
  'hero-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Profile pictures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Documents bucket (for passport documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Message images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-images',
  'message-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CREATE STORAGE POLICIES
-- ============================================

-- Public read access for all public buckets
-- Anyone can view files in public buckets
DO $$
DECLARE
  bucket_id TEXT;
BEGIN
  FOR bucket_id IN SELECT id FROM storage.buckets WHERE public = true
  LOOP
    -- Allow anyone to read from public buckets
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS "Public read access for %s"
      ON storage.objects FOR SELECT
      USING (bucket_id = %L);
    ', bucket_id, bucket_id);

    -- Allow authenticated users to upload
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS "Authenticated users can upload to %s"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = %L 
        AND auth.role() = ''authenticated''
      );
    ', bucket_id, bucket_id);

    -- Allow users to update their own uploads
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS "Users can update own files in %s"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = %L 
        AND auth.role() = ''authenticated''
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
    ', bucket_id, bucket_id);

    -- Allow users to delete their own uploads
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS "Users can delete own files in %s"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = %L 
        AND auth.role() = ''authenticated''
        AND (
          (storage.foldername(name))[1] = auth.uid()::text
          OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = ''admin''
            AND is_verified = true
          )
        )
      );
    ', bucket_id, bucket_id);
  END LOOP;
END $$;

-- Admin full access to all buckets
CREATE POLICY IF NOT EXISTS "Admins can manage all files"
ON storage.objects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND is_verified = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND is_verified = true
  )
);

-- Public read and authenticated upload for news-images (announcements)
CREATE POLICY IF NOT EXISTS "Public read access for news-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload to news-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news-images' 
  AND auth.role() = 'authenticated'
);

-- Public read and authenticated upload for board-images
CREATE POLICY IF NOT EXISTS "Public read access for board-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'board-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload to board-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'board-images' 
  AND auth.role() = 'authenticated'
);

-- Public read and authenticated upload for constitution-docs
CREATE POLICY IF NOT EXISTS "Public read access for constitution-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'constitution-docs');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload to constitution-docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'constitution-docs' 
  AND auth.role() = 'authenticated'
);

-- Public read and authenticated upload for hero-images
CREATE POLICY IF NOT EXISTS "Public read access for hero-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload to hero-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);

-- Public read and authenticated upload for profile-pictures
CREATE POLICY IF NOT EXISTS "Public read access for profile-pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY IF NOT EXISTS "Users can upload to profile-pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Private access for documents bucket
CREATE POLICY IF NOT EXISTS "Users can read own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read and authenticated upload for message-images
CREATE POLICY IF NOT EXISTS "Public read access for message-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-images');

CREATE POLICY IF NOT EXISTS "Users can upload to message-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All storage buckets have been created with proper policies
-- Admin users can manage all files
-- Authenticated users can upload to public buckets
-- Users can only manage their own files in private buckets

