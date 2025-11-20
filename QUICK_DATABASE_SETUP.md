# Quick Database Setup Guide

**For users with existing auth users but no database tables**

---

## 🚀 Quick Setup (5 Steps)

### 1. Run Migration Part 1
```sql
-- Copy and paste contents of: 001a_enums_and_tables.sql
-- Run in Supabase SQL Editor
```

### 2. Run Migration Part 2
```sql
-- Copy and paste contents of: 001b_functions_and_triggers.sql
-- Run in Supabase SQL Editor
```

### 3. Run Migration Part 3
```sql
-- Copy and paste contents of: 001c_indexes_and_policies.sql
-- Run in Supabase SQL Editor
```

### 4. Run RPC Functions
```sql
-- Copy and paste contents of: 002_rpc_functions.sql
-- Run in Supabase SQL Editor
```

### 5. Backfill Existing Users & Set Admin
```sql
-- Backfill profiles for existing auth users
INSERT INTO public.profiles (id, email, first_name, last_name, role, is_verified)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'User') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
  'student'::user_role as role,
  false as is_verified
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Set your email as admin (REPLACE 'your-email@example.com' with your actual email)
UPDATE public.profiles
SET role = 'admin'::user_role, is_verified = true
WHERE email = 'your-email@example.com';
```

---

## ✅ Verify Setup

1. Go to **Table Editor** → **profiles**
2. Should see your users with `role` and `is_verified` fields
3. Your admin user should have `role = 'admin'` and `is_verified = true`

---

## 🎯 Done!

You can now:
- ✅ Log in with your admin account
- ✅ Access `/admin-dashboard`
- ✅ Manage users and content

**For detailed instructions, see `SETUP_DATABASE_FOR_EXISTING_USERS.md`**

