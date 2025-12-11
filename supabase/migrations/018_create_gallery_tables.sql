-- Create gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    event_date DATE,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON public.gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_event_date ON public.gallery_items(event_date);
CREATE INDEX IF NOT EXISTS idx_gallery_items_is_featured ON public.gallery_items(is_featured);

-- RLS Policies for gallery_items
CREATE POLICY "Public read access for gallery items"
    ON public.gallery_items FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage gallery items"
    ON public.gallery_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_gallery_items_updated_at
    BEFORE UPDATE ON public.gallery_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage Bucket Setup for 'gallery'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage bucket
CREATE POLICY "Public read access for gallery bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload to gallery bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'gallery'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can update gallery bucket files"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'gallery'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

CREATE POLICY "Admins can delete gallery bucket files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'gallery'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_verified = true
        )
    );

-- Insert sample data
INSERT INTO public.gallery_items (title, description, image_url, category, event_date, is_featured) VALUES
('Independence Day Celebration 2024', 'Celebrating 67 years of Ghana independence in Berlin.', 'https://images.unsplash.com/photo-1563220499-1bd171328014?auto=format&fit=crop&q=80', 'Events', '2024-03-06', true),
('Annual General Meeting', 'NUGSA members gathered to discuss the year ahead.', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80', 'Meetings', '2024-01-15', false),
('Cultural Night Munich', 'Showcasing our rich heritage through dance and music.', 'https://images.unsplash.com/photo-1516382799247-87df95d790b7?auto=format&fit=crop&q=80', 'Events', '2023-11-20', true),
('Graduation Ceremony', 'Congratulating our members who graduated this semester.', 'https://images.unsplash.com/photo-1523580846055-a34253019302?auto=format&fit=crop&q=80', 'Community', '2024-07-20', false),
('Community Service Day', 'Giving back to the local community in Hamburg.', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80', 'Community', '2024-05-12', false),
('Executive Board Retreat', 'Planning session for the new executive board.', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80', 'Meetings', '2024-02-10', false),
('Afro-Beats Festival', 'Enjoying the vibes at the summer festival.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80', 'Events', '2024-08-15', true),
('Student Welcome Party', 'Welcoming new Ghanaian students to Germany.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80', 'Social', '2023-10-01', false);
