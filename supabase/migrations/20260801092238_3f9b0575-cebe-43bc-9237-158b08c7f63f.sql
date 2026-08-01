CREATE TABLE IF NOT EXISTS public.security_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scanner_name TEXT NOT NULL DEFAULT 'manual',
  internal_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('info','low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','fixed','ignored')),
  source TEXT,
  resolution_note TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS security_findings_scanner_internal_key
  ON public.security_findings(scanner_name, internal_id)
  WHERE internal_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_findings TO authenticated;
GRANT ALL ON public.security_findings TO service_role;

ALTER TABLE public.security_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security findings"
  ON public.security_findings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert security findings"
  ON public.security_findings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update security findings"
  ON public.security_findings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete security findings"
  ON public.security_findings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_security_findings_updated_at
  BEFORE UPDATE ON public.security_findings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();