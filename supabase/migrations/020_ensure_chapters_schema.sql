-- Ensure Chapters Table Exists (from 017)
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    established_date DATE,
    logo_url TEXT,
    cover_image_url TEXT,
    meeting_schedule TEXT,
    social_media JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    member_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure Chapter Leaders Table Exists
CREATE TABLE IF NOT EXISTS public.chapter_leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    image_url TEXT,
    bio TEXT,
    email TEXT,
    phone TEXT,
    order_priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure Chapter Activities Table Exists
CREATE TABLE IF NOT EXISTS public.chapter_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    attendees_count INTEGER,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_activities ENABLE ROW LEVEL SECURITY;


-- Add Managed Chapter ID to Profiles (from 019)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'managed_chapter_id') THEN
        ALTER TABLE public.profiles ADD COLUMN managed_chapter_id UUID REFERENCES public.chapters(id);
    END IF;
END $$;

-- Create Index
CREATE INDEX IF NOT EXISTS idx_profiles_managed_chapter_id ON public.profiles(managed_chapter_id);


-- Update/Create Policies (Drop first to ensure clean state)

-- CHAPTERS POLICIES
DROP POLICY IF EXISTS "Admins can view all chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can insert chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can update chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can delete chapters" ON public.chapters;
DROP POLICY IF EXISTS "Anyone can view active chapters" ON public.chapters;
DROP POLICY IF EXISTS "Chapter leads can update their own chapter" ON public.chapters;

CREATE POLICY "Anyone can view active chapters" ON public.chapters FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all chapters" ON public.chapters FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can insert chapters" ON public.chapters FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update chapters" ON public.chapters FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete chapters" ON public.chapters FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- New Policy for Chapter Leads
CREATE POLICY "Chapter leads can update their own chapter" ON public.chapters FOR UPDATE USING (id = (SELECT managed_chapter_id FROM public.profiles WHERE id = auth.uid()));


-- CHAPTER LEADERS POLICIES
DROP POLICY IF EXISTS "Anyone can view active chapter leaders" ON public.chapter_leaders;
DROP POLICY IF EXISTS "Admins can view all chapter leaders" ON public.chapter_leaders;
DROP POLICY IF EXISTS "Admins can insert chapter leaders" ON public.chapter_leaders;
DROP POLICY IF EXISTS "Admins can update chapter leaders" ON public.chapter_leaders;
DROP POLICY IF EXISTS "Admins can delete chapter leaders" ON public.chapter_leaders;
DROP POLICY IF EXISTS "Chapter leads can insert their chapter leaders" ON public.chapter_leaders;
DROP POLICY IF EXISTS "Chapter leads can update their chapter leaders" ON public.chapter_leaders;
DROP POLICY IF EXISTS "Chapter leads can delete their chapter leaders" ON public.chapter_leaders;

CREATE POLICY "Anyone can view active chapter leaders" ON public.chapter_leaders FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all chapter leaders" ON public.chapter_leaders FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can manage chapter leaders" ON public.chapter_leaders FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Chapter leads can insert their chapter leaders" ON public.chapter_leaders FOR INSERT WITH CHECK (chapter_id = (SELECT managed_chapter_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Chapter leads can update their chapter leaders" ON public.chapter_leaders FOR UPDATE USING (chapter_id = (SELECT managed_chapter_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Chapter leads can delete their chapter leaders" ON public.chapter_leaders FOR DELETE USING (chapter_id = (SELECT managed_chapter_id FROM public.profiles WHERE id = auth.uid()));


-- CHAPTER ACTIVITIES POLICIES
DROP POLICY IF EXISTS "Anyone can view chapter activities" ON public.chapter_activities;
DROP POLICY IF EXISTS "Admins can view all chapter activities" ON public.chapter_activities;
DROP POLICY IF EXISTS "Admins can manage chapter activities" ON public.chapter_activities;
DROP POLICY IF EXISTS "Chapter leads can insert their chapter activities" ON public.chapter_activities;
DROP POLICY IF EXISTS "Chapter leads can update their chapter activities" ON public.chapter_activities;
DROP POLICY IF EXISTS "Chapter leads can delete their chapter activities" ON public.chapter_activities;

CREATE POLICY "Anyone can view chapter activities" ON public.chapter_activities FOR SELECT USING (true);
CREATE POLICY "Admins can view all chapter activities" ON public.chapter_activities FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can manage chapter activities" ON public.chapter_activities FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Chapter leads can insert their chapter activities" ON public.chapter_activities FOR INSERT WITH CHECK (chapter_id = (SELECT managed_chapter_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Chapter leads can update their chapter activities" ON public.chapter_activities FOR UPDATE USING (chapter_id = (SELECT managed_chapter_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Chapter leads can delete their chapter activities" ON public.chapter_activities FOR DELETE USING (chapter_id = (SELECT managed_chapter_id FROM public.profiles WHERE id = auth.uid()));
