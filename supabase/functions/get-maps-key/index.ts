// Public endpoint returning the custom Google Maps browser key for the app.
// The key is stored server-side as GOOGLE_API_KEY. It is a browser API key
// with HTTP referrer restrictions configured in Google Cloud Console, so
// returning it to authorized origins is safe.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const key = Deno.env.get('GOOGLE_API_KEY') ?? '';
  return new Response(JSON.stringify({ key }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});