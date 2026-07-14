
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS production_units text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

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
  v_company_name text;
  v_company_address text;
  v_phone text;
  v_country text;
  v_country_code text;
  v_production_units text[];
BEGIN
  v_exploitation_type := NEW.raw_user_meta_data->>'exploitation_type';
  IF v_exploitation_type NOT IN ('moyenne','semi_industriel','industriel') THEN
    v_exploitation_type := NULL;
  END IF;
  v_needs_sensors := COALESCE((NEW.raw_user_meta_data->>'needs_sensors')::boolean, false);
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  v_company_name := NEW.raw_user_meta_data->>'company_name';
  v_company_address := NEW.raw_user_meta_data->>'company_address';
  v_phone := NEW.raw_user_meta_data->>'phone';
  v_country := NEW.raw_user_meta_data->>'country';
  v_country_code := NEW.raw_user_meta_data->>'country_code';
  BEGIN
    v_production_units := ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data->'production_units','[]'::jsonb)));
  EXCEPTION WHEN OTHERS THEN
    v_production_units := NULL;
  END;

  INSERT INTO public.profiles (
    id, email, full_name, avatar_url, is_activated, exploitation_type, needs_sensors,
    company_name, company_address, phone, country, country_code, production_units
  )
  VALUES (
    NEW.id, NEW.email, v_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    true, v_exploitation_type, v_needs_sensors,
    v_company_name, v_company_address, v_phone, v_country, v_country_code, v_production_units
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  INSERT INTO public.subscriptions (user_id, plan, status, start_date, end_date, price, currency, notes)
  VALUES (
    NEW.id, 'trial_discovery', 'trial',
    CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
    0, 'XOF', 'Pack Découverte - Essai gratuit 30 jours'
  );

  RETURN NEW;
END;
$function$;
