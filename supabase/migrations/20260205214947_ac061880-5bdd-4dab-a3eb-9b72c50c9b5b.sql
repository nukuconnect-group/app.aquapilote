-- Create table for anonymous visits tracking
CREATE TABLE public.anonymous_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  ip_hash TEXT,
  country TEXT,
  country_code TEXT,
  device_type TEXT DEFAULT 'other',
  device_info TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_path TEXT DEFAULT '/',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.anonymous_visits ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all visits
CREATE POLICY "Admins can view all anonymous visits"
  ON public.anonymous_visits
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy to allow anonymous inserts (for tracking)
CREATE POLICY "Anyone can insert anonymous visits"
  ON public.anonymous_visits
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow updates on own session
CREATE POLICY "Anyone can update own session visits"
  ON public.anonymous_visits
  FOR UPDATE
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_anonymous_visits_created_at ON public.anonymous_visits(created_at DESC);
CREATE INDEX idx_anonymous_visits_session_id ON public.anonymous_visits(session_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_visits;