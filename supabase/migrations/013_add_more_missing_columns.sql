-- Add all potentially missing columns to profiles table
-- This ensures the table matches what the RPC function expects

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS germany_phone TEXT,
ADD COLUMN IF NOT EXISTS germany_state TEXT,
ADD COLUMN IF NOT EXISTS germany_city TEXT,
ADD COLUMN IF NOT EXISTS germany_address TEXT,
ADD COLUMN IF NOT EXISTS germany_pincode TEXT,

ADD COLUMN IF NOT EXISTS ghana_pincode TEXT,
ADD COLUMN IF NOT EXISTS ghana_region TEXT,
ADD COLUMN IF NOT EXISTS ghana_address TEXT,
ADD COLUMN IF NOT EXISTS ghana_city TEXT,
ADD COLUMN IF NOT EXISTS hometown TEXT,

ADD COLUMN IF NOT EXISTS current_address_street TEXT,
ADD COLUMN IF NOT EXISTS current_address_city TEXT,
ADD COLUMN IF NOT EXISTS current_address_state TEXT,
ADD COLUMN IF NOT EXISTS current_address_postal_code TEXT,

ADD COLUMN IF NOT EXISTS permanent_address_street TEXT,
ADD COLUMN IF NOT EXISTS permanent_address_city TEXT,
ADD COLUMN IF NOT EXISTS permanent_address_state TEXT,
ADD COLUMN IF NOT EXISTS permanent_address_postal_code TEXT,
ADD COLUMN IF NOT EXISTS same_as_current_address BOOLEAN,

ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_number TEXT,

ADD COLUMN IF NOT EXISTS passport_document_url TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;
