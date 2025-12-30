-- Create table for planned tasks
CREATE TABLE public.planned_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'feeding',
  description TEXT,
  assigned_to TEXT,
  due_date DATE NOT NULL,
  due_time TIME NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  unit_id TEXT,
  unit_name TEXT,
  source TEXT DEFAULT 'manual', -- 'manual' or 'feeding_plan'
  source_id UUID, -- Reference to feeding_plan if source is feeding_plan
  alert_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.planned_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasks" 
ON public.planned_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" 
ON public.planned_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.planned_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.planned_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_planned_tasks_updated_at
BEFORE UPDATE ON public.planned_tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();