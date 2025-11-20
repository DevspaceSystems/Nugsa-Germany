# Quick Guide: Creating Tables in Supabase

This guide will help you create all the necessary database tables for NUGSA-Germany in your Supabase project.

## Prerequisites
- You have a Supabase account and project created
- You have access to your Supabase project dashboard

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Log in to your account
3. Select your NUGSA-Germany project

### Step 2: Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click the **"New query"** button (top right)

### Step 3: Run the First Migration (Main Schema)
1. Open the file `supabase/migrations/001_initial_schema.sql` from this project
2. **Copy the ENTIRE contents** of the file (all 568 lines)
3. **Paste** it into the SQL Editor in Supabase
4. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

**What this creates:**
- ✅ 3 Enums (user_role, announcement_category, inquiry_status)
- ✅ 14 Tables (profiles, announcements, messages, etc.)
- ✅ Database functions (has_role, update_updated_at_column, handle_new_user)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic operations

### Step 4: Run the Second Migration (RPC Functions)
1. Open the file `supabase/migrations/002_rpc_functions.sql` from this project
2. **Copy the ENTIRE contents** of the file
3. **Paste** it into a **NEW query** in the SQL Editor
4. Click **"Run"**

**What this creates:**
- ✅ `get_public_students()` function (for student directory)
- ✅ `get_public_stats()` function (for homepage statistics)

### Step 5: Verify Tables Were Created
1. In the left sidebar, click on **"Table Editor"**
2. You should see all these tables listed:
   - ✅ `profiles`
   - ✅ `announcements`
   - ✅ `admin_approvals`
   - ✅ `assistance_requests`
   - ✅ `board_members`
   - ✅ `community_messages`
   - ✅ `constitution_documents`
   - ✅ `contact_inquiries`
   - ✅ `finance_settings`
   - ✅ `hero_images`
   - ✅ `messages`
   - ✅ `organization_milestones`
   - ✅ `organization_settings`
   - ✅ `sponsors`

### Step 6: Verify Functions Were Created
1. Go back to **"SQL Editor"**
2. Run this query:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('has_role', 'update_updated_at_column', 'handle_new_user', 'get_public_students', 'get_public_stats');
   ```
3. You should see 5 rows returned

### Step 7: Verify Enums Were Created
1. In SQL Editor, run:
   ```sql
   SELECT typname FROM pg_type 
   WHERE typname IN ('user_role', 'announcement_category', 'inquiry_status');
   ```
2. You should see 3 rows returned

## Troubleshooting

### Error: "relation already exists"
- Some tables might already exist. You can either:
  - Drop existing tables first (⚠️ This will delete data)
  - Or modify the migration to use `CREATE TABLE IF NOT EXISTS`

### Error: "type already exists"
- The enums might already exist. This is okay - the migration will skip them.

### Error: "permission denied"
- Make sure you're running the migration as a database superuser
- In Supabase Dashboard, you should have the necessary permissions by default

### Error: "function already exists"
- If functions already exist, they will be replaced by `CREATE OR REPLACE FUNCTION`
- This is safe and expected

## Next Steps After Creating Tables

1. **Get Your API Credentials**
   - Go to **Settings** (⚙️) > **API**
   - Copy your **Project URL** and **anon public key**
   - Add them to your `.env` file:
     ```env
     VITE_SUPABASE_URL=https://your-project-ref.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

2. **Generate TypeScript Types**
   - Option A: Using Supabase CLI
     ```bash
     supabase gen types typescript --linked > src/integrations/supabase/types.ts
     ```
   - Option B: Using Dashboard
     - Go to **Database** > **Types** tab
     - Select **TypeScript**
     - Copy and replace `src/integrations/supabase/types.ts`

3. **Test the Connection**
   - Start your dev server: `npm run dev`
   - Try signing up a new user
   - Check Supabase Dashboard to see if a profile was created automatically

4. **Create Your First Admin User**
   - Sign up through the app (or create user in Dashboard)
   - Go to **Table Editor** > **profiles**
   - Find your user and change `role` from `student` to `admin`
   - Set `is_verified` to `true`
   - Save changes

## Important Notes

- ⚠️ **Backup First**: Always backup your database before running migrations in production
- ⚠️ **Test Environment**: Test migrations in a development/staging environment first
- ✅ **RLS Enabled**: Row Level Security is enabled by default for data protection
- ✅ **Auto-Profile Creation**: Profiles are automatically created when users sign up

## Need Help?

If you encounter issues:
1. Check the error message in Supabase SQL Editor
2. Review the [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) for detailed instructions
3. Check Supabase documentation: https://supabase.com/docs

---

**Last Updated**: 2024
**Project**: NUGSA-Germany

