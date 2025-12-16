import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get client IP from headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    console.log('Detecting country for IP:', clientIP)

    // Use ip-api.com (free, no API key required, 45 requests/minute)
    const response = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,countryCode`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch geolocation data')
    }

    const data = await response.json()
    console.log('Geolocation response:', data)

    if (data.status === 'success') {
      return new Response(
        JSON.stringify({
          country: data.country,
          countryCode: data.countryCode,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Fallback if IP detection fails
      return new Response(
        JSON.stringify({
          country: null,
          countryCode: null,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }
  } catch (error) {
    console.error('Error detecting country:', error)
    return new Response(
      JSON.stringify({ 
        country: null, 
        countryCode: null,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})
