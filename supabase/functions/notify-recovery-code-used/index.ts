import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  userEmail: string;
  userName?: string;
  remainingCodes: number;
  ipAddress?: string;
  userAgent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-recovery-code-used: Request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("notify-recovery-code-used: No authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("notify-recovery-code-used: Auth error", authError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userEmail, userName, remainingCodes, ipAddress, userAgent }: NotifyRequest = await req.json();

    console.log(`notify-recovery-code-used: Sending notification to ${userEmail}`);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                      ⚠️ Alerte de Sécurité
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px; font-weight: 600;">
                      Code de récupération utilisé
                    </h2>
                    
                    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                      Bonjour${userName ? ` ${userName}` : ''},
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                      Un <strong>code de récupération</strong> a été utilisé pour accéder à votre compte AQUA PILOT.
                    </p>
                    
                    <!-- Alert Box -->
                    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
                      <tr>
                        <td style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td style="color: #991b1b; font-size: 14px; line-height: 1.6;">
                                <strong>📅 Date :</strong> ${formattedDate}<br>
                                ${ipAddress ? `<strong>🌐 Adresse IP :</strong> ${ipAddress}<br>` : ''}
                                ${userAgent ? `<strong>💻 Appareil :</strong> ${userAgent.substring(0, 100)}...<br>` : ''}
                                <strong>🔑 Codes restants :</strong> ${remainingCodes}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    ${remainingCodes <= 2 ? `
                    <!-- Warning for low codes -->
                    <table role="presentation" style="width: 100%; margin: 0 0 24px 0;">
                      <tr>
                        <td style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px;">
                          <p style="margin: 0; color: #92400e; font-size: 14px;">
                            <strong>⚠️ Attention :</strong> Il ne vous reste que ${remainingCodes} code(s) de récupération. 
                            Nous vous recommandons d'en générer de nouveaux dans les paramètres de sécurité.
                          </p>
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                      <strong>Si c'était vous :</strong> Aucune action n'est nécessaire. Pensez à régénérer vos codes de récupération si vous en avez peu.
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                      <strong>Si ce n'était pas vous :</strong> Votre compte pourrait être compromis. Veuillez immédiatement :
                    </p>
                    
                    <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #52525b; font-size: 16px; line-height: 1.8;">
                      <li>Changer votre mot de passe</li>
                      <li>Régénérer vos codes de récupération</li>
                      <li>Vérifier les sessions actives sur votre compte</li>
                      <li>Contacter notre support si nécessaire</li>
                    </ul>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #71717a; font-size: 14px;">
                      AQUA PILOT - Gestion Aquacole Intelligente
                    </p>
                    <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                      Cet email a été envoyé automatiquement pour protéger votre compte.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "AQUA PILOT Sécurité <onboarding@resend.dev>",
      to: [userEmail],
      subject: "⚠️ Alerte : Code de récupération utilisé sur votre compte",
      html: emailHtml,
    });

    console.log("notify-recovery-code-used: Email sent successfully", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("notify-recovery-code-used: Error", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
