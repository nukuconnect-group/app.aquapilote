-- Étape 1: Ajouter la colonne user_id à team_members pour lier aux vrais utilisateurs
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Étape 2: Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_member_email ON public.team_members(member_email);

-- Étape 3: Créer une fonction pour obtenir l'owner_id d'un membre d'équipe par user_id
CREATE OR REPLACE FUNCTION public.get_team_member_owner_by_user_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tm.owner_id
  FROM public.team_members tm
  WHERE tm.user_id = user_uuid
    AND tm.status = 'active'
  LIMIT 1
$$;

-- Étape 4: Créer une fonction pour vérifier si un utilisateur est membre actif d'une équipe
CREATE OR REPLACE FUNCTION public.is_active_team_member(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.user_id = user_uuid
      AND tm.status = 'active'
  )
$$;

-- Étape 5: Mettre à jour les politiques RLS pour team_members
DROP POLICY IF EXISTS "Users can view their own team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view their own record" ON public.team_members;
DROP POLICY IF EXISTS "Owners can view their team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view own record" ON public.team_members;

CREATE POLICY "Owners can view their team members" 
ON public.team_members 
FOR SELECT 
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view own record" 
ON public.team_members 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Étape 6: Mettre à jour les politiques team_member_units
DROP POLICY IF EXISTS "Users can view their team member units" ON public.team_member_units;
DROP POLICY IF EXISTS "Team members can view their own unit assignments" ON public.team_member_units;
DROP POLICY IF EXISTS "Team members can view their unit assignments" ON public.team_member_units;

CREATE POLICY "Team members can view their unit assignments" 
ON public.team_member_units 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.id = team_member_units.team_member_id
      AND (tm.owner_id = auth.uid() OR tm.user_id = auth.uid())
  )
);

-- Étape 7: Mettre à jour les politiques production_units avec cast explicite (unit_id est text, production_units.id est uuid)
DROP POLICY IF EXISTS "Team members can view assigned units" ON public.production_units;

CREATE POLICY "Team members can view assigned units" 
ON public.production_units 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.team_member_units tmu
    JOIN public.team_members tm ON tm.id = tmu.team_member_id
    WHERE tmu.unit_id = production_units.id::text
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);