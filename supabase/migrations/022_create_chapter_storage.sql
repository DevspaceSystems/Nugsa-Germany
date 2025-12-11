-- Create chapter-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chapter-images',
  'chapter-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access for chapter-images
CREATE POLICY "Public read access for chapter-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chapter-images');

-- Authenticated users can upload to chapter-images
CREATE POLICY "Authenticated users can upload to chapter-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chapter-images' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own files in chapter-images
CREATE POLICY "Users can update own files in chapter-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'chapter-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own files in chapter-images
CREATE POLICY "Users can delete own files in chapter-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chapter-images' 
  AND auth.role() = 'authenticated'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND is_verified = true
    )
  )
);
