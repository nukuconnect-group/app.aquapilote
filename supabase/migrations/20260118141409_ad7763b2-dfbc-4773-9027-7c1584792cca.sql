-- Fix 1: Remove permissive "WITH CHECK (true)" policies and restrict to service_role
DROP POLICY IF EXISTS "System can insert alert history" ON public.alert_history;
CREATE POLICY "Service role can insert alert history"
ON public.alert_history
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

-- Fix 2: Ensure team members can't access anything until status is active
DROP POLICY IF EXISTS "Team members can view own record" ON public.team_members;
CREATE POLICY "Team members can view own record"
ON public.team_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND status = 'active');

DROP POLICY IF EXISTS "Team members can view their unit assignments" ON public.team_member_units;
CREATE POLICY "Team members can view their unit assignments"
ON public.team_member_units
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.id = team_member_units.team_member_id
      AND (
        tm.owner_id = auth.uid()
        OR (tm.user_id = auth.uid() AND tm.status = 'active')
      )
  )
);

-- Fix 3: Remove email-based team member resolution (prevents spoofing via signup)
CREATE OR REPLACE FUNCTION public.get_team_member_owner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tm.owner_id
  FROM public.team_members tm
  WHERE tm.user_id = auth.uid()
    AND tm.status = 'active'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_team_member_of(owner_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.owner_id = owner_user_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
$$;