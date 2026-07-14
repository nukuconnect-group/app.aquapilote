import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Public endpoint returning the custom Google Maps browser key for the app.
// Supabase functions.invoke uses POST by default, so CORS must explicitly
// allow POST or the browser blocks the request before the key is returned.
const responseHeaders = {
  ...corsHeaders,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  const key = Deno.env.get('GOOGLE_API_KEY') ?? '';
  if (!key) {
    return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY is not configured' }), {
      status: 500,
      headers: { ...responseHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ key }), {
    headers: { ...responseHeaders, 'Content-Type': 'application/json' },
  });
});