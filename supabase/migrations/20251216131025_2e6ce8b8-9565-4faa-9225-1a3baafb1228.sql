-- Table de liaison entre membres et unités de production
CREATE TABLE public.team_member_units (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    unit_id TEXT NOT NULL,
    unit_name TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(team_member_id, unit_id)
);

-- Enable RLS
ALTER TABLE public.team_member_units ENABLE ROW LEVEL SECURITY;

-- Index for performance
CREATE INDEX idx_team_member_units_member ON public.team_member_units(team_member_id);
CREATE INDEX idx_team_member_units_unit ON public.team_member_units(unit_id);

-- RLS Policies - Users can manage units of their team members
CREATE POLICY "Users can view their team member units" 
ON public.team_member_units 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_members.id = team_member_units.team_member_id 
        AND team_members.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their team member units" 
ON public.team_member_units 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_members.id = team_member_units.team_member_id 
        AND team_members.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can update their team member units" 
ON public.team_member_units 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_members.id = team_member_units.team_member_id 
        AND team_members.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their team member units" 
ON public.team_member_units 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_members.id = team_member_units.team_member_id 
        AND team_members.owner_id = auth.uid()
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_team_member_units_updated_at
    BEFORE UPDATE ON public.team_member_units
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add custom_role column to team_members for personalized roles
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS custom_role TEXT;