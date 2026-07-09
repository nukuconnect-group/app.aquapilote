
DROP POLICY IF EXISTS "Users can insert their own cycle infrastructures" ON public.cycle_infrastructures;

CREATE POLICY "Users can insert their own cycle infrastructures"
ON public.cycle_infrastructures
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.production_cycles pc
    WHERE pc.id = cycle_infrastructures.cycle_id
      AND (pc.user_id = auth.uid() OR pc.user_id = public.get_team_member_owner_id())
  )
);
