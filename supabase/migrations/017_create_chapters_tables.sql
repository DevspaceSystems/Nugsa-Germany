-- Create chapters table
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

-- Create chapter_leaders table
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

-- Create chapter_activities table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chapters_region ON public.chapters(region);
CREATE INDEX IF NOT EXISTS idx_chapters_city ON public.chapters(city);
CREATE INDEX IF NOT EXISTS idx_chapters_is_active ON public.chapters(is_active);
CREATE INDEX IF NOT EXISTS idx_chapter_leaders_chapter_id ON public.chapter_leaders(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_leaders_order_priority ON public.chapter_leaders(order_priority);
CREATE INDEX IF NOT EXISTS idx_chapter_activities_chapter_id ON public.chapter_activities(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_activities_date ON public.chapter_activities(date);
CREATE INDEX IF NOT EXISTS idx_chapter_activities_category ON public.chapter_activities(category);

-- Enable RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapters (public read, admin write)
CREATE POLICY "Anyone can view active chapters"
    ON public.chapters FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can view all chapters"
    ON public.chapters FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can insert chapters"
    ON public.chapters FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can update chapters"
    ON public.chapters FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can delete chapters"
    ON public.chapters FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

-- RLS Policies for chapter_leaders (public read, admin write)
CREATE POLICY "Anyone can view active chapter leaders"
    ON public.chapter_leaders FOR SELECT
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM public.chapters
            WHERE chapters.id = chapter_leaders.chapter_id
            AND chapters.is_active = true
        )
    );

CREATE POLICY "Admins can view all chapter leaders"
    ON public.chapter_leaders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can insert chapter leaders"
    ON public.chapter_leaders FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can update chapter leaders"
    ON public.chapter_leaders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can delete chapter leaders"
    ON public.chapter_leaders FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

-- RLS Policies for chapter_activities (public read, admin write)
CREATE POLICY "Anyone can view chapter activities"
    ON public.chapter_activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chapters
            WHERE chapters.id = chapter_activities.chapter_id
            AND chapters.is_active = true
        )
    );

CREATE POLICY "Admins can view all chapter activities"
    ON public.chapter_activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can insert chapter activities"
    ON public.chapter_activities FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can update chapter activities"
    ON public.chapter_activities FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can delete chapter activities"
    ON public.chapter_activities FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_chapters_updated_at
    BEFORE UPDATE ON public.chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapter_leaders_updated_at
    BEFORE UPDATE ON public.chapter_leaders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapter_activities_updated_at
    BEFORE UPDATE ON public.chapter_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for demonstration
INSERT INTO public.chapters (name, city, region, description, contact_email, established_date, member_count, meeting_schedule) VALUES
('NUGSA Berlin', 'Berlin', 'Berlin', 'The Berlin chapter of NUGSA serves Ghanaian students across all universities in Berlin. We organize cultural events, academic support sessions, and networking opportunities.', 'berlin@nugsa-germany.org', '2019-03-15', 45, 'First Saturday of every month at 3:00 PM'),
('NUGSA Munich', 'Munich', 'Bavaria', 'NUGSA Munich brings together Ghanaian students in Bavaria''s capital. We focus on academic excellence, cultural preservation, and community building.', 'munich@nugsa-germany.org', '2019-09-20', 38, 'Second Sunday of every month at 2:00 PM'),
('NUGSA Hamburg', 'Hamburg', 'Hamburg', 'The Hamburg chapter serves the vibrant Ghanaian student community in Northern Germany. We emphasize professional development and cultural exchange.', 'hamburg@nugsa-germany.org', '2020-01-10', 32, 'Third Saturday of every month at 4:00 PM'),
('NUGSA Frankfurt', 'Frankfurt', 'Hesse', 'NUGSA Frankfurt connects Ghanaian students in the financial capital of Germany. We organize career workshops, cultural celebrations, and social gatherings.', 'frankfurt@nugsa-germany.org', '2020-06-05', 28, 'Last Friday of every month at 6:00 PM');

