-- Table pour les membres d'équipe avec permissions par module
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  member_email TEXT NOT NULL,
  member_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  department TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  permissions JSONB NOT NULL DEFAULT '{}',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (owner_id, member_email)
);

-- Index pour les recherches
CREATE INDEX idx_team_members_owner ON public.team_members(owner_id);
CREATE INDEX idx_team_members_email ON public.team_members(member_email);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policies: Le propriétaire peut tout faire sur ses membres
CREATE POLICY "Users can view their own team members"
ON public.team_members
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own team members"
ON public.team_members
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own team members"
ON public.team_members
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own team members"
ON public.team_members
FOR DELETE
USING (auth.uid() = owner_id);

-- Trigger pour updated_at
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();