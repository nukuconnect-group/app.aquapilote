-- Add company info fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_email TEXT,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS company_registration_number TEXT,
ADD COLUMN IF NOT EXISTS company_tax_id TEXT;