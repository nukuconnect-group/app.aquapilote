-- Function to automatically assign admin role to the first user
CREATE OR REPLACE FUNCTION public.assign_admin_to_first_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is the first user (no roles exist yet)
  IF NOT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1) THEN
    -- Assign admin role to the first user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role);
    
    RAISE NOTICE 'Admin role assigned to first user: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table to assign admin to first user
DROP TRIGGER IF EXISTS on_first_user_make_admin ON public.profiles;

CREATE TRIGGER on_first_user_make_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_to_first_user();

COMMENT ON FUNCTION public.assign_admin_to_first_user() IS 'Automatically assigns admin role to the first user who registers';