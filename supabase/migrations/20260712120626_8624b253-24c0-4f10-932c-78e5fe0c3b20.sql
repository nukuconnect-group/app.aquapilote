
-- 1. Update handle_new_user: auto-activate + create 30-day trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_exploitation_type text;
  v_needs_sensors boolean;
  v_full_name text;
BEGIN
  v_exploitation_type := NEW.raw_user_meta_data->>'exploitation_type';
  IF v_exploitation_type NOT IN ('moyenne','semi_industriel','industriel') THEN
    v_exploitation_type := NULL;
  END IF;
  v_needs_sensors := COALESCE((NEW.raw_user_meta_data->>'needs_sensors')::boolean, false);
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- Auto-activate account (no admin approval required)
  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_activated, exploitation_type, needs_sensors)
  VALUES (
    NEW.id, NEW.email, v_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    true, v_exploitation_type, v_needs_sensors
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  -- Automatically grant 30-day free trial (Pack Découverte)
  INSERT INTO public.subscriptions (user_id, plan, status, start_date, end_date, price, currency, notes)
  VALUES (
    NEW.id,
    'trial_discovery',
    'trial',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    0,
    'XOF',
    'Pack Découverte - Essai gratuit 30 jours'
  );

  RETURN NEW;
END;
$function$;

-- 2. Helper function to expire outdated subscriptions (called by cron)
CREATE OR REPLACE FUNCTION public.expire_outdated_subscriptions()
RETURNS TABLE(expired_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.subscriptions
  SET status = 'expired', updated_at = now()
  WHERE status IN ('trial', 'active')
    AND end_date < CURRENT_DATE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$;

-- 3. Helper: get current active/trial subscription for a user
CREATE OR REPLACE FUNCTION public.get_current_subscription(_user_id uuid)
RETURNS TABLE(
  id uuid,
  plan text,
  status text,
  start_date date,
  end_date date,
  days_remaining integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    s.id,
    s.plan,
    s.status,
    s.start_date,
    s.end_date,
    GREATEST(0, (s.end_date - CURRENT_DATE))::integer AS days_remaining
  FROM public.subscriptions s
  WHERE s.user_id = _user_id
  ORDER BY
    CASE s.status WHEN 'active' THEN 1 WHEN 'trial' THEN 2 WHEN 'expired' THEN 3 ELSE 4 END,
    s.end_date DESC
  LIMIT 1;
$$;

-- 4. Extend trial helper for admin use
CREATE OR REPLACE FUNCTION public.extend_subscription(_subscription_id uuid, _days integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can extend subscriptions';
  END IF;
  UPDATE public.subscriptions
  SET end_date = end_date + (_days || ' days')::interval,
      status = CASE WHEN status = 'expired' THEN 'trial' ELSE status END,
      updated_at = now()
  WHERE id = _subscription_id;
END;
$$;
