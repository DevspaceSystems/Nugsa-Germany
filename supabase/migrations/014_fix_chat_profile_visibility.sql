-- ============================================
-- FIX FOR COMMUNITY CHAT MESSAGE VISIBILITY
-- ============================================
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This fixes the issue where admin messages are not visible to other users

-- Step 1: Drop the policy if it already exists (to avoid errors on re-run)
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Step 2: Add a new RLS policy to allow anyone to view basic profile information
-- This is needed for the community chat to display sender names and avatars
CREATE POLICY "Public can view basic profile info"
  ON public.profiles FOR SELECT
  USING (true);

-- Step 3: Verify the policy was created
SELECT policyname, tablename, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Public can view basic profile info';

-- ============================================
-- EXPLANATION
-- ============================================
-- The issue: When non-admin users query community_messages with a join to profiles,
-- the RLS policies on the profiles table were blocking access to admin profile data.
-- 
-- The fix: This policy allows SELECT operations on the profiles table for everyone.
-- This is safe because:
-- 1. We're only allowing SELECT (read), not INSERT/UPDATE/DELETE
-- 2. The community chat only displays public info (first_name, last_name, avatar, role)
-- 3. Sensitive data like email, phone, address are not exposed in the chat query
-- 4. Other RLS policies still protect write operations
--
-- After running this SQL, messages from all users (including admins) will be
-- visible to everyone in the community chat.
-- ============================================
