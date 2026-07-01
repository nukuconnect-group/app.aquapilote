
-- Helper function: does user have subscription plan >= required plan?
CREATE OR REPLACE FUNCTION public.user_meets_plan(_user_id uuid, _plan_min text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT CASE COALESCE(s.plan,'free')
             WHEN 'free' THEN 0 WHEN 'standard' THEN 1
             WHEN 'premium' THEN 2 WHEN 'enterprise' THEN 3 ELSE 0 END
    FROM public.subscriptions s
    WHERE s.user_id = _user_id
      AND s.status IN ('active','trialing')
    ORDER BY 1 DESC
    LIMIT 1
  ), 0) >= CASE COALESCE(_plan_min,'free')
    WHEN 'free' THEN 0 WHEN 'standard' THEN 1
    WHEN 'premium' THEN 2 WHEN 'enterprise' THEN 3 ELSE 99 END;
$$;

-- 1) activity_logs: allow users to read their own logs
CREATE POLICY "Users can view their own logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) premium_library_items: replace unscoped read with plan-scoped read
DROP POLICY IF EXISTS lib_read ON public.premium_library_items;
CREATE POLICY lib_read
ON public.premium_library_items
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.user_meets_plan(auth.uid(), plan_min)
  )
);

-- 3) storage.objects: restrict premium-library reads to users whose plan meets item plan_min
DROP POLICY IF EXISTS lib_read ON storage.objects;
CREATE POLICY lib_read
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'premium-library'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.premium_library_items i
      WHERE i.file_path = storage.objects.name
        AND i.is_published = true
        AND public.user_meets_plan(auth.uid(), i.plan_min)
    )
  )
);
