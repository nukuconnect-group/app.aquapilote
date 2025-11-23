-- Create table for AI analysis history
CREATE TABLE public.ai_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_id TEXT,
  temperature NUMERIC NOT NULL,
  oxygene_dissous NUMERIC NOT NULL,
  ph NUMERIC NOT NULL,
  ammonium NUMERIC NOT NULL,
  nitrite NUMERIC NOT NULL,
  alerte BOOLEAN NOT NULL,
  conseil TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own analyses"
ON public.ai_analyses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
ON public.ai_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.ai_analyses
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_ai_analyses_user_created ON public.ai_analyses(user_id, created_at DESC);