
-- 1) employment_contracts: remove broad team-member access
DROP POLICY IF EXISTS "Users manage their own contracts" ON public.employment_contracts;

CREATE POLICY "Owners manage their own contracts"
ON public.employment_contracts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all contracts"
ON public.employment_contracts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2) support_tickets: prevent owners from tampering with admin-only fields
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

CREATE POLICY "Admins can update tickets"
ON public.support_tickets
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can update their own tickets"
ON public.support_tickets
FOR UPDATE
USING (auth.uid() = user_id AND NOT has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_support_ticket_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.priority IS DISTINCT FROM OLD.priority
     OR NEW.admin_response IS DISTINCT FROM OLD.admin_response
     OR NEW.responded_at IS DISTINCT FROM OLD.responded_at
     OR NEW.responded_by IS DISTINCT FROM OLD.responded_by THEN
    RAISE EXCEPTION 'Only admins can modify status, priority, or admin response fields'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_support_ticket_admin_fields ON public.support_tickets;
CREATE TRIGGER trg_protect_support_ticket_admin_fields
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.protect_support_ticket_admin_fields();
