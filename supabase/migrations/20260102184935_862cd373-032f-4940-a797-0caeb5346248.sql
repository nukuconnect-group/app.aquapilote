-- Add new columns to feeding_records for detailed session tracking
ALTER TABLE public.feeding_records 
ADD COLUMN IF NOT EXISTS session_type text DEFAULT 'matin',
ADD COLUMN IF NOT EXISTS feeder_name text,
ADD COLUMN IF NOT EXISTS prescribed_quantity numeric,
ADD COLUMN IF NOT EXISTS actual_quantity numeric,
ADD COLUMN IF NOT EXISTS remaining_quantity numeric,
ADD COLUMN IF NOT EXISTS mortality integer DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.feeding_records.session_type IS 'Type de session: matin, midi, apres-midi, soir, nuit, autre';
COMMENT ON COLUMN public.feeding_records.feeder_name IS 'Nom de la personne qui a nourri';
COMMENT ON COLUMN public.feeding_records.prescribed_quantity IS 'Quantité prescrite en kg';
COMMENT ON COLUMN public.feeding_records.actual_quantity IS 'Quantité réellement servie en kg';
COMMENT ON COLUMN public.feeding_records.remaining_quantity IS 'Quantité restante non consommée';
COMMENT ON COLUMN public.feeding_records.mortality IS 'Nombre de mortalités observées';