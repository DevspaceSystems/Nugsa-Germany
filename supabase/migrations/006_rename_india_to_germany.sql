-- ============================================
-- Migration: Rename India fields to Germany
-- ============================================
-- This migration renames all india_* columns to germany_* in the profiles table

-- Rename columns in profiles table
ALTER TABLE profiles 
  RENAME COLUMN india_phone TO germany_phone;

ALTER TABLE profiles 
  RENAME COLUMN india_state TO germany_state;

ALTER TABLE profiles 
  RENAME COLUMN india_city TO germany_city;

ALTER TABLE profiles 
  RENAME COLUMN india_pincode TO germany_pincode;

-- Note: india_address doesn't exist in the schema, but if it does, rename it
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'india_address'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN india_address TO germany_address;
  END IF;
END $$;

-- Add missing address columns if they don't exist
DO $$ 
BEGIN
  -- Add germany_address if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'germany_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN germany_address TEXT;
  END IF;
  
  -- Add ghana_address if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'ghana_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ghana_address TEXT;
  END IF;
  
  -- Add ghana_city if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'ghana_city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ghana_city TEXT;
  END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- After running this migration, regenerate TypeScript types:
-- npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts

