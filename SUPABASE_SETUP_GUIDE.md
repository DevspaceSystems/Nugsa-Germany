# Supabase Setup Guide for NUGSA-Germany Platform

This guide will walk you through setting up a new Supabase project and configuring it to work with the Ghasai Platform application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Creating a Supabase Account](#creating-a-supabase-account)
3. [Creating a New Project](#creating-a-new-project)
4. [Setting Up the Database](#setting-up-the-database)
5. [Configuring Authentication](#configuring-authentication)
6. [Getting Your API Keys](#getting-your-api-keys)
7. [Configuring the Application](#configuring-the-application)
8. [Generating TypeScript Types](#generating-typescript-types)
9. [Testing the Setup](#testing-the-setup)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A web browser
- A GitHub account (recommended for Supabase signup)
- Basic knowledge of SQL (helpful but not required)
- Node.js and npm/yarn installed (for local development)

---

## Step 1: Creating a Supabase Account

1. **Visit Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Click the **"Start your project"** or **"Sign Up"** button

2. **Sign Up Options**
   - You can sign up using:
     - GitHub (recommended)
     - Email
     - Google
   - Choose your preferred method and complete the signup process

3. **Verify Your Email** (if using email signup)
   - Check your inbox for a verification email
   - Click the verification link

---

## Step 2: Creating a New Project

1. **Access the Dashboard**
   - After signing up, you'll be redirected to the Supabase dashboard
   - If you're already logged in, go to [https://app.supabase.com](https://app.supabase.com)

2. **Create New Project**
   - Click the **"New Project"** button
   - You'll see a form to configure your project

3. **Project Configuration**
   - **Organization**: Select your organization (or create a new one)
   - **Name**: Enter a project name (e.g., "Ghasai Platform")
   - **Database Password**: 
     - Create a strong password (save this securely!)
     - This is your database password, not your Supabase account password
     - You'll need this if you want to connect directly to the database
   - **Region**: Choose the region closest to your users
     - For Ghana/India users, consider regions like:
       - `West US` (Oregon)
       - `Europe West` (London)
       - `Southeast Asia` (Singapore)
   - **Pricing Plan**: 
     - Free tier is available for development
     - Upgrade to Pro for production use

4. **Create Project**
   - Click **"Create new project"**
   - Wait 1-2 minutes for the project to be provisioned
   - You'll see a loading screen with progress updates

---

## Step 3: Setting Up the Database

1. **Access SQL Editor**
   - Once your project is ready, click on **"SQL Editor"** in the left sidebar
   - This is where you'll run the migration script

2. **Run the Migration Script**
   - Click **"New query"** button
   - Open the file `supabase/migrations/001_initial_schema.sql` from this project
   - Copy the entire contents of the file
   - Paste it into the SQL Editor
   - Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

3. **Verify the Migration**
   - You should see a success message
   - Check the **"Table Editor"** in the left sidebar
   - You should see all the tables listed:
     - `profiles`
     - `announcements`
     - `admin_approvals`
     - `assistance_requests`
     - `board_members`
     - `community_messages`
     - `constitution_documents`
     - `contact_inquiries`
     - `finance_settings`
     - `hero_images`
     - `messages`
     - `organization_milestones`
     - `organization_settings`
     - `sponsors`

4. **Verify Enums**
   - In the SQL Editor, run:
     ```sql
     SELECT * FROM pg_type WHERE typname IN ('user_role', 'announcement_category', 'inquiry_status');
     ```
   - You should see 3 rows returned

---

## Step 4: Configuring Authentication

1. **Access Authentication Settings**
   - Click **"Authentication"** in the left sidebar
   - Click **"Providers"** in the submenu

2. **Configure Email Provider** (Default - Already Enabled)
   - Email provider is enabled by default
   - You can customize:
     - **Confirm email**: Toggle to require email confirmation
     - **Secure email change**: Toggle for additional security

3. **Configure Additional Providers** (Optional)
   - **Google OAuth**:
     - Toggle it on
     - Add your Google OAuth credentials
   - **GitHub OAuth**:
     - Toggle it on
     - Add your GitHub OAuth credentials
   - Follow Supabase's guides for each provider

4. **Email Templates** (Optional)
   - Click **"Email Templates"** in the Authentication section
   - Customize the email templates for:
     - Confirm signup
     - Magic link
     - Change email address
     - Reset password

5. **URL Configuration**
   - Click **"URL Configuration"** in Authentication settings
   - Set your **Site URL**: `http://localhost:5173` (for development)
   - Add **Redirect URLs**:
     - `http://localhost:5173/**`
     - `http://localhost:5173/auth/callback`
     - Add your production URLs when deploying

---

## Step 5: Getting Your API Keys

1. **Access Project Settings**
   - Click the **gear icon** (⚙️) in the left sidebar
   - Click **"API"** in the settings menu

2. **Find Your Credentials**
   - **Project URL**: This is your `VITE_SUPABASE_URL`
     - Format: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: This is your `VITE_SUPABASE_ANON_KEY`
     - It starts with `eyJ...` (a long JWT token)
   - **service_role key**: Keep this secret! Never expose it in client-side code
     - Only use this for server-side operations

3. **Copy the Values**
   - Copy both the Project URL and anon public key
   - You'll need these in the next step

---

## Step 6: Configuring the Application

1. **Create Environment File**
   - In your project root, create a file named `.env` (or `.env.local`)
   - Copy the contents from `.env.example`:
     ```bash
     cp .env.example .env
     ```

2. **Add Your Credentials**
   - Open the `.env` file
   - Replace the placeholder values:
     ```env
     VITE_SUPABASE_URL=https://your-project-ref.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - Use the actual values from Step 5

3. **Verify the Configuration**
   - Make sure there are no quotes around the values
   - Make sure there are no trailing spaces
   - The file should look like:
     ```env
     VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

4. **Update config.toml** (Optional)
   - If you're using Supabase CLI, update `supabase/config.toml`:
     ```toml
     project_id = "your-project-ref"
     ```

---

## Step 7: Generating TypeScript Types

After setting up your database, you need to generate TypeScript types that match your schema.

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Your Project**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   - Replace `your-project-ref` with your actual project reference (found in your project URL)

4. **Generate Types**
   ```bash
   supabase gen types typescript --linked > src/integrations/supabase/types.ts
   ```

### Option B: Using Supabase Dashboard

1. **Access Database Types**
   - Go to your Supabase project dashboard
   - Click **"Database"** in the left sidebar
   - Click **"Types"** tab

2. **Generate TypeScript Types**
   - Select **"TypeScript"** from the dropdown
   - Copy the generated types
   - Replace the contents of `src/integrations/supabase/types.ts`

### Option C: Manual Update

If you can't use the CLI or Dashboard:
- The types file should already be compatible
- You may need to update the `PostgrestVersion` if there are version differences
- The structure should remain the same

---

## Step 8: Testing the Setup

1. **Start the Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Test Authentication**
   - Navigate to the auth page
   - Try creating a new account
   - Check your Supabase dashboard:
     - Go to **Authentication** > **Users**
     - You should see the new user
     - Go to **Table Editor** > **profiles**
     - You should see a profile automatically created

3. **Test Database Connection**
   - Try logging in
   - Navigate to different pages that use database queries
   - Check the browser console for any errors

4. **Verify Row Level Security**
   - Try accessing data as a regular user
   - Verify that users can only see their own data
   - Test admin access (if you have an admin account)

---

## Step 9: Creating Your First Admin User

1. **Create a User Account**
   - Sign up through your application
   - Or create a user in Supabase Dashboard > Authentication > Users

2. **Update User Role to Admin**
   - Go to **Table Editor** > **profiles**
   - Find your user's profile
   - Edit the `role` field
   - Change it from `student` to `admin`
   - Save the changes

3. **Test Admin Access**
   - Log out and log back in
   - You should now have admin privileges
   - Access admin-only features

---

## Step 10: Storage Setup (Optional)

If your application uses file uploads (images, documents):

1. **Access Storage**
   - Click **"Storage"** in the left sidebar

2. **Create Buckets**
   - Click **"New bucket"**
   - Create buckets for:
     - `profile-images` (for user profile pictures)
     - `documents` (for passport documents, etc.)
     - `announcement-images` (for announcement images)
     - `hero-images` (for hero slideshow images)

3. **Set Bucket Policies**
   - For each bucket, set appropriate policies:
     - **Public read** for images that should be publicly accessible
     - **Authenticated read/write** for user-specific files
     - Use the policy templates provided by Supabase

---

## Troubleshooting

### Issue: "Missing Supabase environment variables" error

**Solution:**
- Make sure your `.env` file exists in the project root
- Verify the variable names are correct: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after creating/updating `.env`
- Make sure there are no spaces around the `=` sign

### Issue: Migration fails with errors

**Solution:**
- Check if you're running the entire migration script
- Some errors might be expected if tables already exist
- Try running sections of the migration separately
- Check the Supabase logs for detailed error messages

### Issue: Authentication not working

**Solution:**
- Verify your redirect URLs in Authentication > URL Configuration
- Check that your Site URL matches your development URL
- Ensure email provider is enabled
- Check browser console for specific error messages

### Issue: Row Level Security blocking queries

**Solution:**
- Verify that RLS policies are correctly set up
- Check that users are authenticated (`auth.uid()` is not null)
- Test with an admin account to see if policies work
- Temporarily disable RLS for testing (not recommended for production)

### Issue: Types don't match database

**Solution:**
- Regenerate types using Supabase CLI
- Make sure you're using the correct project reference
- Check that all migrations have been applied
- Compare the generated types with your actual database schema

### Issue: Can't connect to Supabase

**Solution:**
- Verify your project URL is correct
- Check that your project is not paused (free tier projects pause after inactivity)
- Verify your API key is correct
- Check your internet connection
- Ensure there are no firewall restrictions

---

## Next Steps

1. **Set up production environment**
   - Create a separate Supabase project for production
   - Configure production URLs in Authentication settings
   - Set up environment variables in your hosting platform

2. **Configure backups**
   - Set up automated backups in Supabase Dashboard
   - Configure backup retention policies

3. **Set up monitoring**
   - Enable Supabase monitoring and alerts
   - Set up error tracking (e.g., Sentry)

4. **Optimize performance**
   - Review and optimize database indexes
   - Set up connection pooling for production
   - Configure CDN for static assets

5. **Security hardening**
   - Review and test all RLS policies
   - Set up rate limiting
   - Configure CORS properly
   - Review API key usage

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Types Guide](https://supabase.com/docs/reference/javascript/typescript-support)

---

## Support

If you encounter issues not covered in this guide:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Search [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
3. Ask for help in [Supabase Discord](https://discord.supabase.com)
4. Review your project's error logs in the Supabase Dashboard

---

**Last Updated:** 2024
**Project:** Ghasai Platform



