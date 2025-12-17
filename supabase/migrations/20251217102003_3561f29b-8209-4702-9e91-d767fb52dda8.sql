-- Créer la table pour les unités de production
CREATE TABLE public.production_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  capacity INTEGER NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  manager TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production_units ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own production units"
ON public.production_units
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own production units"
ON public.production_units
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own production units"
ON public.production_units
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own production units"
ON public.production_units
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_production_units_updated_at
BEFORE UPDATE ON public.production_units
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();