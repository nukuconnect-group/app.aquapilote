-- Create feed_stocks table for persisting feed inventory
CREATE TABLE IF NOT EXISTS public.feed_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  custom_name TEXT,
  feed_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  expiration_date DATE,
  supplier TEXT,
  cost NUMERIC,
  protein_content NUMERIC,
  fat_content NUMERIC,
  notes TEXT,
  min_threshold NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.feed_stocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feed_stocks
CREATE POLICY "Users can view their own feed stocks"
  ON public.feed_stocks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feed stocks"
  ON public.feed_stocks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feed stocks"
  ON public.feed_stocks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feed stocks"
  ON public.feed_stocks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic updated_at timestamp
CREATE TRIGGER update_feed_stocks_updated_at
  BEFORE UPDATE ON public.feed_stocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();