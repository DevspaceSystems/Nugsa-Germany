# Quick Start Guide - New Supabase Setup

This is a condensed guide for setting up a new Supabase instance. For detailed instructions, see [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md).

## 🚀 Quick Setup (5 Steps)

### 1. Create Supabase Account & Project
- Go to [supabase.com](https://supabase.com) and sign up
- Click "New Project"
- Fill in project details and wait for provisioning (~2 minutes)

### 2. Run Database Migration
- In Supabase Dashboard, go to **SQL Editor**
- Click **"New query"**
- Open `supabase/migrations/001_initial_schema.sql`
- Copy entire file content and paste into SQL Editor
- Click **"Run"**

### 3. Get Your API Keys
- Go to **Settings** (⚙️) > **API**
- Copy:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 4. Configure Environment Variables
Create a `.env` file in project root:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Generate TypeScript Types

**Option A: Using Supabase CLI**
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

**Option B: Using Dashboard**
- Go to **Database** > **Types** tab
- Select **TypeScript**
- Copy and replace `src/integrations/supabase/types.ts`

## ✅ Verify Setup

1. Start dev server: `npm run dev`
2. Try signing up a new account
3. Check Supabase Dashboard:
   - **Authentication** > **Users** - should see new user
   - **Table Editor** > **profiles** - should see auto-created profile

## 🔑 Create Admin User

1. Sign up through the app (or create user in Dashboard)
2. Go to **Table Editor** > **profiles**
3. Find your user and change `role` from `student` to `admin`
4. Log out and log back in

## 📋 Database Structure

Your database includes:
- **14 Tables**: profiles, announcements, messages, admin_approvals, etc.
- **3 Enums**: user_role, announcement_category, inquiry_status
- **RLS Policies**: Row-level security enabled on all tables
- **Auto-triggers**: Profile creation on signup, timestamp updates

## 🆘 Need Help?

See the full [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) for:
- Detailed step-by-step instructions
- Troubleshooting common issues
- Authentication configuration
- Storage setup
- Production deployment tips



