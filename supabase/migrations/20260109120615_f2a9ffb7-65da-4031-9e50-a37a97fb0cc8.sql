-- Add payment terms and due date to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS is_credit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms text;

-- Add payment terms and due date to purchases table
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS is_credit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms text;

-- Add maintenance scheduling to unit_infrastructures
ALTER TABLE public.unit_infrastructures
ADD COLUMN IF NOT EXISTS next_maintenance_date date,
ADD COLUMN IF NOT EXISTS maintenance_frequency_days integer,
ADD COLUMN IF NOT EXISTS last_maintenance_date date,
ADD COLUMN IF NOT EXISTS maintenance_notes text;