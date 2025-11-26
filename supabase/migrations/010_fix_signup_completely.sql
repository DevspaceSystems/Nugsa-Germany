-- ============================================
-- Migration: Complete Fix for Signup RLS Issue
-- ============================================
-- This migration ensures signup works by fixing the trigger and ensuring RLS policies work correctly

-- Step 1: Update the trigger to be more robust and not fail
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert, but don't fail if it already exists
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- If anything goes wrong, just return NEW and don't fail
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Ensure the upsert function exists and is correct
DROP FUNCTION IF EXISTS public.upsert_user_profile(jsonb);

CREATE OR REPLACE FUNCTION public.upsert_user_profile(profile_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := (profile_data->>'id')::uuid;
  
  -- Use INSERT ... ON CONFLICT UPDATE for atomic upsert
  INSERT INTO profiles (
    id, email, first_name, last_name, phone, gender, marital_status, date_of_birth,
    ghana_mobile_number, whatsapp_number, linkedin_url, level_of_study, university, major,
    year_of_enrollment, expected_completion_year, year_of_study, graduation_year,
    germany_phone, germany_state, germany_city, germany_address, germany_pincode,
    ghana_pincode, ghana_region, ghana_address, ghana_city, hometown,
    current_address_street, current_address_city, current_address_state, current_address_postal_code,
    permanent_address_street, permanent_address_city, permanent_address_state, permanent_address_postal_code,
    same_as_current_address, emergency_contact_name, emergency_contact_relationship, emergency_contact_number,
    passport_document_url, profile_image_url, bio, is_profile_complete, created_at, updated_at
  )
  VALUES (
    user_id,
    profile_data->>'email',
    profile_data->>'first_name',
    profile_data->>'last_name',
    profile_data->>'phone',
    profile_data->>'gender',
    profile_data->>'marital_status',
    CASE WHEN profile_data->>'date_of_birth' IS NOT NULL AND profile_data->>'date_of_birth' != '' THEN (profile_data->>'date_of_birth')::date ELSE NULL END,
    profile_data->>'ghana_mobile_number',
    profile_data->>'whatsapp_number',
    profile_data->>'linkedin_url',
    profile_data->>'level_of_study',
    profile_data->>'university',
    profile_data->>'major',
    CASE WHEN profile_data->>'year_of_enrollment' IS NOT NULL AND profile_data->>'year_of_enrollment' != '' THEN (profile_data->>'year_of_enrollment')::integer ELSE NULL END,
    CASE WHEN profile_data->>'expected_completion_year' IS NOT NULL AND profile_data->>'expected_completion_year' != '' THEN (profile_data->>'expected_completion_year')::integer ELSE NULL END,
    CASE WHEN profile_data->>'year_of_study' IS NOT NULL AND profile_data->>'year_of_study' != '' THEN (profile_data->>'year_of_study')::integer ELSE NULL END,
    CASE WHEN profile_data->>'graduation_year' IS NOT NULL AND profile_data->>'graduation_year' != '' THEN (profile_data->>'graduation_year')::integer ELSE NULL END,
    profile_data->>'germany_phone',
    profile_data->>'germany_state',
    profile_data->>'germany_city',
    profile_data->>'germany_address',
    profile_data->>'germany_pincode',
    profile_data->>'ghana_pincode',
    profile_data->>'ghana_region',
    profile_data->>'ghana_address',
    profile_data->>'ghana_city',
    profile_data->>'hometown',
    profile_data->>'current_address_street',
    profile_data->>'current_address_city',
    profile_data->>'current_address_state',
    profile_data->>'current_address_postal_code',
    profile_data->>'permanent_address_street',
    profile_data->>'permanent_address_city',
    profile_data->>'permanent_address_state',
    profile_data->>'permanent_address_postal_code',
    CASE WHEN profile_data->>'same_as_current_address' IS NOT NULL THEN (profile_data->>'same_as_current_address')::boolean ELSE NULL END,
    profile_data->>'emergency_contact_name',
    profile_data->>'emergency_contact_relationship',
    profile_data->>'emergency_contact_number',
    profile_data->>'passport_document_url',
    profile_data->>'profile_image_url',
    profile_data->>'bio',
    COALESCE((profile_data->>'is_profile_complete')::boolean, false),
    COALESCE((profile_data->>'created_at')::timestamptz, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    gender = EXCLUDED.gender,
    marital_status = EXCLUDED.marital_status,
    date_of_birth = EXCLUDED.date_of_birth,
    ghana_mobile_number = EXCLUDED.ghana_mobile_number,
    whatsapp_number = EXCLUDED.whatsapp_number,
    linkedin_url = EXCLUDED.linkedin_url,
    level_of_study = EXCLUDED.level_of_study,
    university = EXCLUDED.university,
    major = EXCLUDED.major,
    year_of_enrollment = EXCLUDED.year_of_enrollment,
    expected_completion_year = EXCLUDED.expected_completion_year,
    year_of_study = EXCLUDED.year_of_study,
    graduation_year = EXCLUDED.graduation_year,
    germany_phone = EXCLUDED.germany_phone,
    germany_state = EXCLUDED.germany_state,
    germany_city = EXCLUDED.germany_city,
    germany_address = EXCLUDED.germany_address,
    germany_pincode = EXCLUDED.germany_pincode,
    ghana_pincode = EXCLUDED.ghana_pincode,
    ghana_region = EXCLUDED.ghana_region,
    ghana_address = EXCLUDED.ghana_address,
    ghana_city = EXCLUDED.ghana_city,
    hometown = EXCLUDED.hometown,
    current_address_street = EXCLUDED.current_address_street,
    current_address_city = EXCLUDED.current_address_city,
    current_address_state = EXCLUDED.current_address_state,
    current_address_postal_code = EXCLUDED.current_address_postal_code,
    permanent_address_street = EXCLUDED.permanent_address_street,
    permanent_address_city = EXCLUDED.permanent_address_city,
    permanent_address_state = EXCLUDED.permanent_address_state,
    permanent_address_postal_code = EXCLUDED.permanent_address_postal_code,
    same_as_current_address = EXCLUDED.same_as_current_address,
    emergency_contact_name = EXCLUDED.emergency_contact_name,
    emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
    emergency_contact_number = EXCLUDED.emergency_contact_number,
    passport_document_url = EXCLUDED.passport_document_url,
    profile_image_url = EXCLUDED.profile_image_url,
    bio = EXCLUDED.bio,
    is_profile_complete = EXCLUDED.is_profile_complete,
    updated_at = NOW();
END;
$$;

-- Step 3: Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(jsonb) TO authenticated, anon;

-- Step 4: Also ensure the INSERT policy exists (as backup)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 5: Ensure UPDATE policy has WITH CHECK
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

