-- Create table for performance alert thresholds
CREATE TABLE public.performance_alert_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  -- FCR thresholds
  fcr_warning_threshold NUMERIC DEFAULT 2.0,
  fcr_critical_threshold NUMERIC DEFAULT 2.5,
  fcr_enabled BOOLEAN DEFAULT true,
  -- Mortality thresholds
  mortality_daily_warning NUMERIC DEFAULT 0.5,
  mortality_daily_critical NUMERIC DEFAULT 1.0,
  mortality_enabled BOOLEAN DEFAULT true,
  -- Temperature thresholds
  temp_min_warning NUMERIC DEFAULT 20,
  temp_min_critical NUMERIC DEFAULT 18,
  temp_max_warning NUMERIC DEFAULT 30,
  temp_max_critical NUMERIC DEFAULT 32,
  temp_enabled BOOLEAN DEFAULT true,
  -- Oxygen thresholds (mg/L)
  oxygen_warning NUMERIC DEFAULT 5.0,
  oxygen_critical NUMERIC DEFAULT 4.0,
  oxygen_enabled BOOLEAN DEFAULT true,
  -- pH thresholds
  ph_min_warning NUMERIC DEFAULT 6.5,
  ph_min_critical NUMERIC DEFAULT 6.0,
  ph_max_warning NUMERIC DEFAULT 8.5,
  ph_max_critical NUMERIC DEFAULT 9.0,
  ph_enabled BOOLEAN DEFAULT true,
  -- Production progress thresholds (%)
  production_behind_warning NUMERIC DEFAULT 10,
  production_behind_critical NUMERIC DEFAULT 25,
  production_enabled BOOLEAN DEFAULT true,
  -- Stock thresholds (days of stock remaining)
  stock_days_warning INTEGER DEFAULT 7,
  stock_days_critical INTEGER DEFAULT 3,
  stock_enabled BOOLEAN DEFAULT true,
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure one config per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.performance_alert_thresholds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own thresholds"
  ON public.performance_alert_thresholds
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own thresholds"
  ON public.performance_alert_thresholds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own thresholds"
  ON public.performance_alert_thresholds
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thresholds"
  ON public.performance_alert_thresholds
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create table for alert history specific to performance
CREATE TABLE public.performance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL, -- 'fcr', 'mortality', 'temperature', 'oxygen', 'ph', 'production', 'stock'
  severity TEXT NOT NULL DEFAULT 'warning', -- 'warning', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metric_name TEXT,
  metric_value NUMERIC,
  threshold_value NUMERIC,
  unit_id TEXT,
  unit_name TEXT,
  cycle_id UUID,
  cycle_name TEXT,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own performance alerts"
  ON public.performance_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance alerts"
  ON public.performance_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performance alerts"
  ON public.performance_alerts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own performance alerts"
  ON public.performance_alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_performance_alerts_user_created ON public.performance_alerts(user_id, created_at DESC);
CREATE INDEX idx_performance_alerts_type ON public.performance_alerts(alert_type);
CREATE INDEX idx_performance_alerts_unacknowledged ON public.performance_alerts(user_id, is_acknowledged) WHERE is_acknowledged = false;

-- Trigger for updated_at
CREATE TRIGGER update_performance_alert_thresholds_updated_at
  BEFORE UPDATE ON public.performance_alert_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();