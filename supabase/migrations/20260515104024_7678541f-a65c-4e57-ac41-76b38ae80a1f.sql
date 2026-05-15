
-- 1) Remove sensitive tables from Realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='profiles') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='user_sessions') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.user_sessions';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='activity_logs') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.activity_logs';
  END IF;
END $$;

-- 2) Remove unrestricted anon UPDATE on anonymous_visits
DROP POLICY IF EXISTS "Anon can update own session visits" ON public.anonymous_visits;

-- 3) RLS on realtime.messages: only allow subscribing to topics scoped to the user
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read own scoped topics" ON realtime.messages;
CREATE POLICY "Authenticated users can read own scoped topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic LIKE 'user:' || (auth.uid())::text || ':%'
  OR topic = (auth.uid())::text
);

DROP POLICY IF EXISTS "Authenticated users can send own scoped topics" ON realtime.messages;
CREATE POLICY "Authenticated users can send own scoped topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  topic LIKE 'user:' || (auth.uid())::text || ':%'
  OR topic = (auth.uid())::text
);

-- 4) Restrict listing on public buckets to user's own folder (CDN access still works because buckets remain public)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Users can list their own avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Company logos are publicly accessible" ON storage.objects;
CREATE POLICY "Users can list their own company logos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'company-logos'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
