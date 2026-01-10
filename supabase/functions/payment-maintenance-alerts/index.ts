import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Payment/Maintenance alerts function triggered at:", new Date().toISOString());

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    const todayStr = today.toISOString().split('T')[0];
    const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

    let alertsSent = 0;

    // 1. Vérifier les échéances de vente (créances clients)
    const { data: dueSales, error: salesError } = await supabase
      .from('sales')
      .select('*, profiles:user_id(email, full_name)')
      .eq('is_credit', true)
      .in('status', ['pending', 'partial'])
      .lte('due_date', threeDaysStr);

    if (salesError) {
      console.error("Error fetching sales:", salesError);
    } else if (dueSales && dueSales.length > 0) {
      console.log(`Found ${dueSales.length} sales with upcoming due dates`);
      
      for (const sale of dueSales) {
        const profile = sale.profiles as { email: string; full_name: string } | null;
        if (!profile?.email) continue;

        const isOverdue = new Date(sale.due_date) < today;
        const remainingAmount = sale.total_amount - (sale.paid_amount || 0);

        // Créer notification
        await supabase.from('notifications').insert({
          user_id: sale.user_id,
          title: isOverdue ? '🔴 Créance en retard' : '⚠️ Échéance proche',
          message: `Vente ${sale.client_name}: ${remainingAmount.toLocaleString()} à recevoir - Échéance: ${sale.due_date}`,
          type: isOverdue ? 'error' : 'warning',
          module: 'Ventes',
          is_critical: isOverdue,
          metadata: { sale_id: sale.id, client: sale.client_name, amount: remainingAmount }
        });

        // Envoyer email si en retard
        if (isOverdue) {
          try {
            await resend.emails.send({
              from: "AquaPilote <onboarding@resend.dev>",
              to: [profile.email],
              subject: `🔴 Créance en retard - ${sale.client_name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">⚠️ Créance en retard</h1>
                  </div>
                  <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                    <p>Bonjour <strong>${profile.full_name || 'Utilisateur'}</strong>,</p>
                    <p>Une créance client est en retard de paiement:</p>
                    <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0;">
                      <p><strong>Client:</strong> ${sale.client_name}</p>
                      <p><strong>Montant restant:</strong> ${remainingAmount.toLocaleString()} FCFA</p>
                      <p><strong>Date d'échéance:</strong> ${sale.due_date}</p>
                    </div>
                    <p>Pensez à relancer votre client pour le recouvrement.</p>
                  </div>
                </div>
              `
            });
            alertsSent++;
          } catch (emailErr) {
            console.error("Error sending sale alert email:", emailErr);
          }
        }
      }
    }

    // 2. Vérifier les échéances d'achat (dettes fournisseurs)
    const { data: duePurchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*, profiles:user_id(email, full_name)')
      .eq('is_credit', true)
      .in('status', ['pending', 'partial'])
      .lte('due_date', threeDaysStr);

    if (purchasesError) {
      console.error("Error fetching purchases:", purchasesError);
    } else if (duePurchases && duePurchases.length > 0) {
      console.log(`Found ${duePurchases.length} purchases with upcoming due dates`);
      
      for (const purchase of duePurchases) {
        const profile = purchase.profiles as { email: string; full_name: string } | null;
        if (!profile?.email) continue;

        const isOverdue = new Date(purchase.due_date) < today;
        const remainingAmount = purchase.amount - (purchase.paid_amount || 0);

        await supabase.from('notifications').insert({
          user_id: purchase.user_id,
          title: isOverdue ? '🔴 Dette en retard' : '⚠️ Échéance fournisseur',
          message: `Achat ${purchase.supplier}: ${remainingAmount.toLocaleString()} à payer - Échéance: ${purchase.due_date}`,
          type: isOverdue ? 'error' : 'warning',
          module: 'Achats',
          is_critical: isOverdue,
          metadata: { purchase_id: purchase.id, supplier: purchase.supplier, amount: remainingAmount }
        });

        if (isOverdue) {
          try {
            await resend.emails.send({
              from: "AquaPilote <onboarding@resend.dev>",
              to: [profile.email],
              subject: `🔴 Paiement fournisseur en retard - ${purchase.supplier}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">⚠️ Paiement fournisseur en retard</h1>
                  </div>
                  <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                    <p>Bonjour <strong>${profile.full_name || 'Utilisateur'}</strong>,</p>
                    <p>Un paiement fournisseur est en retard:</p>
                    <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0;">
                      <p><strong>Fournisseur:</strong> ${purchase.supplier}</p>
                      <p><strong>Montant restant:</strong> ${remainingAmount.toLocaleString()} FCFA</p>
                      <p><strong>Date d'échéance:</strong> ${purchase.due_date}</p>
                    </div>
                    <p>Régularisez ce paiement pour maintenir de bonnes relations fournisseur.</p>
                  </div>
                </div>
              `
            });
            alertsSent++;
          } catch (emailErr) {
            console.error("Error sending purchase alert email:", emailErr);
          }
        }
      }
    }

    // 3. Vérifier les maintenances à venir
    const { data: dueMaintenances, error: maintError } = await supabase
      .from('unit_infrastructures')
      .select('*, production_units:unit_id(name, user_id), profiles:user_id(email, full_name)')
      .not('next_maintenance_date', 'is', null)
      .lte('next_maintenance_date', threeDaysStr);

    if (maintError) {
      console.error("Error fetching maintenances:", maintError);
    } else if (dueMaintenances && dueMaintenances.length > 0) {
      console.log(`Found ${dueMaintenances.length} infrastructures with upcoming maintenance`);
      
      for (const infra of dueMaintenances) {
        const profile = infra.profiles as { email: string; full_name: string } | null;
        const unit = infra.production_units as { name: string; user_id: string } | null;
        if (!profile?.email) continue;

        const isOverdue = new Date(infra.next_maintenance_date) < today;

        await supabase.from('notifications').insert({
          user_id: infra.user_id,
          title: isOverdue ? '🔴 Maintenance en retard' : '🔧 Maintenance programmée',
          message: `${infra.name}${unit ? ` (${unit.name})` : ''}: maintenance prévue le ${infra.next_maintenance_date}`,
          type: isOverdue ? 'error' : 'info',
          module: 'Infrastructures',
          is_critical: isOverdue,
          metadata: { infrastructure_id: infra.id, name: infra.name }
        });

        if (isOverdue) {
          try {
            await resend.emails.send({
              from: "AquaPilote <onboarding@resend.dev>",
              to: [profile.email],
              subject: `🔧 Maintenance en retard - ${infra.name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">🔧 Maintenance en retard</h1>
                  </div>
                  <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                    <p>Bonjour <strong>${profile.full_name || 'Utilisateur'}</strong>,</p>
                    <p>Une maintenance programmée est en retard:</p>
                    <div style="background: #fff7ed; padding: 15px; border-radius: 8px; margin: 15px 0;">
                      <p><strong>Infrastructure:</strong> ${infra.name}</p>
                      ${unit ? `<p><strong>Unité:</strong> ${unit.name}</p>` : ''}
                      <p><strong>Date prévue:</strong> ${infra.next_maintenance_date}</p>
                      ${infra.maintenance_notes ? `<p><strong>Notes:</strong> ${infra.maintenance_notes}</p>` : ''}
                    </div>
                    <p>Effectuez cette maintenance pour assurer le bon fonctionnement de vos équipements.</p>
                  </div>
                </div>
              `
            });
            alertsSent++;
          } catch (emailErr) {
            console.error("Error sending maintenance alert email:", emailErr);
          }
        }
      }
    }

    console.log(`Payment/Maintenance alerts complete. Sent ${alertsSent} email(s)`);

    return new Response(
      JSON.stringify({
        message: "Successfully processed payment and maintenance alerts",
        alerts_sent: alertsSent,
        sales_checked: dueSales?.length || 0,
        purchases_checked: duePurchases?.length || 0,
        maintenances_checked: dueMaintenances?.length || 0,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in payment-maintenance-alerts function:", error);
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
