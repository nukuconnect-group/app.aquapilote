-- Ajouter le champ "type" à la table livestock_batches pour différencier alevins, géniteurs, etc.
ALTER TABLE public.livestock_batches
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'alevins';