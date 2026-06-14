
-- Add WITH CHECK to existing owner UPDATE policies and add team-member UPDATE policies

-- feeding_records
DROP POLICY IF EXISTS "Users can update their own feeding records" ON public.feeding_records;
CREATE POLICY "Users can update their own feeding records"
  ON public.feeding_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team members can update feeding records for owner"
  ON public.feeding_records FOR UPDATE
  USING (
    user_id = get_team_member_owner_id()
    AND get_team_member_owner_id() IS NOT NULL
    AND team_member_has_unit_access(user_id, unit_id)
  )
  WITH CHECK (
    user_id = get_team_member_owner_id()
    AND get_team_member_owner_id() IS NOT NULL
    AND team_member_has_unit_access(user_id, unit_id)
  );

-- health_records
DROP POLICY IF EXISTS "Users can update their own health records" ON public.health_records;
CREATE POLICY "Users can update their own health records"
  ON public.health_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team members can update health records for owner"
  ON public.health_records FOR UPDATE
  USING (
    user_id = get_team_member_owner_id()
    AND get_team_member_owner_id() IS NOT NULL
    AND team_member_has_unit_access(user_id, unit_id)
  )
  WITH CHECK (
    user_id = get_team_member_owner_id()
    AND get_team_member_owner_id() IS NOT NULL
    AND team_member_has_unit_access(user_id, unit_id)
  );

-- planned_tasks
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.planned_tasks;
CREATE POLICY "Users can update their own tasks"
  ON public.planned_tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team members can update planned tasks for owner"
  ON public.planned_tasks FOR UPDATE
  USING (
    user_id = get_team_member_owner_id()
    AND get_team_member_owner_id() IS NOT NULL
    AND unit_id IS NOT NULL
    AND team_member_has_unit_access(user_id, unit_id)
  )
  WITH CHECK (
    user_id = get_team_member_owner_id()
    AND get_team_member_owner_id() IS NOT NULL
    AND unit_id IS NOT NULL
    AND team_member_has_unit_access(user_id, unit_id)
  );
