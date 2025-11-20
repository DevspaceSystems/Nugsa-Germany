-- ============================================
-- PART 3: Indexes and RLS Policies
-- ============================================
-- Run this AFTER Part 2 (001b_functions_and_triggers.sql) succeeds

-- ============================================
-- 5. CREATE INDEXES (for better performance)
-- ============================================

-- Drop existing indexes if they exist (to avoid errors on re-run)
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_announcements_author;
DROP INDEX IF EXISTS idx_announcements_category;
DROP INDEX IF EXISTS idx_announcements_published;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_recipient;
DROP INDEX IF EXISTS idx_assistance_requests_student;
DROP INDEX IF EXISTS idx_assistance_requests_status;
DROP INDEX IF EXISTS idx_community_messages_sender;
DROP INDEX IF EXISTS idx_contact_inquiries_status;

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

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view verified student profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view published announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view community messages" ON community_messages;
DROP POLICY IF EXISTS "Authenticated users can send community messages" ON community_messages;
DROP POLICY IF EXISTS "Users can view their own assistance requests" ON assistance_requests;
DROP POLICY IF EXISTS "Users can create assistance requests" ON assistance_requests;
DROP POLICY IF EXISTS "Admins can update assistance requests" ON assistance_requests;
DROP POLICY IF EXISTS "Users can view their own approvals" ON admin_approvals;
DROP POLICY IF EXISTS "Admins can manage approvals" ON admin_approvals;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON contact_inquiries;
DROP POLICY IF EXISTS "Anyone can create inquiries" ON contact_inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON contact_inquiries;
DROP POLICY IF EXISTS "Anyone can view board members" ON board_members;
DROP POLICY IF EXISTS "Anyone can view published milestones" ON organization_milestones;
DROP POLICY IF EXISTS "Anyone can view active sponsors" ON sponsors;
DROP POLICY IF EXISTS "Anyone can view hero images" ON hero_images;
DROP POLICY IF EXISTS "Anyone can view constitution documents" ON constitution_documents;
DROP POLICY IF EXISTS "Admins can manage board members" ON board_members;
DROP POLICY IF EXISTS "Admins can manage milestones" ON organization_milestones;
DROP POLICY IF EXISTS "Admins can manage sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can manage hero images" ON hero_images;
DROP POLICY IF EXISTS "Admins can manage constitution documents" ON constitution_documents;
DROP POLICY IF EXISTS "Admins can manage organization settings" ON organization_settings;
DROP POLICY IF EXISTS "Admins can manage finance settings" ON finance_settings;

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
-- PART 3 COMPLETE
-- ============================================
-- All database structure is now complete!
-- Next: Run 002_rpc_functions.sql for additional functions

