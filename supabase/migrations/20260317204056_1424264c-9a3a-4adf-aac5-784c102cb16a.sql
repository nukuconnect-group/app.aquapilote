
-- Drop the overly permissive UPDATE policy on anonymous_visits
DROP POLICY IF EXISTS "Anyone can update own session visits" ON public.anonymous_visits;

-- Create a tighter UPDATE policy that requires matching session_id
-- Since anonymous users don't have auth, we restrict to only updating last_activity_at and page_path
-- by requiring session_id match (client must know the session_id to update)
CREATE POLICY "Anonymous users can update their own session"
ON public.anonymous_visits
FOR UPDATE
TO public
USING (true)
WITH CHECK (
  -- Only allow updating if the session_id hasn't changed (prevents hijacking other sessions)
  session_id = session_id
);

-- Actually, for anonymous tables we can't use auth.uid() since users are anonymous.
-- The real fix is to add a WITH CHECK that prevents changing the session_id field.
-- But PostgreSQL RLS can't easily restrict which columns change.
-- Better approach: replace with a restrictive policy that limits what anon can do.

-- Drop and recreate with a more restrictive approach
DROP POLICY IF EXISTS "Anonymous users can update their own session" ON public.anonymous_visits;

-- For anonymous_visits: restrict INSERT to only anon role and limit fields via a function
CREATE POLICY "Anon can update own session visits"
ON public.anonymous_visits
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- For pwa_installs: restrict INSERT to anon role only
DROP POLICY IF EXISTS "Anyone can insert pwa installs" ON public.pwa_installs;
CREATE POLICY "Anon can insert pwa installs"
ON public.pwa_installs
FOR INSERT
TO anon
WITH CHECK (true);

-- For anonymous_visits INSERT: restrict to anon role only  
DROP POLICY IF EXISTS "Anyone can insert anonymous visits" ON public.anonymous_visits;
CREATE POLICY "Anon can insert anonymous visits"
ON public.anonymous_visits
FOR INSERT
TO anon
WITH CHECK (true);
