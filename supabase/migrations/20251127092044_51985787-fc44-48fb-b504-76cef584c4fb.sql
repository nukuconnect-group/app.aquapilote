-- Créer la table livestock_batches pour persister les lots de poissons
CREATE TABLE IF NOT EXISTS public.livestock_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  species TEXT NOT NULL,
  variety TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  average_weight NUMERIC DEFAULT 0,
  total_weight NUMERIC DEFAULT 0,
  acquisition_date DATE,
  source TEXT,
  unit_id TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  notes TEXT,
  expected_harvest_date DATE,
  current_age INTEGER DEFAULT 0,
  feeding_plan TEXT,
  last_health_check DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.livestock_batches ENABLE ROW LEVEL SECURITY;

-- Policies pour livestock_batches
CREATE POLICY "Users can view their own livestock batches"
  ON public.livestock_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own livestock batches"
  ON public.livestock_batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own livestock batches"
  ON public.livestock_batches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own livestock batches"
  ON public.livestock_batches FOR DELETE
  USING (auth.uid() = user_id);

-- Ajouter livestock_batch_id à cycle_infrastructures
ALTER TABLE public.cycle_infrastructures
ADD COLUMN IF NOT EXISTS livestock_batch_id UUID,
ADD CONSTRAINT fk_livestock_batch 
  FOREIGN KEY (livestock_batch_id) 
  REFERENCES public.livestock_batches(id) 
  ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cycle_infrastructures_livestock_batch 
  ON public.cycle_infrastructures(livestock_batch_id);

CREATE INDEX IF NOT EXISTS idx_livestock_batches_unit_id 
  ON public.livestock_batches(unit_id);

-- Trigger pour updated_at
CREATE TRIGGER update_livestock_batches_updated_at
  BEFORE UPDATE ON public.livestock_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();