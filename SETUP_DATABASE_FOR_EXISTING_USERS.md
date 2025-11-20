# Database Setup for Existing Auth Users

Your Supabase project has auth users but no database tables. Follow these steps to set up the database and create profiles for existing users.

---

## 📋 Step-by-Step Instructions

### Step 1: Run the Initial Schema Migrations

Run these SQL scripts **in order** in the Supabase SQL Editor:

#### 1.1. Run Part 1 (Enums & Tables)
1. Go to **Supabase Dashboard** → **SQL Editor** → **New query**
2. Open `supabase/migrations/001a_enums_and_tables.sql`
3. Copy ALL contents and paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for success message

#### 1.2. Run Part 2 (Functions & Triggers)
1. Click **"New query"** button
2. Open `supabase/migrations/001b_functions_and_triggers.sql`
3. Copy ALL contents and paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for success message

#### 1.3. Run Part 3 (Indexes & Policies)
1. Click **"New query"** button
2. Open `supabase/migrations/001c_indexes_and_policies.sql`
3. Copy ALL contents and paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for success message

#### 1.4. Run RPC Functions
1. Click **"New query"** button
2. Open `supabase/migrations/002_rpc_functions.sql`
3. Copy ALL contents and paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for success message

---

### Step 2: Backfill Profiles for Existing Auth Users

1. Click **"New query"** button
2. Open `supabase/migrations/003_backfill_existing_users.sql`
3. Copy ALL contents and paste into SQL Editor
4. **Optional**: Before running, if you want to set a specific user as admin, uncomment and modify the section at the bottom:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'::user_role, is_verified = true
   WHERE email = 'your-admin-email@example.com';
   ```
5. Click **"Run"**
6. ✅ All existing auth users now have profile rows

---

### Step 3: Set Up Admin User (Required for Admin Dashboard)

You need at least one user with `role = 'admin'` and `is_verified = true` to access the admin dashboard.

#### Option A: Via SQL Editor

Run this SQL query (replace with your admin email):

```sql
UPDATE public.profiles
SET role = 'admin'::user_role, is_verified = true
WHERE email = 'your-admin-email@example.com';
```

#### Option B: Via Supabase Dashboard

1. Go to **Supabase Dashboard** → **Table Editor** → **profiles**
2. Find the user you want to make admin
3. Click on the row to edit
4. Set `role` to `admin`
5. Set `is_verified` to `true`
6. Save

---

### Step 4: Verify Everything Works

1. **Check Tables**: Go to **Table Editor** and verify you see these tables:
   - ✅ profiles
   - ✅ announcements
   - ✅ messages
   - ✅ admin_approvals
   - ✅ assistance_requests
   - ✅ board_members
   - ✅ community_messages
   - ✅ constitution_documents
   - ✅ contact_inquiries
   - ✅ finance_settings
   - ✅ hero_images
   - ✅ organization_milestones
   - ✅ organization_settings
   - ✅ sponsors

2. **Check Profiles**: Go to **Table Editor** → **profiles**
   - ✅ Should have rows for each auth user
   - ✅ Each row should have `role` and `is_verified` fields

3. **Check Admin User**: 
   - ✅ Find your admin user in the profiles table
   - ✅ Verify `role = 'admin'` and `is_verified = true`

4. **Test Login**:
   - ✅ Log in with your admin account
   - ✅ Navigate to `/admin-dashboard`
   - ✅ Should load without errors

---

## 🎯 Quick Admin Setup (One SQL Query)

If you want to do everything quickly, run this single query after all migrations:

```sql
-- This assumes you want to make the first auth user an admin
-- Or replace with your specific email
UPDATE public.profiles
SET role = 'admin'::user_role, is_verified = true
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);
```

Or for a specific email:

```sql
UPDATE public.profiles
SET role = 'admin'::user_role, is_verified = true
WHERE email = 'your-email@example.com';
```

---

## ❓ Troubleshooting

### Issue: "Failed to fetch" error when running migrations
**Solution**: 
- Split the migration into smaller chunks (already done - use the split files)
- Wait 30 seconds between each migration
- Refresh the page and try again

### Issue: "relation already exists" error
**Solution**: 
- Some tables already exist - this is fine for the backfill script
- The scripts use `IF NOT EXISTS` so they're safe to re-run

### Issue: Can't access admin dashboard
**Solution**:
1. Check your profile in the `profiles` table
2. Verify `role = 'admin'` (not just `role IS NOT NULL`)
3. Verify `is_verified = true` (boolean, not null)
4. Try logging out and logging back in

### Issue: Profile not created for new users
**Solution**:
- Check that the trigger `on_auth_user_created` exists
- Check that the function `handle_new_user()` exists
- New signups should automatically create profiles

---

## ✅ Success Checklist

- [ ] All 4 migration files run successfully (001a, 001b, 001c, 002)
- [ ] Backfill script runs successfully (003)
- [ ] All tables visible in Table Editor
- [ ] Profiles exist for all auth users
- [ ] At least one user has `role = 'admin'` and `is_verified = true`
- [ ] Can log in and access admin dashboard

---

## 📝 Notes

- **Role Field**: Uses enum type `user_role` with values `'student'` or `'admin'`
- **Default Values**: New users default to `role = 'student'` and `is_verified = false`
- **Admin Access**: Requires both `role = 'admin'` AND `is_verified = true`
- **Auto-Creation**: New signups automatically create profiles via trigger

---

## 🔗 Next Steps

1. Update your `.env` file with Supabase credentials (if not already done)
2. Regenerate TypeScript types (optional but recommended)
3. Test the admin dashboard functionality
4. Set up more admin users as needed

---

**Need Help?** Check `TROUBLESHOOTING_MIGRATION.md` for more detailed troubleshooting.

