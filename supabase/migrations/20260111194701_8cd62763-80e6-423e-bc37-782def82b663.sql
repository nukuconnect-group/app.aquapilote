-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their company logo
CREATE POLICY "Users can upload company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own logo
CREATE POLICY "Users can update their company logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own logo
CREATE POLICY "Users can delete their company logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access for logos (they appear on printed docs)
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');