-- ============================================
-- Ghasai Platform Database Schema
-- ============================================
-- This migration creates the complete database structure
-- Run this in your new Supabase project's SQL Editor

-- ============================================
-- 1. CREATE ENUMS
-- ============================================

-- User role enum
CREATE TYPE user_role AS ENUM ('student', 'admin');

-- Announcement category enum
CREATE TYPE announcement_category AS ENUM (
  'scholarships',
  'jobs',
  'sports',
  'events',
  'general'
);

-- Inquiry status enum
CREATE TYPE inquiry_status AS ENUM (
  'pending',
  'in_progress',
  'resolved'
);

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- Profiles table (main user profile table)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role,
  is_verified BOOLEAN DEFAULT FALSE,
  is_profile_complete BOOLEAN DEFAULT FALSE,
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
  date_of_birth DATE,
  current_address_street TEXT,
  current_address_city TEXT,
  current_address_state TEXT,
  current_address_postal_code TEXT,
  permanent_address_street TEXT,
  permanent_address_city TEXT,
  permanent_address_state TEXT,
  permanent_address_postal_code TEXT,
  same_as_current_address BOOLEAN,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_number TEXT,
  passport_document_url TEXT,
  school_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin approvals table
CREATE TABLE admin_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category announcement_category NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Assistance requests table
CREATE TABLE assistance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  request_type TEXT NOT NULL,
  urgency_level TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board members table
CREATE TABLE board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  image_url TEXT,
  quote TEXT,
  academic_background TEXT,
  leadership_experience TEXT,
  year TEXT,
  order_priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community messages table
CREATE TABLE community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constitution documents table
CREATE TABLE constitution_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  file_url TEXT NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact inquiries table
CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status inquiry_status DEFAULT 'pending',
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Finance settings table
CREATE TABLE finance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero images table
CREATE TABLE hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  order_priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (private messages)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization milestones table
CREATE TABLE organization_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date_achieved DATE NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization settings table
CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsors table
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  donation_link TEXT,
  bank_details JSONB,
  mobile_money_details JSONB,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ============================================
-- 3. CREATE FUNCTIONS
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE TRIGGERS
-- ============================================

-- Auto-update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for admin_approvals
CREATE TRIGGER update_admin_approvals_updated_at
  BEFORE UPDATE ON admin_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for announcements
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for assistance_requests
CREATE TRIGGER update_assistance_requests_updated_at
  BEFORE UPDATE ON assistance_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for board_members
CREATE TRIGGER update_board_members_updated_at
  BEFORE UPDATE ON board_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for community_messages
CREATE TRIGGER update_community_messages_updated_at
  BEFORE UPDATE ON community_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for constitution_documents
CREATE TRIGGER update_constitution_documents_updated_at
  BEFORE UPDATE ON constitution_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for contact_inquiries
CREATE TRIGGER update_contact_inquiries_updated_at
  BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for finance_settings
CREATE TRIGGER update_finance_settings_updated_at
  BEFORE UPDATE ON finance_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for hero_images
CREATE TRIGGER update_hero_images_updated_at
  BEFORE UPDATE ON hero_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for organization_milestones
CREATE TRIGGER update_organization_milestones_updated_at
  BEFORE UPDATE ON organization_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for organization_settings
CREATE TRIGGER update_organization_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for sponsors
CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. CREATE INDEXES (for better performance)
-- ============================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_published ON announcements(published);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_assistance_requests_student ON assistance_requests(student_id);
CREATE INDEX idx_assistance_requests_status ON assistance_requests(status);
CREATE INDEX idx_community_messages_sender ON community_messages(sender_id);
CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE constitution_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Public access to verified student profiles (for directory)
CREATE POLICY "Anyone can view verified student profiles"
  ON profiles FOR SELECT
  USING (is_verified = TRUE AND role = 'student');

-- Announcements policies
CREATE POLICY "Anyone can view published announcements"
  ON announcements FOR SELECT
  USING (published = TRUE OR author_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert announcements"
  ON announcements FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Community messages policies
CREATE POLICY "Anyone can view community messages"
  ON community_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send community messages"
  ON community_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Assistance requests policies
CREATE POLICY "Users can view their own assistance requests"
  ON assistance_requests FOR SELECT
  USING (auth.uid() = student_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create assistance requests"
  ON assistance_requests FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can update assistance requests"
  ON assistance_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Admin approvals policies
CREATE POLICY "Users can view their own approvals"
  ON admin_approvals FOR SELECT
  USING (auth.uid() = applicant_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage approvals"
  ON admin_approvals FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Contact inquiries policies
CREATE POLICY "Admins can view all inquiries"
  ON contact_inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create inquiries"
  ON contact_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update inquiries"
  ON contact_inquiries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Public read access for other tables
CREATE POLICY "Anyone can view board members"
  ON board_members FOR SELECT
  USING (is_active = TRUE OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view published milestones"
  ON organization_milestones FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view active sponsors"
  ON sponsors FOR SELECT
  USING (active = TRUE OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view hero images"
  ON hero_images FOR SELECT
  USING (is_active = TRUE OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view constitution documents"
  ON constitution_documents FOR SELECT
  USING (true);

-- Admin-only policies for settings and management tables
CREATE POLICY "Admins can manage board members"
  ON board_members FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage milestones"
  ON organization_milestones FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage sponsors"
  ON sponsors FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage hero images"
  ON hero_images FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage constitution documents"
  ON constitution_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage organization settings"
  ON organization_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage finance settings"
  ON finance_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- 7. CREATE PROFILE ON USER SIGNUP
-- ============================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Your database structure is now ready!
-- Next steps:
-- 1. Get your Supabase URL and anon key from Project Settings > API
-- 2. Update your .env file with the new credentials
-- 3. Generate new TypeScript types using Supabase CLI or Dashboard



