
CREATE OR REPLACE FUNCTION public.get_current_subscription(_user_id uuid)
 RETURNS TABLE(id uuid, plan text, status text, start_date date, end_date date, days_remaining integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller uuid := auth.uid();
  v_target uuid;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  -- Admins may look up any user's subscription; everyone else is restricted
  -- to their own record. Fixes DEFINER_OR_RPC_BYPASS: rpc_get_subscription.
  IF public.has_role(v_caller, 'admin'::app_role) THEN
    v_target := COALESCE(_user_id, v_caller);
  ELSE
    v_target := v_caller;
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.plan,
    s.status,
    s.start_date,
    s.end_date,
    GREATEST(0, (s.end_date - CURRENT_DATE))::integer AS days_remaining
  FROM public.subscriptions s
  WHERE s.user_id = v_target
  ORDER BY
    CASE s.status WHEN 'active' THEN 1 WHEN 'trial' THEN 2 WHEN 'expired' THEN 3 ELSE 4 END,
    s.end_date DESC
  LIMIT 1;
END;
$function$;
