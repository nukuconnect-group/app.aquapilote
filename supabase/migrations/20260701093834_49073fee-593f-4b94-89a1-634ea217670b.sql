
ALTER TABLE public.feed_calculations
  ADD COLUMN IF NOT EXISTS infrastructure_id text,
  ADD COLUMN IF NOT EXISTS infrastructure_name text,
  ADD COLUMN IF NOT EXISTS infrastructure_type text,
  ADD COLUMN IF NOT EXISTS fcr numeric,
  ADD COLUMN IF NOT EXISTS feed_price_per_kg numeric,
  ADD COLUMN IF NOT EXISTS sale_price_per_kg numeric,
  ADD COLUMN IF NOT EXISTS expected_cost numeric,
  ADD COLUMN IF NOT EXISTS expected_revenue numeric,
  ADD COLUMN IF NOT EXISTS expected_margin numeric,
  ADD COLUMN IF NOT EXISTS density_kg_per_m3 numeric,
  ADD COLUMN IF NOT EXISTS density_fish_per_m2 numeric,
  ADD COLUMN IF NOT EXISTS volume_m3 numeric,
  ADD COLUMN IF NOT EXISTS surface_m2 numeric,
  ADD COLUMN IF NOT EXISTS meal_schedule jsonb,
  ADD COLUMN IF NOT EXISTS calc_mode text DEFAULT 'basic';

ALTER TABLE public.fish_species
  ADD COLUMN IF NOT EXISTS default_fcr numeric;

UPDATE public.fish_species SET default_fcr = 1.5 WHERE default_fcr IS NULL;
