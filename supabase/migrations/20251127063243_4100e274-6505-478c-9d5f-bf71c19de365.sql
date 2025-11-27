-- Create feeding_plans table for scheduling feeding activities
CREATE TABLE IF NOT EXISTS public.feeding_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  cycle_id UUID REFERENCES public.production_cycles(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  feed_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  days TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for feeding_plans
ALTER TABLE public.feeding_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feeding plans"
  ON public.feeding_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feeding plans"
  ON public.feeding_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feeding plans"
  ON public.feeding_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feeding plans"
  ON public.feeding_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_feeding_plans_updated_at
  BEFORE UPDATE ON public.feeding_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add infrastructure_id to feeding_records table
ALTER TABLE public.feeding_records
ADD COLUMN IF NOT EXISTS infrastructure_id UUID REFERENCES public.cycle_infrastructures(id) ON DELETE SET NULL;