-- Insert sample chapter leaders
INSERT INTO public.chapter_leaders (chapter_id, name, position, bio, email, order_priority) VALUES
((SELECT id FROM public.chapters WHERE city = 'Berlin'), 'Kwame Mensah', 'Chapter President', 'PhD candidate in Computer Science at TU Berlin. Passionate about technology and community building.', 'kwame.mensah@example.com', 1),
((SELECT id FROM public.chapters WHERE city = 'Berlin'), 'Ama Osei', 'Vice President', 'Master''s student in International Relations at Humboldt University. Dedicated to student welfare and advocacy.', 'ama.osei@example.com', 2),
((SELECT id FROM public.chapters WHERE city = 'Berlin'), 'Kofi Asante', 'Secretary', 'Engineering student at TU Berlin with a passion for organization and documentation.', 'kofi.asante@example.com', 3),
((SELECT id FROM public.chapters WHERE city = 'Munich'), 'Akosua Boateng', 'Chapter President', 'Medical student at LMU Munich. Committed to healthcare advocacy and student support.', 'akosua.boateng@example.com', 1),
((SELECT id FROM public.chapters WHERE city = 'Munich'), 'Yaw Owusu', 'Vice President', 'MBA student at TUM. Focused on professional development and networking.', 'yaw.owusu@example.com', 2),
((SELECT id FROM public.chapters WHERE city = 'Hamburg'), 'Abena Adjei', 'Chapter President', 'Law student at University of Hamburg. Advocate for student rights and cultural preservation.', 'abena.adjei@example.com', 1),
((SELECT id FROM public.chapters WHERE city = 'Hamburg'), 'Kwabena Nkrumah', 'Treasurer', 'Business student managing chapter finances and fundraising initiatives.', 'kwabena.nkrumah@example.com', 2),
((SELECT id FROM public.chapters WHERE city = 'Frankfurt'), 'Efua Darko', 'Chapter President', 'Finance student at Goethe University. Leading initiatives in career development.', 'efua.darko@example.com', 1);

-- Insert sample chapter activities
INSERT INTO public.chapter_activities (chapter_id, title, description, date, location, category, attendees_count, is_featured) VALUES
((SELECT id FROM public.chapters WHERE city = 'Berlin'), 'Ghana Independence Day Celebration', 'Annual celebration of Ghana''s independence with cultural performances, traditional food, and networking.', '2024-03-06 18:00:00+00', 'TU Berlin Main Hall', 'Cultural', 120, true),
((SELECT id FROM public.chapters WHERE city = 'Berlin'), 'Academic Excellence Workshop', 'Workshop on research methodologies and academic writing for graduate students.', '2024-11-15 14:00:00+00', 'Humboldt University Library', 'Academic', 35, false),
((SELECT id FROM public.chapters WHERE city = 'Munich'), 'Career Networking Night', 'Networking event connecting students with Ghanaian professionals in Germany.', '2024-10-20 18:30:00+00', 'TUM Campus', 'Professional', 45, true),
((SELECT id FROM public.chapters WHERE city = 'Munich'), 'Cultural Heritage Day', 'Showcasing Ghanaian culture through music, dance, and traditional cuisine.', '2024-12-08 16:00:00+00', 'LMU Cultural Center', 'Cultural', 80, false),
((SELECT id FROM public.chapters WHERE city = 'Hamburg'), 'Community Service Initiative', 'Volunteering at local community centers and supporting integration programs.', '2024-11-25 10:00:00+00', 'Hamburg Community Center', 'Community Service', 25, false),
((SELECT id FROM public.chapters WHERE city = 'Frankfurt'), 'Financial Literacy Seminar', 'Seminar on personal finance, investing, and financial planning for students.', '2024-12-15 17:00:00+00', 'Goethe University', 'Professional', 40, true);
