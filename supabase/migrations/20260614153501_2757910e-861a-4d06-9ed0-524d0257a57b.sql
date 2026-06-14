
-- Ajouter colonne is_activated sur profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_activated boolean NOT NULL DEFAULT true;

-- Les nouveaux comptes ne sont PAS auto-activés (override du défaut via trigger)
-- Les anciens comptes restent activés (true par défaut sur l'ALTER)

-- Mettre à jour le trigger handle_new_user pour insérer is_activated=false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_rec RECORD;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_activated)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    false  -- nouveau compte en attente d'activation
  );

  -- Rôle par défaut
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Notifier tous les admins qu'un nouveau compte attend activation
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
      jsonb_build_object('new_user_id', NEW.id, 'email', NEW.email)
    );
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Policy admin pour lire les profiles non activés (déjà couvert si admin a select all, sinon ajouter)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can update activation status'
  ) THEN
    CREATE POLICY "Admins can update activation status"
      ON public.profiles
      FOR UPDATE
      USING (public.has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
