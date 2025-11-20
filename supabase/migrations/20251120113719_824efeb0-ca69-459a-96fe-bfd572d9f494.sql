-- Add server-side validation to user registration
-- This prevents bypassing client-side validation

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_email text;
  v_full_name text;
BEGIN
  -- Extract and validate email
  v_email := NEW.email;
  
  -- Validate email format and length
  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  
  IF LENGTH(v_email) > 255 THEN
    RAISE EXCEPTION 'Email must be less than 255 characters';
  END IF;
  
  IF v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Extract and validate full_name
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name'
  );
  
  IF v_full_name IS NULL OR TRIM(v_full_name) = '' THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;
  
  IF LENGTH(v_full_name) < 2 THEN
    RAISE EXCEPTION 'Full name must be at least 2 characters';
  END IF;
  
  IF LENGTH(v_full_name) > 100 THEN
    RAISE EXCEPTION 'Full name must be less than 100 characters';
  END IF;
  
  -- Insert validated profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    v_email,
    TRIM(v_full_name)
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;