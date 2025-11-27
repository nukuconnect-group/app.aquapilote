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
  user_id?: string;
  manual_check?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Stock alert function triggered");
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: StockAlert = await req.json();
    console.log("Request data:", requestData);

    let query = supabase
      .from('feed_stocks')
      .select('*, profiles!inner(email, full_name)');

    // Si un stock_id est fourni, on vérifie uniquement celui-là
    if (requestData.stock_id) {
      query = query.eq('id', requestData.stock_id);
    } else if (requestData.user_id) {
      query = query.eq('user_id', requestData.user_id);
    }

    const { data: stocks, error: stockError } = await query;

    if (stockError) {
      console.error("Error fetching stocks:", stockError);
      throw stockError;
    }

    if (!stocks || stocks.length === 0) {
      console.log("No stocks found");
      return new Response(
        JSON.stringify({ message: "No stocks found", alerts_sent: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Checking ${stocks.length} stock(s)`);

    // Filtrer les stocks en dessous du seuil
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

    // Grouper les stocks par utilisateur pour envoyer un seul email par utilisateur
    const stocksByUser = lowStocks.reduce((acc, stock) => {
      const userId = stock.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          email: stock.profiles.email,
          name: stock.profiles.full_name || stock.profiles.email,
          stocks: [],
        };
      }
      acc[userId].stocks.push(stock);
      return acc;
    }, {} as Record<string, any>);

    console.log(`Sending alerts to ${Object.keys(stocksByUser).length} user(s)`);

    let alertsSent = 0;

    // Envoyer un email par utilisateur
    for (const userId in stocksByUser) {
      const { email, name, stocks } = stocksByUser[userId];

      const stocksList = stocks
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
              <p style="font-size: 16px; margin-top: 0;">Bonjour <strong>${name}</strong>,</p>
              
              <p style="font-size: 16px;">
                ${stocks.length} stock(s) d'aliment sont en dessous du seuil minimum configuré et nécessitent un réapprovisionnement :
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

      try {
        const emailResponse = await resend.emails.send({
          from: "AquaPilote <onboarding@resend.dev>",
          to: [email],
          subject: `⚠️ Alerte: ${stocks.length} stock(s) d'aliment en dessous du seuil`,
          html: emailHtml,
        });

        console.log(`Email sent to ${email}:`, emailResponse);
        alertsSent++;
      } catch (emailError) {
        console.error(`Error sending email to ${email}:`, emailError);
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
