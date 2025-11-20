-- ============================================
-- Additional RPC Functions for NUGSA-Germany
-- ============================================
-- Run this AFTER running 001_initial_schema.sql

-- Function to get public student directory (for non-authenticated users)
CREATE OR REPLACE FUNCTION get_public_students()
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role user_role,
  is_verified BOOLEAN,
  phone TEXT,
  profile_image_url TEXT,
  university TEXT,
  major TEXT,
  current_city TEXT,
  current_state TEXT,
  hometown TEXT,
  ghana_region TEXT,
  ghana_mobile_number TEXT,
  linkedin_url TEXT,
  whatsapp_number TEXT,
  bio TEXT,
  india_phone TEXT,
  india_state TEXT,
  india_city TEXT,
  india_pincode TEXT,
  gender TEXT,
  marital_status TEXT,
  level_of_study TEXT,
  year_of_enrollment INTEGER,
  expected_completion_year INTEGER,
  year_of_study INTEGER,
  graduation_year INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.is_verified,
    p.phone,
    p.profile_image_url,
    p.university,
    p.major,
    p.current_city,
    p.current_state,
    p.hometown,
    p.ghana_region,
    p.ghana_mobile_number,
    p.linkedin_url,
    p.whatsapp_number,
    p.bio,
    p.india_phone,
    p.india_state,
    p.india_city,
    p.india_pincode,
    p.gender,
    p.marital_status,
    p.level_of_study,
    p.year_of_enrollment,
    p.expected_completion_year,
    p.year_of_study,
    p.graduation_year,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.is_verified = TRUE
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to get public stats (for homepage)
CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS TABLE (
  active_students BIGINT,
  indian_states BIGINT,
  universities BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::BIGINT FROM profiles WHERE is_verified = TRUE) as active_students,
    (SELECT COUNT(DISTINCT india_state)::BIGINT FROM profiles WHERE is_verified = TRUE AND india_state IS NOT NULL) as indian_states,
    (SELECT COUNT(DISTINCT university)::BIGINT FROM profiles WHERE is_verified = TRUE AND university IS NOT NULL) as universities;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_public_students() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_public_stats() TO anon, authenticated;

