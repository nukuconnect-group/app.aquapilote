-- Créer la table des cycles de production
CREATE TABLE IF NOT EXISTS public.production_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  target_quantity INTEGER NOT NULL,
  initial_quantity INTEGER,
  fingerlings_count INTEGER,
  stocking_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des enregistrements d'alimentation
CREATE TABLE IF NOT EXISTS public.feeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cycle_id UUID REFERENCES public.production_cycles(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  feed_type TEXT,
  quantity DECIMAL(10, 2) NOT NULL,
  fcr DECIMAL(5, 2),
  temperature DECIMAL(5, 2),
  behavior TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des enregistrements de santé (pêche de contrôle)
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cycle_id UUID REFERENCES public.production_cycles(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL,
  basin_id TEXT,
  date DATE NOT NULL,
  temperature DECIMAL(5, 2),
  ph DECIMAL(4, 2),
  oxygen DECIMAL(5, 2),
  density DECIMAL(10, 2),
  mortality DECIMAL(5, 2),
  feeding DECIMAL(10, 2),
  average_weight DECIMAL(10, 2),
  sample_count INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.production_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour production_cycles
CREATE POLICY "Users can view their own cycles"
  ON public.production_cycles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycles"
  ON public.production_cycles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycles"
  ON public.production_cycles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cycles"
  ON public.production_cycles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques RLS pour feeding_records
CREATE POLICY "Users can view their own feeding records"
  ON public.feeding_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feeding records"
  ON public.feeding_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feeding records"
  ON public.feeding_records
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feeding records"
  ON public.feeding_records
  FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques RLS pour health_records
CREATE POLICY "Users can view their own health records"
  ON public.health_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health records"
  ON public.health_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records"
  ON public.health_records
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health records"
  ON public.health_records
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour updated_at sur production_cycles
CREATE TRIGGER update_production_cycles_updated_at
  BEFORE UPDATE ON public.production_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger pour updated_at sur feeding_records
CREATE TRIGGER update_feeding_records_updated_at
  BEFORE UPDATE ON public.feeding_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger pour updated_at sur health_records
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Créer des index pour améliorer les performances
CREATE INDEX idx_production_cycles_user_id ON public.production_cycles(user_id);
CREATE INDEX idx_production_cycles_unit_id ON public.production_cycles(unit_id);
CREATE INDEX idx_production_cycles_status ON public.production_cycles(status);

CREATE INDEX idx_feeding_records_user_id ON public.feeding_records(user_id);
CREATE INDEX idx_feeding_records_cycle_id ON public.feeding_records(cycle_id);
CREATE INDEX idx_feeding_records_date ON public.feeding_records(date);

CREATE INDEX idx_health_records_user_id ON public.health_records(user_id);
CREATE INDEX idx_health_records_cycle_id ON public.health_records(cycle_id);
CREATE INDEX idx_health_records_date ON public.health_records(date);