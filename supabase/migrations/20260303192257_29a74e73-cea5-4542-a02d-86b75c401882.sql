
-- Table pour tracker les installations PWA
CREATE TABLE public.pwa_installs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  device_type text DEFAULT 'other',
  device_info text,
  country text,
  country_code text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pwa_installs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert pwa installs"
ON public.pwa_installs
FOR INSERT
WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view pwa installs"
ON public.pwa_installs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
