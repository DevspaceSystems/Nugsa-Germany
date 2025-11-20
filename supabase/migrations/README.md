# Database Migrations

This directory contains SQL migration scripts for setting up the Ghasai Platform database.

## Migration Files

### `001_initial_schema.sql`
This is the initial database schema migration that creates:
- All database tables (14 tables)
- All enums (user_role, announcement_category, inquiry_status)
- Database functions (has_role, update_updated_at_column)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic profile creation and timestamp updates

## How to Use

1. **Via Supabase Dashboard (Recommended for first-time setup)**
   - Open your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Click **"New query"**
   - Copy and paste the contents of `001_initial_schema.sql`
   - Click **"Run"** to execute

2. **Via Supabase CLI (For ongoing development)**
   ```bash
   # Link your project
   supabase link --project-ref your-project-ref
   
   # Apply migrations
   supabase db push
   ```

## Migration Order

Migrations are designed to be run in order:
1. `001_initial_schema.sql` - Must be run first

## Important Notes

- **Backup First**: Always backup your database before running migrations in production
- **Test Environment**: Test migrations in a development/staging environment first
- **Dependencies**: The migration creates tables with foreign key relationships, so order matters
- **RLS Policies**: Row Level Security is enabled by default. Review policies before production use

## Verifying the Migration

After running the migration, verify:

1. **Tables Created**: Check Table Editor in Supabase Dashboard
   - Should see 14 tables listed

2. **Enums Created**: Run in SQL Editor:
   ```sql
   SELECT typname FROM pg_type 
   WHERE typname IN ('user_role', 'announcement_category', 'inquiry_status');
   ```

3. **Functions Created**: Run in SQL Editor:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('has_role', 'update_updated_at_column', 'handle_new_user');
   ```

4. **RLS Enabled**: Check that RLS is enabled on all tables:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN (
     'profiles', 'announcements', 'messages', 'admin_approvals',
     'assistance_requests', 'board_members', 'community_messages',
     'constitution_documents', 'contact_inquiries', 'finance_settings',
     'hero_images', 'organization_milestones', 'organization_settings', 'sponsors'
   );
   ```

## Troubleshooting

### Error: "relation already exists"
- Some tables might already exist. You can either:
  - Drop existing tables first (⚠️ This will delete data)
  - Modify the migration to use `CREATE TABLE IF NOT EXISTS`

### Error: "type already exists"
- The enums might already exist. Modify the migration to use:
  ```sql
  DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (...);
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
  ```

### Error: "permission denied"
- Make sure you're running the migration as a database superuser
- In Supabase Dashboard, you should have the necessary permissions

## Next Steps

After running the migration:
1. Configure your `.env` file with Supabase credentials
2. Generate TypeScript types (see main setup guide)
3. Test the application connection
4. Create your first admin user



