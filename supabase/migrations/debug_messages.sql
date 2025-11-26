-- Quick fix for messages not showing
-- Run this in Supabase SQL Editor

-- 1. Check current verification status of users
SELECT id, email, first_name, last_name, is_verified, role
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 2. If users are not verified, uncomment and run this to verify ALL users:
-- UPDATE profiles SET is_verified = true WHERE is_verified = false;

-- 3. Check if messages table has the images column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 4. Add images column if missing
ALTER TABLE messages ADD COLUMN IF NOT EXISTS images TEXT;

-- 5. Check if there are any messages in the database
SELECT 
  m.id,
  m.content,
  m.created_at,
  sender.email as sender_email,
  recipient.email as recipient_email
FROM messages m
LEFT JOIN profiles sender ON m.sender_id = sender.id
LEFT JOIN profiles recipient ON m.recipient_id = recipient.id
ORDER BY m.created_at DESC
LIMIT 10;

-- 6. Check RLS policies on messages table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'messages';
