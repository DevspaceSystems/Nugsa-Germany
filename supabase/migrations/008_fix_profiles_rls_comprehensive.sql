-- ============================================
-- Migration: Comprehensive RLS Fix for Profiles
-- ============================================
-- This migration ensures profiles can be inserted and updated during signup
-- It also makes the trigger function more robust

-- Step 1: Ensure INSERT policy exists and is correct
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 2: Ensure UPDATE policy allows updates (should already exist, but let's make sure)
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 3: Update the trigger function to handle existing profiles gracefully
-- This prevents errors if the profile already exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Grant necessary permissions to authenticated users
-- This ensures authenticated users can work with their own profiles
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Users should now be able to insert and update their profiles during signup

