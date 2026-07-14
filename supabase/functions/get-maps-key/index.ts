import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Public endpoint returning the custom Google Maps browser key for the app.
// Supabase functions.invoke uses POST by default, so CORS must explicitly
// allow POST or the browser blocks the request before the key is returned.
const CACHE_TTL_SECONDS = 3600; // 1h edge + browser cache
const responseHeaders = {
  ...corsHeaders,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// In-memory cache (per isolate) to avoid re-reading env on every call.
let cached: { key: string; expiresAt: number } | null = null;

const getKey = (): string => {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.key;
  const key = Deno.env.get('GOOGLE_API_KEY') ?? '';
  if (key) cached = { key, expiresAt: now + CACHE_TTL_SECONDS * 1000 };
  return key;
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: responseHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...responseHeaders, 'Content-Type': 'application/json' },
    });
  }

  const key = getKey();
  if (!key) {
    return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY is not configured' }), {
      status: 500,
      headers: { ...responseHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ key, cachedTtl: CACHE_TTL_SECONDS }), {
    headers: {
      ...responseHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`,
    },
  });
});