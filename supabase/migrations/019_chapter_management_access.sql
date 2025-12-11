-- Add managed_chapter_id to profiles for assigning chapter leads
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS managed_chapter_id UUID REFERENCES public.chapters(id);

CREATE INDEX IF NOT EXISTS idx_profiles_managed_chapter_id ON public.profiles(managed_chapter_id);

-- RLS Policies for Chapters (Update only for leads)
CREATE POLICY "Chapter leads can update their own chapter"
    ON public.chapters
    FOR UPDATE
    USING (
        id = (
            SELECT managed_chapter_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- RLS Policies for Chapter Leaders table
CREATE POLICY "Chapter leads can insert their chapter leaders"
    ON public.chapter_leaders
    FOR INSERT
    WITH CHECK (
        chapter_id = (
            SELECT managed_chapter_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Chapter leads can update their chapter leaders"
    ON public.chapter_leaders
    FOR UPDATE
    USING (
        chapter_id = (
            SELECT managed_chapter_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Chapter leads can delete their chapter leaders"
    ON public.chapter_leaders
    FOR DELETE
    USING (
        chapter_id = (
            SELECT managed_chapter_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- RLS Policies for Chapter Activities table
CREATE POLICY "Chapter leads can insert their chapter activities"
    ON public.chapter_activities
    FOR INSERT
    WITH CHECK (
        chapter_id = (
            SELECT managed_chapter_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Chapter leads can update their chapter activities"
    ON public.chapter_activities
    FOR UPDATE
    USING (
        chapter_id = (
            SELECT managed_chapter_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Chapter leads can delete their chapter activities"
    ON public.chapter_activities
    FOR DELETE
    USING (
        chapter_id = (
            SELECT managed_chapter_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );
