-- Add document type/number to sales for invoice vs receipt distinction with anti-duplicate constraint
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS document_type text NOT NULL DEFAULT 'receipt',
  ADD COLUMN IF NOT EXISTS document_number text,
  ADD COLUMN IF NOT EXISTS tax_rate numeric NOT NULL DEFAULT 0;

-- Unique number per user (avoid duplicates within an owner's documents)
CREATE UNIQUE INDEX IF NOT EXISTS sales_user_document_number_unique
  ON public.sales(user_id, document_number)
  WHERE document_number IS NOT NULL;

-- Allow only known document types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_document_type_check'
  ) THEN
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_document_type_check
      CHECK (document_type IN ('receipt','invoice'));
  END IF;
END $$;

-- Private bucket for sensitive company assets (stamp, signature)
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-documents', 'company-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: only the file owner (folder = user_id) can read/write
CREATE POLICY "Users read own company documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'company-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own company documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'company-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own company documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'company-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own company documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'company-documents' AND auth.uid()::text = (storage.foldername(name))[1]);