# ⚡ Quick Setup: Create Tables in Supabase

## 🚀 Fast Track (5 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New query"**

### Step 2: Copy & Paste Migration 1
1. Open `supabase/migrations/001_initial_schema.sql`
2. **Select ALL** (Ctrl+A / Cmd+A)
3. **Copy** (Ctrl+C / Cmd+C)
4. **Paste** into Supabase SQL Editor
5. Click **"Run"** button (or Ctrl+Enter)

⏱️ Wait ~10-30 seconds for it to complete

### Step 3: Copy & Paste Migration 2
1. Click **"New query"** again
2. Open `supabase/migrations/002_rpc_functions.sql`
3. **Select ALL** and **Copy**
4. **Paste** into new query
5. Click **"Run"**

### Step 4: Verify ✅
1. Click **"Table Editor"** in left sidebar
2. You should see 14 tables:
   - profiles, announcements, messages, admin_approvals, etc.

### Step 5: Done! 🎉
Your database is ready! Now:
- Get your API keys from **Settings** > **API**
- Add them to your `.env` file
- Restart your dev server

---

## 📋 What Gets Created

### Tables (14)
- `profiles` - User profiles
- `announcements` - News & updates
- `messages` - Private messages
- `admin_approvals` - Admin applications
- `assistance_requests` - Support requests
- `board_members` - Organization board
- `community_messages` - Public chat
- `constitution_documents` - Documents
- `contact_inquiries` - Contact form
- `finance_settings` - Financial config
- `hero_images` - Homepage slideshow
- `organization_milestones` - Achievements
- `organization_settings` - Settings
- `sponsors` - Sponsor info

### Functions (5)
- `has_role()` - Check user role
- `update_updated_at_column()` - Auto-update timestamps
- `handle_new_user()` - Auto-create profiles
- `get_public_students()` - Student directory
- `get_public_stats()` - Homepage stats

### Security
- ✅ Row Level Security (RLS) enabled
- ✅ Policies configured
- ✅ Public access for verified students

---

## ❌ Troubleshooting

**Error: "relation already exists"**
→ Some tables exist. This is OK - they'll be skipped.

**Error: "permission denied"**
→ Make sure you're logged into Supabase dashboard.

**No tables showing?**
→ Refresh the page or check SQL Editor for error messages.

---

**Need detailed instructions?** See [CREATE_TABLES_GUIDE.md](./CREATE_TABLES_GUIDE.md)

