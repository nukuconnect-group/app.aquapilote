
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'annual_basic',
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  price NUMERIC(12,2),
  currency TEXT DEFAULT 'XOF',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all subscriptions"
  ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view their own subscription"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
