
-- Enable realtime for support chat
ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;
ALTER TABLE public.support_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Employment contracts
CREATE TABLE public.employment_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL,
  reference TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  trial_period_days INTEGER DEFAULT 0,
  weekly_hours NUMERIC DEFAULT 40,
  gross_salary NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'XOF',
  job_title TEXT,
  workplace TEXT,
  clauses TEXT,
  benefits TEXT,
  notice_period_days INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  signed_by_employer TEXT,
  signed_by_employee TEXT,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employment_contracts TO authenticated;
GRANT ALL ON public.employment_contracts TO service_role;

ALTER TABLE public.employment_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own contracts"
ON public.employment_contracts FOR ALL
USING (auth.uid() = user_id OR public.is_team_member_of(user_id))
WITH CHECK (auth.uid() = user_id OR public.is_team_member_of(user_id));

CREATE POLICY "Admins view all contracts"
ON public.employment_contracts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER employment_contracts_updated_at
BEFORE UPDATE ON public.employment_contracts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_employment_contracts_employee ON public.employment_contracts(employee_id);
CREATE INDEX idx_employment_contracts_user ON public.employment_contracts(user_id);
CREATE INDEX idx_employment_contracts_end_date ON public.employment_contracts(end_date) WHERE end_date IS NOT NULL;
