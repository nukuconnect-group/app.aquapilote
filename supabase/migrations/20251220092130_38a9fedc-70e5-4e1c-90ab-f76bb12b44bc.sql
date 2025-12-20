-- Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  category TEXT NOT NULL DEFAULT '',
  products TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suppliers"
ON public.suppliers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers"
ON public.suppliers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
ON public.suppliers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
ON public.suppliers
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_suppliers_user_unit ON public.suppliers (user_id, unit_id);

-- Supplier Orders
CREATE TABLE IF NOT EXISTS public.supplier_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT (now()::date),
  products TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own supplier orders"
ON public.supplier_orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplier orders"
ON public.supplier_orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplier orders"
ON public.supplier_orders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplier orders"
ON public.supplier_orders
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_supplier_orders_user_unit ON public.supplier_orders (user_id, unit_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier_id ON public.supplier_orders (supplier_id);

-- Employees
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  unit_name TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  salary NUMERIC NOT NULL DEFAULT 0,
  hire_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  contract_type TEXT NOT NULL DEFAULT 'CDI',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own employees"
ON public.employees
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employees"
ON public.employees
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employees"
ON public.employees
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employees"
ON public.employees
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_employees_user_unit ON public.employees (user_id, unit_id);

-- Pay Slips
CREATE TABLE IF NOT EXISTS public.pay_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  period TEXT NOT NULL,
  base_salary NUMERIC NOT NULL DEFAULT 0,
  overtime NUMERIC NOT NULL DEFAULT 0,
  bonuses NUMERIC NOT NULL DEFAULT 0,
  deductions NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  generated_at DATE NOT NULL DEFAULT (now()::date),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pay_slips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pay slips"
ON public.pay_slips
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pay slips"
ON public.pay_slips
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pay slips"
ON public.pay_slips
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pay slips"
ON public.pay_slips
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pay_slips_user_unit ON public.pay_slips (user_id, unit_id);
CREATE INDEX IF NOT EXISTS idx_pay_slips_employee_id ON public.pay_slips (employee_id);

-- Sales
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unit_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT (now()::date),
  client_name TEXT NOT NULL,
  client_contact TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales"
ON public.sales
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
ON public.sales
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
ON public.sales
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
ON public.sales
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sales_user_unit ON public.sales (user_id, unit_id);

-- Sale Items
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sale items"
ON public.sale_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sale items"
ON public.sale_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sale items"
ON public.sale_items
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sale items"
ON public.sale_items
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items (sale_id);

-- updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_suppliers_updated_at'
  ) THEN
    CREATE TRIGGER trg_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_supplier_orders_updated_at'
  ) THEN
    CREATE TRIGGER trg_supplier_orders_updated_at
    BEFORE UPDATE ON public.supplier_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_employees_updated_at'
  ) THEN
    CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pay_slips_updated_at'
  ) THEN
    CREATE TRIGGER trg_pay_slips_updated_at
    BEFORE UPDATE ON public.pay_slips
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sales_updated_at'
  ) THEN
    CREATE TRIGGER trg_sales_updated_at
    BEFORE UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;