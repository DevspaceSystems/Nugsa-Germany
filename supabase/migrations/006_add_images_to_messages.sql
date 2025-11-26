-- ============================================
-- Add images column to messages table
-- ============================================
-- This migration adds support for image/video attachments in direct messages

-- Add images column to store JSON array of media URLs
ALTER TABLE messages ADD COLUMN IF NOT EXISTS images TEXT;

-- Add comment for documentation
COMMENT ON COLUMN messages.images IS 'JSON array of image/video URLs for message attachments';
