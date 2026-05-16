
-- 1) Remove anonymous_visits from realtime publication (broadcast leak)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'anonymous_visits'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.anonymous_visits';
  END IF;
END $$;

-- 2) Helper: check if current user is a team member of owner AND assigned to the unit
CREATE OR REPLACE FUNCTION public.team_member_has_unit_access(_owner_id uuid, _unit_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    JOIN public.team_member_units tmu ON tmu.team_member_id = tm.id
    WHERE tm.owner_id = _owner_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tmu.unit_id = _unit_id
  )
$$;

-- 3) Tighten team-member INSERT policies to require unit assignment

-- feeding_records
DROP POLICY IF EXISTS "Team members can insert feeding records for owner" ON public.feeding_records;
CREATE POLICY "Team members can insert feeding records for owner"
ON public.feeding_records
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR (
    user_id = get_team_member_owner_id()
    AND get_team_member_owner_id() IS NOT NULL
    AND public.team_member_has_unit_access(user_id, unit_id)
  )
);

-- health_records
DROP POLICY IF EXISTS "Team members can insert health records for owner" ON public.health_records;
CREATE POLICY "Team members can insert health records for owner"
ON public.health_records
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR (
    user_id = get_team_member_owner_id()
    AND get_team_member_owner_id() IS NOT NULL
    AND public.team_member_has_unit_access(user_id, unit_id)
  )
);

-- planned_tasks (unit_id is nullable here)
DROP POLICY IF EXISTS "Team members can insert planned tasks for owner" ON public.planned_tasks;
CREATE POLICY "Team members can insert planned tasks for owner"
ON public.planned_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR (
    user_id = get_team_member_owner_id()
    AND get_team_member_owner_id() IS NOT NULL
    AND unit_id IS NOT NULL
    AND public.team_member_has_unit_access(user_id, unit_id)
  )
);
