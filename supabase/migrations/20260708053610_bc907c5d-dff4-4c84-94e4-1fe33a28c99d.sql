
-- 1) Realtime for profiles
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- 2) Ensure the DB default for is_activated is FALSE so new signups always require admin activation
ALTER TABLE public.profiles ALTER COLUMN is_activated SET DEFAULT false;

-- 3) Update handle_new_user to explicitly force is_activated=false and trigger admin email via pg_net
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_rec RECORD;
  v_exploitation_type text;
  v_needs_sensors boolean;
  v_full_name text;
  project_url TEXT := 'https://hhsvraqchtqqgaezhnzn.supabase.co';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc3ZyYXFjaHRxcWdhZXpobnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ0OTUsImV4cCI6MjA3NzY5MDQ5NX0.yPX0oLUaW5L2_d43MB7X8xpwPaTGCMDNsWKx9JbGrbA';
BEGIN
  v_exploitation_type := NEW.raw_user_meta_data->>'exploitation_type';
  IF v_exploitation_type NOT IN ('moyenne','semi_industriel','industriel') THEN
    v_exploitation_type := NULL;
  END IF;
  v_needs_sensors := COALESCE((NEW.raw_user_meta_data->>'needs_sensors')::boolean, false);
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_activated, exploitation_type, needs_sensors)
  VALUES (
    NEW.id, NEW.email, v_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    false, v_exploitation_type, v_needs_sensors
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  FOR admin_rec IN SELECT user_id FROM public.user_roles WHERE role = 'admin'::app_role LOOP
    INSERT INTO public.notifications (user_id, title, message, type, module, is_critical, metadata)
    VALUES (
      admin_rec.user_id,
      'Nouveau compte à activer',
      'Un nouvel utilisateur (' || v_full_name || ') a créé un compte et attend votre activation.',
      'info','Administration', false,
      jsonb_build_object('new_user_id', NEW.id,'email', NEW.email,'exploitation_type', v_exploitation_type,'needs_sensors', v_needs_sensors)
    );
  END LOOP;

  -- Fire-and-forget email to admins
  BEGIN
    PERFORM extensions.net.http_post(
      url := project_url || '/functions/v1/send-notification-email',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || anon_key),
      body := jsonb_build_object(
        'kind','new_signup_admin',
        'metadata', jsonb_build_object('full_name', v_full_name, 'email', NEW.email, 'exploitation_type', v_exploitation_type)
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Admin email dispatch failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$function$;

-- 4) Trigger: when a profile becomes activated (false → true), send activation email to the user
CREATE OR REPLACE FUNCTION public.notify_profile_activated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_url TEXT := 'https://hhsvraqchtqqgaezhnzn.supabase.co';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc3ZyYXFjaHRxcWdhZXpobnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ0OTUsImV4cCI6MjA3NzY5MDQ5NX0.yPX0oLUaW5L2_d43MB7X8xpwPaTGCMDNsWKx9JbGrbA';
BEGIN
  IF NEW.is_activated = true AND (OLD.is_activated IS DISTINCT FROM true) THEN
    BEGIN
      PERFORM extensions.net.http_post(
        url := project_url || '/functions/v1/send-notification-email',
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || anon_key),
        body := jsonb_build_object('kind','account_activated','to', NEW.email,'user_id', NEW.id)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Activation email dispatch failed: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_activated ON public.profiles;
CREATE TRIGGER on_profile_activated
AFTER UPDATE OF is_activated ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_profile_activated();

-- 5) Trigger: when a critical notification is inserted, send an email to the user
CREATE OR REPLACE FUNCTION public.notify_critical_notification_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_url TEXT := 'https://hhsvraqchtqqgaezhnzn.supabase.co';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc3ZyYXFjaHRxcWdhZXpobnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ0OTUsImV4cCI6MjA3NzY5MDQ5NX0.yPX0oLUaW5L2_d43MB7X8xpwPaTGCMDNsWKx9JbGrbA';
BEGIN
  IF NEW.is_critical = true THEN
    BEGIN
      PERFORM extensions.net.http_post(
        url := project_url || '/functions/v1/send-notification-email',
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || anon_key),
        body := jsonb_build_object('kind','critical_alert','user_id', NEW.user_id,'title', NEW.title,'message', NEW.message)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Critical alert email dispatch failed: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_notification_critical ON public.notifications;
CREATE TRIGGER on_notification_critical
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.notify_critical_notification_email();
