-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own team members" ON public.team_members;

-- Create permissive INSERT policy
CREATE POLICY "Users can insert their own team members"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Also fix the other policies to be permissive
DROP POLICY IF EXISTS "Users can view their own team members" ON public.team_members;
CREATE POLICY "Users can view their own team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own team members" ON public.team_members;
CREATE POLICY "Users can update their own team members"
ON public.team_members
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own team members" ON public.team_members;
CREATE POLICY "Users can delete their own team members"
ON public.team_members
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);