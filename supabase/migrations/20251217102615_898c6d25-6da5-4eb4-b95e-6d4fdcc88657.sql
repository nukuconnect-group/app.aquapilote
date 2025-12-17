-- Table pour les infrastructures des unités
CREATE TABLE public.unit_infrastructures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  unit_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  custom_type_name text,
  capacity integer DEFAULT 0,
  status text DEFAULT 'active',
  specifications jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les équipements
CREATE TABLE public.unit_equipment (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  unit_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  specifications jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  purchase_price numeric DEFAULT 0,
  purchase_date date,
  depreciation_rate numeric DEFAULT 0,
  current_value numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les achats
CREATE TABLE public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  subcategory text,
  description text,
  supplier text,
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'XOF',
  quantity numeric,
  unit text,
  payment_method text,
  reference text,
  unit_id text,
  unit_name text,
  status text DEFAULT 'pending',
  delivery_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les transactions comptables
CREATE TABLE public.accounting_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('revenue', 'expense')),
  category text NOT NULL,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'XOF',
  payment_method text,
  reference text,
  supplier text,
  client text,
  status text DEFAULT 'pending',
  unit_id text,
  unit_name text,
  purchase_id uuid REFERENCES public.purchases(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les immobilisations amortissables
CREATE TABLE public.depreciable_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  purchase_price numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'XOF',
  purchase_date date NOT NULL,
  depreciation_method text DEFAULT 'linear',
  useful_life integer DEFAULT 5,
  current_value numeric DEFAULT 0,
  accumulated_depreciation numeric DEFAULT 0,
  unit_id text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.unit_infrastructures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciable_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for unit_infrastructures
CREATE POLICY "Users can view their own infrastructures" ON public.unit_infrastructures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own infrastructures" ON public.unit_infrastructures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own infrastructures" ON public.unit_infrastructures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own infrastructures" ON public.unit_infrastructures FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for unit_equipment
CREATE POLICY "Users can view their own equipment" ON public.unit_equipment FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own equipment" ON public.unit_equipment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own equipment" ON public.unit_equipment FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own equipment" ON public.unit_equipment FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for purchases
CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own purchases" ON public.purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own purchases" ON public.purchases FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for accounting_transactions
CREATE POLICY "Users can view their own transactions" ON public.accounting_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.accounting_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.accounting_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.accounting_transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for depreciable_assets
CREATE POLICY "Users can view their own assets" ON public.depreciable_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assets" ON public.depreciable_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assets" ON public.depreciable_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assets" ON public.depreciable_assets FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_unit_infrastructures_user_id ON public.unit_infrastructures(user_id);
CREATE INDEX idx_unit_infrastructures_unit_id ON public.unit_infrastructures(unit_id);
CREATE INDEX idx_unit_equipment_user_id ON public.unit_equipment(user_id);
CREATE INDEX idx_unit_equipment_unit_id ON public.unit_equipment(unit_id);
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_unit_id ON public.purchases(unit_id);
CREATE INDEX idx_accounting_transactions_user_id ON public.accounting_transactions(user_id);
CREATE INDEX idx_accounting_transactions_unit_id ON public.accounting_transactions(unit_id);
CREATE INDEX idx_depreciable_assets_user_id ON public.depreciable_assets(user_id);
CREATE INDEX idx_depreciable_assets_unit_id ON public.depreciable_assets(unit_id);