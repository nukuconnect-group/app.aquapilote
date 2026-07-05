
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exploitation_type text
    CHECK (exploitation_type IS NULL OR exploitation_type IN ('moyenne','semi_industriel','industriel')),
  ADD COLUMN IF NOT EXISTS needs_sensors boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sensors_banner_dismissed_at timestamptz;

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
BEGIN
  v_exploitation_type := NEW.raw_user_meta_data->>'exploitation_type';
  IF v_exploitation_type NOT IN ('moyenne','semi_industriel','industriel') THEN
    v_exploitation_type := NULL;
  END IF;
  v_needs_sensors := COALESCE((NEW.raw_user_meta_data->>'needs_sensors')::boolean, false);

  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_activated, exploitation_type, needs_sensors)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    false,
    v_exploitation_type,
    v_needs_sensors
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  FOR admin_rec IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'::app_role
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, module, is_critical, metadata)
    VALUES (
      admin_rec.user_id,
      'Nouveau compte à activer',
      'Un nouvel utilisateur (' || COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || ') a créé un compte et attend votre activation.',
      'info',
      'Administration',
      false,
      jsonb_build_object(
        'new_user_id', NEW.id,
        'email', NEW.email,
        'exploitation_type', v_exploitation_type,
        'needs_sensors', v_needs_sensors
      )
    );
  END LOOP;

  RETURN NEW;
END;
$function$;
