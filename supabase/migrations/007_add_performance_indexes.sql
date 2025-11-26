-- ============================================
-- Add Performance Indexes
-- ============================================
-- This migration adds database indexes to improve query performance

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);

-- Community messages table indexes
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at DESC);

-- Announcements table indexes  
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_featured_published ON announcements(featured, published, created_at DESC);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(first_name, last_name);

-- Assistance requests table indexes
CREATE INDEX IF NOT EXISTS idx_assistance_requests_status_created ON assistance_requests(status, created_at DESC);

-- Contact inquiries table indexes
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status_created ON contact_inquiries(status, created_at DESC);

-- Add comments for documentation
COMMENT ON INDEX idx_messages_created_at IS 'Improves message list sorting performance';
COMMENT ON INDEX idx_messages_conversation IS 'Optimizes conversation queries between two users';
COMMENT ON INDEX idx_community_messages_created_at IS 'Improves community chat message sorting';
COMMENT ON INDEX idx_announcements_featured_published IS 'Optimizes featured announcements queries';
