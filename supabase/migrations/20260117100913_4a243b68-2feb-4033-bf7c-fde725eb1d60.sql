-- Fonction pour vérifier si un utilisateur est membre d'équipe d'un propriétaire
CREATE OR REPLACE FUNCTION public.is_team_member_of(owner_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    JOIN auth.users u ON u.email = tm.member_email
    WHERE tm.owner_id = owner_user_id
      AND u.id = auth.uid()
      AND tm.status = 'active'
  )
$$;

-- Fonction pour obtenir le owner_id d'un membre d'équipe
CREATE OR REPLACE FUNCTION public.get_team_member_owner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tm.owner_id
  FROM public.team_members tm
  JOIN auth.users u ON u.email = tm.member_email
  WHERE u.id = auth.uid()
    AND tm.status = 'active'
  LIMIT 1
$$;

-- Mise à jour de la policy SELECT sur production_units pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own units" ON production_units;
CREATE POLICY "Users and team members can view units"
ON production_units
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur unit_infrastructures pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own infrastructures" ON unit_infrastructures;
CREATE POLICY "Users and team members can view infrastructures"
ON unit_infrastructures
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur feeding_records pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own feeding records" ON feeding_records;
CREATE POLICY "Users and team members can view feeding records"
ON feeding_records
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur health_records pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own health records" ON health_records;
CREATE POLICY "Users and team members can view health records"
ON health_records
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur livestock_batches pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own livestock batches" ON livestock_batches;
CREATE POLICY "Users and team members can view livestock batches"
ON livestock_batches
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur production_cycles pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own production cycles" ON production_cycles;
CREATE POLICY "Users and team members can view production cycles"
ON production_cycles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur feed_stocks pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own feed stocks" ON feed_stocks;
CREATE POLICY "Users and team members can view feed stocks"
ON feed_stocks
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur planned_tasks pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own tasks" ON planned_tasks;
CREATE POLICY "Users and team members can view tasks"
ON planned_tasks
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur purchases pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
CREATE POLICY "Users and team members can view purchases"
ON purchases
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur sales pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
CREATE POLICY "Users and team members can view sales"
ON sales
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Mise à jour de la policy SELECT sur accounting_transactions pour inclure les membres d'équipe
DROP POLICY IF EXISTS "Users can view their own transactions" ON accounting_transactions;
CREATE POLICY "Users and team members can view transactions"
ON accounting_transactions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR user_id = public.get_team_member_owner_id()
);

-- Politiques INSERT pour les membres d'équipe (actions permises)
-- Les membres d'équipe peuvent créer des enregistrements pour leur owner
CREATE POLICY "Team members can insert feeding records for owner"
ON feeding_records
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR (user_id = public.get_team_member_owner_id() AND public.get_team_member_owner_id() IS NOT NULL)
);

CREATE POLICY "Team members can insert health records for owner"
ON health_records
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR (user_id = public.get_team_member_owner_id() AND public.get_team_member_owner_id() IS NOT NULL)
);

CREATE POLICY "Team members can insert planned tasks for owner"
ON planned_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR (user_id = public.get_team_member_owner_id() AND public.get_team_member_owner_id() IS NOT NULL)
);