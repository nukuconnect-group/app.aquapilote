import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IoTData {
  temperature: number;
  oxygene_dissous: number;
  ph: number;
  ammonium: number;
  nitrite: number;
  unit_id?: string;
}

interface AquapiloteResponse {
  alerte: boolean;
  conseil: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { iotData }: { iotData: IoTData } = await req.json();
    
    console.log('Received IoT data:', iotData);

    const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
    if (!MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY is not configured');
    }

    // Préparer le message utilisateur avec les données IoT
    const userMessage = `Analyse ces paramètres d'eau en aquaculture:
- Température de l'eau: ${iotData.temperature}°C
- Oxygène dissous: ${iotData.oxygene_dissous} mg/L
- pH (potentiel hydrogène): ${iotData.ph}
- Ammonium/Ammoniaque: ${iotData.ammonium} mg/L
- Nitrite: ${iotData.nitrite} mg/L

Réponds uniquement avec un objet JSON contenant 'alerte' (boolean) et 'conseil' (string en français).`;

    console.log('Calling Mistral API...');

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: "Tu es Aquapilote, un expert en aquaculture. Analyse les données fournies et réponds uniquement avec un objet JSON strict. Le JSON doit avoir les clés 'alerte' (booléen) et 'conseil' (string en français)."
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error:', response.status, errorText);
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Mistral API response:', data);

    // Extraire le contenu de la réponse
    const messageContent = data.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error('No content in Mistral response');
    }

    // Parser le JSON de la réponse
    let aquapiloteResponse: AquapiloteResponse;
    try {
      // Extraire le JSON s'il est entouré de texte
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aquapiloteResponse = JSON.parse(jsonMatch[0]);
      } else {
        aquapiloteResponse = JSON.parse(messageContent);
      }
    } catch (parseError) {
      console.error('Failed to parse Mistral response as JSON:', messageContent);
      throw new Error('Invalid JSON response from Mistral');
    }

    // Valider la structure de la réponse
    if (typeof aquapiloteResponse.alerte !== 'boolean' || typeof aquapiloteResponse.conseil !== 'string') {
      throw new Error('Invalid response structure from Mistral');
    }

    console.log('Parsed response:', aquapiloteResponse);

    // Save analysis to database
    const { error: saveError } = await supabase
      .from('ai_analyses')
      .insert({
        user_id: user.id,
        unit_id: iotData.unit_id || null,
        temperature: iotData.temperature,
        oxygene_dissous: iotData.oxygene_dissous,
        ph: iotData.ph,
        ammonium: iotData.ammonium,
        nitrite: iotData.nitrite,
        alerte: aquapiloteResponse.alerte,
        conseil: aquapiloteResponse.conseil
      });

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      // Don't fail the request, just log the error
    }

    return new Response(JSON.stringify(aquapiloteResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in aquapilote-recommendation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        alerte: true,
        conseil: 'Une erreur est survenue lors de l\'analyse des données.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
