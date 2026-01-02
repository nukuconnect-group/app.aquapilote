import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validate IP format and check for private/internal ranges
const isValidPublicIP = (ip: string): boolean => {
  if (!ip || ip === 'unknown') return false;
  
  // Basic IPv4 format validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  
  const parts = ip.split('.').map(p => parseInt(p, 10));
  
  // Check each octet is valid (0-255)
  if (parts.some(p => isNaN(p) || p < 0 || p > 255)) return false;
  
  const [first, second] = parts;
  
  // Reject private IP ranges
  if (first === 10) return false; // 10.0.0.0/8
  if (first === 172 && second >= 16 && second <= 31) return false; // 172.16.0.0/12
  if (first === 192 && second === 168) return false; // 192.168.0.0/16
  if (first === 127) return false; // 127.0.0.0/8 (localhost)
  if (first === 169 && second === 254) return false; // 169.254.0.0/16 (link-local)
  if (first === 0) return false; // 0.0.0.0/8
  if (first >= 224) return false; // Multicast and reserved (224.0.0.0+)
  
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header provided')
      return new Response(
        JSON.stringify({ country: null, countryCode: null }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Create Supabase client and verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('Authentication failed:', authError?.message)
      return new Response(
        JSON.stringify({ country: null, countryCode: null }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Get client IP from headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    console.log('Detecting country for IP:', clientIP, 'User:', user.id)

    // Validate IP to prevent SSRF attacks
    if (!isValidPublicIP(clientIP)) {
      console.log('Invalid or private IP rejected:', clientIP)
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

    // Use ip-api.com (free, no API key required, 45 requests/minute)
    const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(clientIP)}?fields=status,country,countryCode`)
    
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
        countryCode: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})