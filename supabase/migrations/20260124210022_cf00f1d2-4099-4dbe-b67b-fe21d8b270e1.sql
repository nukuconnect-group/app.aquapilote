-- Add male_count and female_count columns to livestock_batches for broodstock tracking
ALTER TABLE public.livestock_batches
ADD COLUMN IF NOT EXISTS male_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS female_count integer DEFAULT 0;