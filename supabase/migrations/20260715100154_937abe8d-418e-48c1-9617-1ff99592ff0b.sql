
-- Extend profiles with additional company/institutional fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_stamp_url text,
  ADD COLUMN IF NOT EXISTS company_signature_url text,
  ADD COLUMN IF NOT EXISTS company_cif_nif text,
  ADD COLUMN IF NOT EXISTS company_rccm text,
  ADD COLUMN IF NOT EXISTS company_website text,
  ADD COLUMN IF NOT EXISTS company_legal_representative text;

-- Create feeding_sheets table for professional feeding plans
CREATE TABLE IF NOT EXISTS public.feeding_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  unit_id text NOT NULL,
  infrastructure_id uuid,
  cycle_id uuid,
  title text NOT NULL,
  period text NOT NULL DEFAULT 'matin', -- matin | midi | soir
  time time NOT NULL,
  feed_type text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg',
  responsible_name text,
  observations text,
  frequency text NOT NULL DEFAULT 'daily', -- daily | weekly | monthly
  days text[] NOT NULL DEFAULT ARRAY['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche']::text[],
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feeding_sheets TO authenticated;
GRANT ALL ON public.feeding_sheets TO service_role;

ALTER TABLE public.feeding_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own feeding sheets"
  ON public.feeding_sheets
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.team_member_has_unit_access(user_id, unit_id)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.team_member_has_unit_access(user_id, unit_id)
  );

CREATE TRIGGER trg_feeding_sheets_updated_at
  BEFORE UPDATE ON public.feeding_sheets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_feeding_sheets_user ON public.feeding_sheets(user_id);
CREATE INDEX IF NOT EXISTS idx_feeding_sheets_unit ON public.feeding_sheets(unit_id);
CREATE INDEX IF NOT EXISTS idx_feeding_sheets_infra ON public.feeding_sheets(infrastructure_id);
