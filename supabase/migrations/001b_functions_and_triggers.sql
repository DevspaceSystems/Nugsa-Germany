-- ============================================
-- PART 2: Functions and Triggers
-- ============================================
-- Run this AFTER Part 1 (001a_enums_and_tables.sql) succeeds

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

-- Drop existing triggers if they exist (to avoid errors on re-run)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_admin_approvals_updated_at ON admin_approvals;
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
DROP TRIGGER IF EXISTS update_assistance_requests_updated_at ON assistance_requests;
DROP TRIGGER IF EXISTS update_board_members_updated_at ON board_members;
DROP TRIGGER IF EXISTS update_community_messages_updated_at ON community_messages;
DROP TRIGGER IF EXISTS update_constitution_documents_updated_at ON constitution_documents;
DROP TRIGGER IF EXISTS update_contact_inquiries_updated_at ON contact_inquiries;
DROP TRIGGER IF EXISTS update_finance_settings_updated_at ON finance_settings;
DROP TRIGGER IF EXISTS update_hero_images_updated_at ON hero_images;
DROP TRIGGER IF EXISTS update_organization_milestones_updated_at ON organization_milestones;
DROP TRIGGER IF EXISTS update_organization_settings_updated_at ON organization_settings;
DROP TRIGGER IF EXISTS update_sponsors_updated_at ON sponsors;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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
-- PART 2 COMPLETE
-- ============================================
-- If this ran successfully, proceed to Part 3:
-- Run 001c_indexes_and_policies.sql next

