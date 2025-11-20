-- ============================================
-- Verification Script
-- ============================================
-- Run this to check your current database state
-- Run BEFORE migrations to see what needs to be created
-- Run AFTER migrations to verify everything is set up

-- Check if profiles table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    ) 
    THEN '✅ Profiles table exists' 
    ELSE '❌ Profiles table does NOT exist - run migrations first!' 
  END as status;

-- Count auth users (this should always work)
SELECT 
  'Auth Users' as type,
  COUNT(*) as count,
  'Total authenticated users in your system' as description
FROM auth.users;

-- Only run these if profiles table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    -- Count profiles
    RAISE NOTICE 'Profiles table exists. Showing statistics...';
  ELSE
    RAISE NOTICE 'Profiles table does NOT exist. Run migrations first!';
  END IF;
END $$;

-- Count profiles (only if table exists)
SELECT 
  'Profiles' as type,
  COUNT(*) as count,
  'Total profile records' as description
FROM public.profiles
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);

-- Count missing profiles (only if table exists)
SELECT 
  'Missing Profiles' as type,
  COUNT(*) as count,
  'Auth users without profile rows' as description
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
AND EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);

-- List auth users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  'No Profile' as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
AND EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
)
ORDER BY au.created_at DESC;

-- List existing profiles and their roles
SELECT 
  p.id,
  p.email,
  COALESCE(p.role::text, 'NULL') as role,
  COALESCE(p.is_verified::text, 'NULL') as is_verified,
  COALESCE(p.first_name || ' ' || p.last_name, p.email) as full_name,
  CASE 
    WHEN p.role = 'admin' AND p.is_verified = true THEN '✅ Admin (Verified)'
    WHEN p.role = 'admin' AND p.is_verified = false THEN '⚠️ Admin (Not Verified)'
    WHEN p.role = 'student' THEN '👤 Student'
    ELSE '❓ Unknown'
  END as status
FROM public.profiles p
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
)
ORDER BY p.created_at DESC
LIMIT 20;

