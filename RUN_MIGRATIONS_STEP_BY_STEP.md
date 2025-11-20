# Step-by-Step: Running Migrations (Fix "Failed to fetch" Error)

The "Failed to fetch" error usually happens when:
- The SQL file is too large
- Network timeout
- Browser issues

## ✅ Solution: Run in Smaller Chunks

I've split the migration into 4 smaller files. Run them **one at a time** in order:

---

## Step 1: Run Part 1 (Enums & Tables)

1. Go to Supabase Dashboard → **SQL Editor** → **New query**
2. Open `supabase/migrations/001a_enums_and_tables.sql`
3. Copy ALL contents (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click **"Run"** button
6. **Wait for success message** ✅

**What this creates:**
- 3 Enums (user_role, announcement_category, inquiry_status)
- 14 Tables (profiles, announcements, messages, etc.)

---

## Step 2: Run Part 2 (Functions & Triggers)

1. Click **"New query"** button
2. Open `supabase/migrations/001b_functions_and_triggers.sql`
3. Copy ALL contents
4. Paste into new query
5. Click **"Run"**
6. **Wait for success message** ✅

**What this creates:**
- Functions (has_role, update_updated_at_column, handle_new_user)
- Triggers (auto-update timestamps, auto-create profiles)

---

## Step 3: Run Part 3 (Indexes & Policies)

1. Click **"New query"** button
2. Open `supabase/migrations/001c_indexes_and_policies.sql`
3. Copy ALL contents
4. Paste into new query
5. Click **"Run"**
6. **Wait for success message** ✅

**What this creates:**
- Indexes (for performance)
- Row Level Security (RLS) policies

---

## Step 4: Run RPC Functions

1. Click **"New query"** button
2. Open `supabase/migrations/002_rpc_functions.sql`
3. Copy ALL contents
4. Paste into new query
5. Click **"Run"**
6. **Wait for success message** ✅

**What this creates:**
- `get_public_students()` function
- `get_public_stats()` function

---

## ✅ Verify Everything Worked

1. Go to **Table Editor** in left sidebar
2. You should see 14 tables listed
3. Go back to **SQL Editor**
4. Run this test query:
   ```sql
   SELECT COUNT(*) FROM profiles;
   ```
   Should return `0` (no error = tables exist!)

---

## 🐛 If You Still Get "Failed to fetch"

### Try These:

1. **Refresh the page** and try again
2. **Use a different browser** (Chrome, Firefox, Edge)
3. **Try incognito/private mode**
4. **Check your internet connection**
5. **Wait 30 seconds** between running each part
6. **Check browser console** (F12) for errors

### Alternative: Use Supabase CLI

If dashboard keeps failing:

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

---

## 📝 Important Notes

- ⚠️ Run the parts **IN ORDER** (1a → 1b → 1c → 2)
- ⚠️ Wait for each part to complete before running the next
- ✅ If a part fails, you can re-run it (it's safe to re-run)
- ✅ The split files use `IF NOT EXISTS` and `CREATE OR REPLACE` so they're safe to re-run

---

## 🎉 Success!

Once all 4 parts run successfully:
- ✅ 14 tables created
- ✅ 3 enums created
- ✅ 5 functions created
- ✅ Security policies configured
- ✅ Ready to use!

Next: Get your API keys and add them to `.env` file.

