-- ============================================
-- Migration: Add INSERT policy for profiles
-- ============================================
-- This migration adds the missing INSERT policy for the profiles table
-- to allow users to create their own profile during signup

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create INSERT policy for profiles
-- Users can insert their own profile (where the id matches their auth.uid())
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Users can now insert their own profile during signup

