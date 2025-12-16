-- Ajouter les colonnes de suspension et pays à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason text,
ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS country_code text;

-- Créer un index pour les recherches par pays
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);