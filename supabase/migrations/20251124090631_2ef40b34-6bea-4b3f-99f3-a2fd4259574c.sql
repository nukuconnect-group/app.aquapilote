-- Créer une table pour gérer les infrastructures rattachées aux cycles
CREATE TABLE IF NOT EXISTS public.cycle_infrastructures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL,
  infrastructure_name TEXT NOT NULL,
  infrastructure_type TEXT NOT NULL,
  current_quantity INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL,
  CONSTRAINT fk_cycle FOREIGN KEY (cycle_id) REFERENCES public.production_cycles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.cycle_infrastructures ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own cycle infrastructures"
  ON public.cycle_infrastructures
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle infrastructures"
  ON public.cycle_infrastructures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycle infrastructures"
  ON public.cycle_infrastructures
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cycle infrastructures"
  ON public.cycle_infrastructures
  FOR DELETE
  USING (auth.uid() = user_id);

-- Créer un trigger pour mettre à jour updated_at
CREATE TRIGGER update_cycle_infrastructures_updated_at
  BEFORE UPDATE ON public.cycle_infrastructures
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Créer des index pour améliorer les performances
CREATE INDEX idx_cycle_infrastructures_cycle_id ON public.cycle_infrastructures(cycle_id);
CREATE INDEX idx_cycle_infrastructures_user_id ON public.cycle_infrastructures(user_id);