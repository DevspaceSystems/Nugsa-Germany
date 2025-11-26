-- ============================================
-- Migration: Create profile upsert function
-- ============================================
-- This creates a function that can insert/update profiles with elevated privileges
-- This bypasses RLS issues during signup when the user might not have an active session yet

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.upsert_user_profile(jsonb);

-- Create function to upsert user profile
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.upsert_user_profile(profile_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Extract user ID from the profile data
  user_id := (profile_data->>'id')::uuid;
  
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Update existing profile
    UPDATE profiles
    SET
      email = COALESCE(profile_data->>'email', email),
      first_name = COALESCE(profile_data->>'first_name', first_name),
      last_name = COALESCE(profile_data->>'last_name', last_name),
      phone = COALESCE(profile_data->>'phone', phone),
      gender = COALESCE(profile_data->>'gender', gender),
      marital_status = COALESCE(profile_data->>'marital_status', marital_status),
      date_of_birth = CASE WHEN profile_data->>'date_of_birth' IS NOT NULL THEN (profile_data->>'date_of_birth')::date ELSE date_of_birth END,
      ghana_mobile_number = COALESCE(profile_data->>'ghana_mobile_number', ghana_mobile_number),
      whatsapp_number = COALESCE(profile_data->>'whatsapp_number', whatsapp_number),
      linkedin_url = COALESCE(profile_data->>'linkedin_url', linkedin_url),
      level_of_study = COALESCE(profile_data->>'level_of_study', level_of_study),
      university = COALESCE(profile_data->>'university', university),
      major = COALESCE(profile_data->>'major', major),
      year_of_enrollment = CASE WHEN profile_data->>'year_of_enrollment' IS NOT NULL THEN (profile_data->>'year_of_enrollment')::integer ELSE year_of_enrollment END,
      expected_completion_year = CASE WHEN profile_data->>'expected_completion_year' IS NOT NULL THEN (profile_data->>'expected_completion_year')::integer ELSE expected_completion_year END,
      year_of_study = CASE WHEN profile_data->>'year_of_study' IS NOT NULL THEN (profile_data->>'year_of_study')::integer ELSE year_of_study END,
      graduation_year = CASE WHEN profile_data->>'graduation_year' IS NOT NULL THEN (profile_data->>'graduation_year')::integer ELSE graduation_year END,
      germany_phone = COALESCE(profile_data->>'germany_phone', germany_phone),
      germany_state = COALESCE(profile_data->>'germany_state', germany_state),
      germany_city = COALESCE(profile_data->>'germany_city', germany_city),
      germany_address = COALESCE(profile_data->>'germany_address', germany_address),
      germany_pincode = COALESCE(profile_data->>'germany_pincode', germany_pincode),
      ghana_pincode = COALESCE(profile_data->>'ghana_pincode', ghana_pincode),
      ghana_region = COALESCE(profile_data->>'ghana_region', ghana_region),
      ghana_address = COALESCE(profile_data->>'ghana_address', ghana_address),
      ghana_city = COALESCE(profile_data->>'ghana_city', ghana_city),
      hometown = COALESCE(profile_data->>'hometown', hometown),
      current_address_street = COALESCE(profile_data->>'current_address_street', current_address_street),
      current_address_city = COALESCE(profile_data->>'current_address_city', current_address_city),
      current_address_state = COALESCE(profile_data->>'current_address_state', current_address_state),
      current_address_postal_code = COALESCE(profile_data->>'current_address_postal_code', current_address_postal_code),
      permanent_address_street = COALESCE(profile_data->>'permanent_address_street', permanent_address_street),
      permanent_address_city = COALESCE(profile_data->>'permanent_address_city', permanent_address_city),
      permanent_address_state = COALESCE(profile_data->>'permanent_address_state', permanent_address_state),
      permanent_address_postal_code = COALESCE(profile_data->>'permanent_address_postal_code', permanent_address_postal_code),
      same_as_current_address = CASE WHEN profile_data->>'same_as_current_address' IS NOT NULL THEN (profile_data->>'same_as_current_address')::boolean ELSE same_as_current_address END,
      emergency_contact_name = COALESCE(profile_data->>'emergency_contact_name', emergency_contact_name),
      emergency_contact_relationship = COALESCE(profile_data->>'emergency_contact_relationship', emergency_contact_relationship),
      emergency_contact_number = COALESCE(profile_data->>'emergency_contact_number', emergency_contact_number),
      passport_document_url = COALESCE(profile_data->>'passport_document_url', passport_document_url),
      profile_image_url = COALESCE(profile_data->>'profile_image_url', profile_image_url),
      bio = COALESCE(profile_data->>'bio', bio),
      is_profile_complete = COALESCE((profile_data->>'is_profile_complete')::boolean, is_profile_complete),
      updated_at = NOW()
    WHERE id = user_id;
  ELSE
    -- Insert new profile
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
      CASE WHEN profile_data->>'date_of_birth' IS NOT NULL THEN (profile_data->>'date_of_birth')::date ELSE NULL END,
      profile_data->>'ghana_mobile_number',
      profile_data->>'whatsapp_number',
      profile_data->>'linkedin_url',
      profile_data->>'level_of_study',
      profile_data->>'university',
      profile_data->>'major',
      CASE WHEN profile_data->>'year_of_enrollment' IS NOT NULL THEN (profile_data->>'year_of_enrollment')::integer ELSE NULL END,
      CASE WHEN profile_data->>'expected_completion_year' IS NOT NULL THEN (profile_data->>'expected_completion_year')::integer ELSE NULL END,
      CASE WHEN profile_data->>'year_of_study' IS NOT NULL THEN (profile_data->>'year_of_study')::integer ELSE NULL END,
      CASE WHEN profile_data->>'graduation_year' IS NOT NULL THEN (profile_data->>'graduation_year')::integer ELSE NULL END,
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
      NOW(),
      NOW()
    );
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(jsonb) TO authenticated, anon;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Now use this function in your signup code instead of direct INSERT/UPDATE

