-- 1. Ajouter colonne dashboard_roles sur team_members (array: 'production', 'administration')
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS dashboard_roles text[] DEFAULT ARRAY[]::text[];

-- 2. Table de conversations AquaAssistant (synchronisée multi-appareils)
CREATE TABLE IF NOT EXISTS public.aqua_assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Nouvelle conversation',
  unit_id text,
  unit_name text,
  last_category text,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aqua_conv_user_updated
  ON public.aqua_assistant_conversations(user_id, updated_at DESC);

ALTER TABLE public.aqua_assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON public.aqua_assistant_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.aqua_assistant_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.aqua_assistant_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.aqua_assistant_conversations FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_aqua_conv_updated_at
  BEFORE UPDATE ON public.aqua_assistant_conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();