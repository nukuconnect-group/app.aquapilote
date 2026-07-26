
CREATE POLICY "Admins can insert notifications for anyone"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team owners can notify their members"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.owner_id = auth.uid()
      AND tm.user_id = notifications.user_id
      AND tm.status = 'active'
  )
);

CREATE POLICY "Team members can notify their owner"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = auth.uid()
      AND tm.owner_id = notifications.user_id
      AND tm.status = 'active'
  )
);
