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
    // Get client IP from headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    console.log('Detecting country for IP:', clientIP)

    // Parse request body for optional user_id (for updating profile after detection)
    let userId: string | null = null;
    let updateProfile = false;
    
    try {
      const body = await req.json();
      userId = body?.user_id || null;
      updateProfile = body?.update_profile === true;
    } catch {
      // No body or invalid JSON - that's fine, we'll just return the country
    }

    // Validate IP to prevent SSRF attacks
    if (!isValidPublicIP(clientIP)) {
      console.log('Invalid or private IP, using fallback geolocation service')
      
      // Try ipify + ip-api as fallback for development/private IPs
      try {
        const publicIpResponse = await fetch('https://api.ipify.org?format=json');
        if (publicIpResponse.ok) {
          const publicIpData = await publicIpResponse.json();
          const publicIP = publicIpData.ip;
          
          console.log('Got public IP from ipify:', publicIP);
          
          const geoResponse = await fetch(`http://ip-api.com/json/${encodeURIComponent(publicIP)}?fields=status,country,countryCode`);
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            console.log('Geolocation response from fallback:', geoData);
            
            if (geoData.status === 'success') {
              // Update profile if requested and user_id provided
              if (updateProfile && userId) {
                await updateUserProfile(userId, geoData.country, geoData.countryCode);
              }
              
              return new Response(
                JSON.stringify({
                  country: geoData.country,
                  countryCode: geoData.countryCode,
                  source: 'ipify-fallback'
                }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 200 
                }
              )
            }
          }
        }
      } catch (fallbackError) {
        console.error('Fallback geolocation failed:', fallbackError);
      }
      
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
      // Update profile if requested and user_id provided
      if (updateProfile && userId) {
        await updateUserProfile(userId, data.country, data.countryCode);
      }
      
      return new Response(
        JSON.stringify({
          country: data.country,
          countryCode: data.countryCode,
          source: 'direct-ip'
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

// Helper function to update user profile with detected country
async function updateUserProfile(userId: string, country: string, countryCode: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        country: country,
        country_code: countryCode
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating profile with country:', error);
    } else {
      console.log('Successfully updated profile with country:', country, countryCode);
    }
  } catch (err) {
    console.error('Error in updateUserProfile:', err);
  }
}
