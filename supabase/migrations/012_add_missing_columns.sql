-- Add missing ghana_pincode column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ghana_pincode TEXT;

-- Verify it was added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'ghana_pincode'
    ) THEN
        RAISE EXCEPTION 'Column ghana_pincode was not added successfully';
    END IF;
END $$;
