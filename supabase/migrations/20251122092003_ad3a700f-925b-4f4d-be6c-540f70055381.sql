-- Créer un bucket pour les fichiers utilisateurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-files',
  'user-files',
  false,
  10485760, -- 10MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Politique pour voir ses propres fichiers
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour uploader ses propres fichiers
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour mettre à jour ses propres fichiers
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour supprimer ses propres fichiers
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Table pour suivre les fichiers uploadés
CREATE TABLE IF NOT EXISTS public.user_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  compressed_size integer,
  module text NOT NULL, -- module où le fichier est utilisé (livestock, production, etc.)
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON public.user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_module ON public.user_files(module);
CREATE INDEX IF NOT EXISTS idx_user_files_created_at ON public.user_files(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- Politique pour voir ses propres fichiers
CREATE POLICY "Users can view their own file records"
ON public.user_files FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour créer ses propres fichiers
CREATE POLICY "Users can create their own file records"
ON public.user_files FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique pour mettre à jour ses propres fichiers
CREATE POLICY "Users can update their own file records"
ON public.user_files FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour supprimer ses propres fichiers
CREATE POLICY "Users can delete their own file records"
ON public.user_files FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_user_files_updated_at
  BEFORE UPDATE ON public.user_files
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();