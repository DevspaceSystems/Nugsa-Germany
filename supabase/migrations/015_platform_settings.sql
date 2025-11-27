-- ============================================
-- PLATFORM SETTINGS TABLE
-- ============================================
-- This table stores system-wide platform settings
-- that can be controlled by administrators

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO platform_settings (setting_key, setting_value, description) VALUES
  ('maintenance_mode', 'false', 'Enable maintenance mode to restrict access to admins only'),
  ('allow_registrations', 'true', 'Allow new user registrations'),
  ('email_notifications', 'true', 'Enable email notifications system-wide')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view platform settings" ON platform_settings;
DROP POLICY IF EXISTS "Admins can update platform settings" ON platform_settings;

-- Admin-only policies
CREATE POLICY "Admins can view platform settings"
  ON platform_settings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update platform settings"
  ON platform_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);

-- ============================================
-- VERIFICATION
-- ============================================
-- Verify the table was created and settings inserted
SELECT * FROM platform_settings ORDER BY setting_key;
