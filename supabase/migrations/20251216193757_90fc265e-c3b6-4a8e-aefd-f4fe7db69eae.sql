-- Fix team_member_units RLS policies to be permissive
DROP POLICY IF EXISTS "Users can insert their team member units" ON public.team_member_units;
CREATE POLICY "Users can insert their team member units"
ON public.team_member_units
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.id = team_member_units.team_member_id
    AND team_members.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view their team member units" ON public.team_member_units;
CREATE POLICY "Users can view their team member units"
ON public.team_member_units
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.id = team_member_units.team_member_id
    AND team_members.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their team member units" ON public.team_member_units;
CREATE POLICY "Users can update their team member units"
ON public.team_member_units
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.id = team_member_units.team_member_id
    AND team_members.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their team member units" ON public.team_member_units;
CREATE POLICY "Users can delete their team member units"
ON public.team_member_units
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.id = team_member_units.team_member_id
    AND team_members.owner_id = auth.uid()
  )
);