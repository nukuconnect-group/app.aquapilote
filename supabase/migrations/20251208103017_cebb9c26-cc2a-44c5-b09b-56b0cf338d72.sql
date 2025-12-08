-- Table pour la reproduction artificielle (écloseries uniquement)
CREATE TABLE public.reproduction_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  
  -- Informations sur les géniteurs
  species TEXT NOT NULL,
  broodstock_male_count INTEGER DEFAULT 0,
  broodstock_female_count INTEGER DEFAULT 0,
  broodstock_batch_id UUID REFERENCES public.livestock_batches(id) ON DELETE SET NULL,
  
  -- Reproduction
  reproduction_date DATE NOT NULL,
  reproduction_method TEXT NOT NULL DEFAULT 'hormonal', -- hormonal, naturel, strip spawning
  hormone_used TEXT,
  hormone_dose NUMERIC,
  
  -- Ponte
  spawning_date DATE,
  egg_count INTEGER,
  spawning_rate NUMERIC, -- pourcentage de femelles ayant pondu
  fertilization_rate NUMERIC, -- taux de fécondation
  
  -- Incubation
  incubation_start_date DATE,
  incubation_temperature NUMERIC,
  
  -- Éclosion
  hatching_date DATE,
  hatching_rate NUMERIC, -- pourcentage d'éclosion
  larvae_count INTEGER,
  
  -- Alevinage
  larvae_transfer_date DATE,
  fry_count INTEGER, -- nombre d'alevins après absorption vésicule
  survival_rate NUMERIC, -- taux de survie global
  
  -- Statut et notes
  status TEXT NOT NULL DEFAULT 'en_cours', -- en_cours, terminé, échoué
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reproduction_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own reproduction records"
ON public.reproduction_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reproduction records"
ON public.reproduction_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reproduction records"
ON public.reproduction_records FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reproduction records"
ON public.reproduction_records FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_reproduction_records_updated_at
BEFORE UPDATE ON public.reproduction_records
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();