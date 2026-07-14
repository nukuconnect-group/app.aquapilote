import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Send reminders at J-7, J-3, J-0 before subscription end_date.
 * Creates in-app notifications and triggers e-mails via send-notification-email.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Scheduler auth (fixes OPEN_ENDPOINTS: open_sub_lifecycle)
    const expectedToken = Deno.env.get("CRON_SECRET_TOKEN");
    const authHeader = req.headers.get("Authorization") || "";
    const provided = authHeader.replace(/^Bearer\s+/i, "");
    if (!expectedToken || provided !== expectedToken) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const internalSecret = expectedToken;

    const today = new Date();
    const results: Record<string, number> = {};

    for (const daysBefore of [7, 3, 0]) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysBefore);
      const target = targetDate.toISOString().slice(0, 10);

      const { data: subs, error } = await admin
        .from("subscriptions")
        .select("id, user_id, plan, end_date")
        .in("status", ["trial", "active"])
        .eq("end_date", target);

      if (error) throw error;
      if (!subs || subs.length === 0) {
        results[`j-${daysBefore}`] = 0;
        continue;
      }

      const label =
        daysBefore === 0
          ? "Votre abonnement expire aujourd'hui"
          : `Votre abonnement expire dans ${daysBefore} jours`;

      const notifs = subs.map((s: any) => ({
        user_id: s.user_id,
        title: `⏰ ${label}`,
        message: `Souscrivez à un plan pour ne pas perdre l'accès à AquaPilote.`,
        type: daysBefore === 0 ? "warning" : "info",
        module: "Abonnement",
        is_critical: daysBefore === 0,
        metadata: { subscription_id: s.id, days_before: daysBefore },
      }));
      await admin.from("notifications").insert(notifs);

      // Fire emails (fire-and-forget)
      for (const s of subs) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": internalSecret,
            },
            body: JSON.stringify({
              kind: "generic",
              user_id: s.user_id,
              title: label,
              message: `Votre abonnement AquaPilote (${s.plan}) ${daysBefore === 0 ? "expire aujourd'hui" : `expire dans ${daysBefore} jours`}. Souscrivez à un plan pour continuer à utiliser toutes les fonctionnalités.`,
            }),
          });
        } catch (mailErr) {
          console.error("Email send failed for user", s.user_id, mailErr);
        }
      }

      results[`j-${daysBefore}`] = subs.length;
    }

    return new Response(
      JSON.stringify({ ok: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("subscription-reminders error", e);
    return new Response(JSON.stringify({ error: e.message || "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
