-- ============================================
-- Backfill Profiles for Existing Auth Users
-- ============================================
-- This script creates profile rows for auth users that don't have profiles yet
-- Run this AFTER running the initial schema migrations (001a, 001b, 001c)

-- Insert profiles for existing auth users who don't have profiles yet
-- Defaults: role = 'student', is_verified = false
INSERT INTO public.profiles (id, email, first_name, last_name, role, is_verified, is_profile_complete)
SELECT 
  au.id,
  au.email,
  COALESCE(
    NULLIF(au.raw_user_meta_data->>'first_name', ''),
    SPLIT_PART(au.email, '@', 1),
    'User'
  ) as first_name,
  COALESCE(
    NULLIF(au.raw_user_meta_data->>'last_name', ''),
    ''
  ) as last_name,
  'student'::user_role as role,  -- Default to student
  false as is_verified,  -- Default to not verified
  false as is_profile_complete
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Optional: Set specific users as admin
-- ============================================
-- Uncomment and modify this section if you want to set specific users as admin
-- Replace 'your-admin-email@example.com' with the actual admin email

-- UPDATE public.profiles
-- SET role = 'admin'::user_role, is_verified = true
-- WHERE email = 'your-admin-email@example.com';

-- ============================================
-- Migration Complete
-- ============================================
-- All existing auth users now have profile rows
-- Default role is 'student' and is_verified is false
-- You can manually update users to admin via Supabase dashboard or SQL

