# Troubleshooting: "Failed to fetch (api.supabase.com)" Error

## Common Causes & Solutions

### ✅ Solution 1: Use Supabase Dashboard (Not CLI)
**Make sure you're running the SQL in the Supabase Dashboard, not via CLI or terminal.**

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **"SQL Editor"** in the left sidebar (NOT "Database" → "Migrations")
4. Click **"New query"** button
5. Paste your SQL there
6. Click **"Run"** button

### ✅ Solution 2: Check Your Internet Connection
- The error suggests a network issue
- Try refreshing the page
- Check if you can access other Supabase features
- Try a different browser or network

### ✅ Solution 3: Split the Migration into Smaller Chunks
The migration file is large. Try running it in sections:

**Part 1: Enums Only**
```sql
-- User role enum
CREATE TYPE user_role AS ENUM ('student', 'admin');

-- Announcement category enum
CREATE TYPE announcement_category AS ENUM (
  'scholarships',
  'jobs',
  'sports',
  'events',
  'general'
);

-- Inquiry status enum
CREATE TYPE inquiry_status AS ENUM (
  'pending',
  'in_progress',
  'resolved'
);
```

**Part 2: Tables Only** (run after Part 1 succeeds)
- Copy just the CREATE TABLE statements
- Run them one by one or in small groups

**Part 3: Functions, Triggers, Indexes, Policies** (run after tables are created)

### ✅ Solution 4: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to "Console" tab
3. Look for any JavaScript errors
4. Go to "Network" tab
5. Try running the migration again
6. Check if there are failed requests

### ✅ Solution 5: Clear Browser Cache
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache and cookies for supabase.com
3. Try again

### ✅ Solution 6: Try Incognito/Private Mode
- Open Supabase in an incognito/private window
- This rules out browser extensions interfering

### ✅ Solution 7: Check Supabase Status
- Visit [status.supabase.com](https://status.supabase.com)
- Check if there are any service outages

### ✅ Solution 8: Alternative - Use Supabase CLI (If Dashboard Fails)
If the dashboard keeps failing, you can use the CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

But first, make sure you have the Supabase CLI configured properly.

---

## Quick Fix: Try Running Smaller Chunks

I'll create a split version of the migration for you. Check the files:
- `001a_enums_and_tables.sql` - Just enums and tables
- `001b_functions_and_triggers.sql` - Functions and triggers  
- `001c_indexes_and_policies.sql` - Indexes and RLS policies

Run them in order, one at a time.

---

## Still Not Working?

If none of these work:
1. Check if your Supabase project is active (not paused)
2. Verify you have the correct permissions
3. Try creating a simple test query first:
   ```sql
   SELECT 1;
   ```
   If this fails, it's a connection issue with Supabase itself.

4. Contact Supabase support or check their Discord community

