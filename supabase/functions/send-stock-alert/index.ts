import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StockAlert {
  stock_id?: string;
  unit_id?: string;
  manual_check?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Stock alert function triggered");
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Authentification requise' }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Create client with user's auth token to verify identity
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.log("User authentication failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Token invalide' }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log("Authenticated user:", user.id);

    // Use service role for database operations but restrict to authenticated user's data
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: StockAlert = await req.json();
    console.log("Request data:", requestData);

    // Build query - ALWAYS filter by authenticated user's ID
    let query = supabase
      .from('feed_stocks')
      .select('*, profiles!inner(email, full_name)')
      .eq('user_id', user.id); // Only fetch authenticated user's stocks

    // If a specific stock_id is provided, verify it belongs to the user
    if (requestData.stock_id) {
      query = query.eq('id', requestData.stock_id);
    }

    if (requestData.unit_id) {
      query = query.eq('unit_id', requestData.unit_id);
    }

    const { data: stocks, error: stockError } = await query;

    if (stockError) {
      console.error("Error fetching stocks:", stockError);
      throw stockError;
    }

    if (!stocks || stocks.length === 0) {
      console.log("No stocks found for user");
      return new Response(
        JSON.stringify({ message: "No stocks found", alerts_sent: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Checking ${stocks.length} stock(s) for user ${user.id}`);

    // Filter stocks below threshold
    const lowStocks = stocks.filter(
      (stock) => stock.quantity <= (stock.min_threshold || 50)
    );

    console.log(`Found ${lowStocks.length} low stock(s)`);

    if (lowStocks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No low stocks detected", alerts_sent: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // All stocks belong to the authenticated user, so we send one email
    const userEmail = stocks[0].profiles.email;
    const userName = stocks[0].profiles.full_name || userEmail;

    console.log(`Sending alert to user: ${userEmail}`);

    const stocksList = lowStocks
      .map(
        (stock) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${stock.custom_name || stock.feed_type}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${stock.quantity} ${stock.unit}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${stock.min_threshold || 50} ${stock.unit}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${stock.supplier || "N/A"}
        </td>
      </tr>
    `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Alerte Stock Bas - AquaPilote</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Alerte Stock Bas</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">AquaPilote - Gestion Aquacole</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-top: 0;">Bonjour <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px;">
              ${lowStocks.length} stock(s) d'aliment sont en dessous du seuil minimum configuré et nécessitent un réapprovisionnement :
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9fafb; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Aliment</th>
                  <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Stock actuel</th>
                  <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Seuil min.</th>
                  <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Fournisseur</th>
                </tr>
              </thead>
              <tbody>
                ${stocksList}
              </tbody>
            </table>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>Action requise :</strong> Veuillez planifier un réapprovisionnement dès que possible pour éviter toute rupture de stock.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Cet email a été envoyé automatiquement par le système AquaPilote.<br>
              Pour gérer vos stocks, connectez-vous à votre application.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">AquaPilote - Système de Gestion Aquacole</p>
            <p style="margin: 5px 0 0 0;">© 2024 Tous droits réservés</p>
          </div>
        </body>
      </html>
    `;

    let emailSent = false;
    let emailError = null;
    let alertsSent = 0;
    
    try {
      const emailResponse = await resend.emails.send({
        from: "AquaPilote <onboarding@resend.dev>",
        to: [userEmail],
        subject: `⚠️ Alerte: ${lowStocks.length} stock(s) d'aliment en dessous du seuil`,
        html: emailHtml,
      });

      console.log(`Email sent to ${userEmail}:`, emailResponse);
      emailSent = true;
      alertsSent = 1;
    } catch (error: any) {
      emailError = error.message;
      console.error(`Error sending email to ${userEmail}:`, error);
    }

    // Record alert history and create notifications for each stock
    for (const stock of lowStocks) {
      // Save to alert_history
      const { error: historyError } = await supabase
        .from('alert_history')
        .insert({
          user_id: user.id,
          stock_id: stock.id,
          alert_type: 'low_stock',
          message: `Stock faible: ${stock.custom_name || stock.feed_type} - Quantité: ${stock.quantity}${stock.unit}`,
          email_sent: emailSent,
          email_error: emailError,
          stock_details: {
            feed_type: stock.feed_type,
            custom_name: stock.custom_name,
            quantity: stock.quantity,
            unit: stock.unit,
            min_threshold: stock.min_threshold,
          }
        });

      if (historyError) {
        console.error('Error saving alert history:', historyError);
      }

      // Create notification for in-app display
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: '⚠️ Stock faible',
          message: `${stock.custom_name || stock.feed_type} est en dessous du seuil minimum (${stock.quantity} ${stock.unit})`,
          type: 'warning',
          module: 'Alimentation',
          is_critical: stock.quantity <= (stock.min_threshold || 50) / 2, // Critical if below half threshold
          metadata: {
            stock_id: stock.id,
            feed_type: stock.feed_type,
            quantity: stock.quantity,
            unit: stock.unit,
            min_threshold: stock.min_threshold
          }
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    console.log(`Successfully sent ${alertsSent} alert email(s)`);

    return new Response(
      JSON.stringify({
        message: `Successfully sent ${alertsSent} alert email(s)`,
        alerts_sent: alertsSent,
        low_stocks_count: lowStocks.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-stock-alert function:", error);
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
