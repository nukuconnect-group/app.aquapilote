-- Create table for alert history
CREATE TABLE public.alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stock_id UUID REFERENCES public.feed_stocks(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL DEFAULT 'low_stock',
  message TEXT NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_error TEXT,
  stock_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own alert history"
ON public.alert_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert alert history"
ON public.alert_history
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_alert_history_user_id ON public.alert_history(user_id);
CREATE INDEX idx_alert_history_created_at ON public.alert_history(created_at DESC);